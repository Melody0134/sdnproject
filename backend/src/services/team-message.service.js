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
  const team = await assertMembership(teamId, requester);
  const message = await TeamMessage.create({ team: teamId, sender: requester.id, content });

  const notificationService = require('./notification.service');
  const recipientIds = (team.members || [])
    .map((m) => m.user.toString())
    .filter((uid) => uid !== requester.id.toString());

  for (const recipientId of recipientIds) {
    await notificationService.notify({
      recipient: recipientId,
      type: 'team_message_received',
      message: `${requester.name || 'Thành viên'} đã gửi tin nhắn trong nhóm`,
      link: `/teams/${teamId}`,
    });
  }

  return TeamMessage.findById(message._id).populate('sender', 'name avatarUrl').lean();
};

const deleteMessage = async (teamId, messageId, requester) => {
  const team = await assertMembership(teamId, requester);
  const message = await TeamMessage.findOne({ _id: messageId, team: teamId });
  if (!message) throw new AppError('Không tìm thấy tin nhắn', 404);

  const isSender = message.sender.toString() === requester.id.toString();
  const isLeader = team.leader?.toString() === requester.id.toString();
  if (!isSender && !isLeader && requester.role !== 'admin') {
    throw new AppError('Bạn không có quyền xóa tin nhắn này', 403);
  }

  await TeamMessage.deleteOne({ _id: messageId });
  return { success: true };
};

module.exports = { listMessages, sendMessage, deleteMessage };
