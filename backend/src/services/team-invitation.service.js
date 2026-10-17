const Team = require('../models/team.model');
const User = require('../models/user.model');
const TeamInvitation = require('../models/team-invitation.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const { assertLeader } = require('./team.service');
const { addMemberWithinCapacity } = require('./team-member.service');
const notificationService = require('./notification.service');

const createInvitation = async (teamId, leaderId, payload) => {
  const [team, invitee] = await Promise.all([
    Team.findById(teamId),
    User.findOne({ _id: payload.inviteeId, role: 'student', isActive: true }).select('_id').lean(),
  ]);
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  assertLeader(team, leaderId);
  if (!invitee) throw new AppError('Không tìm thấy sinh viên đang hoạt động', 404);
  if (team.status !== 'recruiting' || team.members.length >= team.maxMembers) {
    throw new AppError('Nhóm hiện không thể nhận thêm thành viên', 400);
  }
  if (team.isMember(invitee._id)) throw new AppError('Sinh viên đã là thành viên của nhóm này', 409);

  let invitation;
  try {
    invitation = await TeamInvitation.create({
      team: teamId,
      invitee: invitee._id,
      invitedBy: leaderId,
      message: payload.message,
    });
  } catch (error) {
    if (error.code === 11000) throw new AppError('Sinh viên đã có lời mời đang chờ từ nhóm này', 409);
    throw error;
  }

  await notificationService.notify({
    recipient: invitee._id,
    type: 'team_invitation_received',
    message: `Bạn nhận được lời mời tham gia nhóm "${team.name}"`,
    link: `/teams/${team._id}`,
  });
  return invitation;
};

const listTeamInvitations = async (teamId, leaderId, query) => {
  const team = await Team.findById(teamId).select('leader').lean();
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  assertLeader(team, leaderId);

  const { page, limit, skip } = parsePagination(query);
  const filter = { team: teamId };
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    TeamInvitation.find(filter)
      .select('team invitee invitedBy message status decidedAt createdAt')
      .populate('invitee', 'name avatarUrl major gpa skills interests description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TeamInvitation.countDocuments(filter),
  ]);
  return buildPageResult(items, total, page, limit);
};

const listMyInvitations = async (inviteeId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { invitee: inviteeId };
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    TeamInvitation.find(filter)
      .select('team invitee invitedBy message status decidedAt createdAt')
      .populate('team', 'name description topic major skillsNeeded maxMembers status leader')
      .populate('invitedBy', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TeamInvitation.countDocuments(filter),
  ]);
  return buildPageResult(items, total, page, limit);
};

const decideInvitation = async (invitationId, inviteeId, decision) => {
  const invitation = await TeamInvitation.findOneAndUpdate(
    { _id: invitationId, invitee: inviteeId, status: 'pending' },
    { status: decision, decidedAt: new Date() },
    { new: true }
  );
  if (!invitation) throw new AppError('Không tìm thấy lời mời đang chờ xử lý', 404);

  const team = await Team.findById(invitation.team).select('name leader').lean();
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  if (decision === 'accepted') {
    try {
      await addMemberWithinCapacity(invitation.team, inviteeId);
    } catch (error) {
      await TeamInvitation.updateOne(
        { _id: invitationId, invitee: inviteeId, status: 'accepted' },
        { status: 'pending', decidedAt: null }
      );
      throw error;
    }
  }

  await notificationService.notify({
    recipient: team.leader,
    type: decision === 'accepted' ? 'team_invitation_accepted' : 'team_invitation_rejected',
    message: `Lời mời tham gia nhóm "${team.name}" đã ${decision === 'accepted' ? 'được chấp nhận' : 'bị từ chối'}`,
    link: `/teams/${team._id}`,
  });
  return invitation;
};

module.exports = { createInvitation, listTeamInvitations, listMyInvitations, decideInvitation };
