const mongoose = require('mongoose');
const Team = require('../models/team.model');
const AppError = require('../utils/app-error');

const addMemberWithinCapacity = async (teamId, userId) => {
  const member = { user: new mongoose.Types.ObjectId(userId), role: 'member', joinedAt: new Date() };
  const team = await Team.findOneAndUpdate(
    {
      _id: teamId,
      status: 'recruiting',
      'members.user': { $ne: member.user },
      $expr: { $lt: [{ $size: '$members' }, '$maxMembers'] },
    },
    [
      {
        $set: {
          members: { $concatArrays: ['$members', [member]] },
          status: {
            $cond: [
              { $gte: [{ $add: [{ $size: '$members' }, 1] }, '$maxMembers'] },
              'full',
              'recruiting',
            ],
          },
        },
      },
    ],
    { new: true }
  );

  if (team) return team;

  const currentTeam = await Team.findById(teamId).select('members maxMembers status').lean();
  if (!currentTeam) throw new AppError('Không tìm thấy nhóm', 404);
  if (currentTeam.members.some((item) => item.user.toString() === userId.toString())) {
    throw new AppError('Sinh viên đã là thành viên của nhóm này', 409);
  }
  if (currentTeam.status === 'closed') throw new AppError('Nhóm đã đóng', 400);
  throw new AppError('Nhóm đã đủ số lượng thành viên', 409);
};

module.exports = { addMemberWithinCapacity };
