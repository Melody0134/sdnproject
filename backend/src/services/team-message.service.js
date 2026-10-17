const Team = require('../models/team.model');
const TeamMessage = require('../models/team-message.model');
const AppError = require('../utils/app-error');

const assertMembership = async (teamId, requester) => {
  const team = await Team.findById(teamId).select('members leader').lean();
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  const isMember = team.members.some((m) => m.user.toString() === requester.id.toString());
  if (!isMember && requester.role !== 'admin') {
    throw new AppError('Chỉ thành viên nhóm mới có thể xem trò chuyện', 403);
  }
  return team;
};

const listMessages = async (teamId, requester, query = {}) => {
  await assertMembership(teamId, requester);
  const filter = { team: teamId };
  if (query.after) filter.createdAt = { $gt: new Date(query.after) };

  const messages = await TeamMessage.find(filter)
    .populate('sender', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return messages.reverse();
};

const sendMessage = async (teamId, requester, content) => {
  await assertMembership(teamId, requester);
  const message = await TeamMessage.create({ team: teamId, sender: requester.id, content });
  return TeamMessage.findById(message._id).populate('sender', 'name avatarUrl').lean();
};

module.exports = { listMessages, sendMessage };
