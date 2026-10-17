const Team = require('../models/team.model');
const JoinRequest = require('../models/join-request.model');
const AppError = require('../utils/app-error');
const notificationService = require('./notification.service');
const { addMemberWithinCapacity } = require('./team-member.service');
const { parsePagination, buildPageResult } = require('../utils/pagination');

const createJoinRequest = async (teamId, applicantId, message) => {
  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  if (team.status !== 'recruiting') throw new AppError('Nhóm này hiện không nhận thêm thành viên', 400);
  if (team.isMember(applicantId)) throw new AppError('Bạn đã là thành viên của nhóm này', 400);

  let joinRequest;
  try {
    joinRequest = await JoinRequest.create({ team: teamId, applicant: applicantId, message });
  } catch (err) {
    if (err.code === 11000) throw new AppError('Bạn đã có một yêu cầu đang chờ xử lý với nhóm này', 409);
    throw err;
  }

  await notificationService.notify({
    recipient: team.leader,
    type: 'join_request_received',
    message: 'Một sinh viên vừa gửi yêu cầu tham gia nhóm của bạn',
    link: `/teams/${teamId}`,
  });

  return joinRequest;
};

const listMyJoinRequests = async (applicantId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { applicant: applicantId };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    JoinRequest.find(filter)
      .populate('team', 'name status major topic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JoinRequest.countDocuments(filter),
  ]);

  return buildPageResult(items, total, page, limit);
};

const listTeamJoinRequests = async (teamId, leaderId, query) => {
  const team = await Team.findById(teamId).lean();
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  if (team.leader.toString() !== leaderId.toString()) {
    throw new AppError('Chỉ trưởng nhóm mới có thể xem danh sách yêu cầu tham gia', 403);
  }

  const { page, limit, skip } = parsePagination(query);
  const filter = { team: teamId };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    JoinRequest.find(filter)
      .populate('applicant', 'name avatarUrl major gpa skills interests description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JoinRequest.countDocuments(filter),
  ]);

  return buildPageResult(items, total, page, limit);
};

const decideJoinRequest = async (requestId, leaderId, decision) => {
  const joinRequest = await JoinRequest.findById(requestId);
  if (!joinRequest) throw new AppError('Không tìm thấy yêu cầu tham gia', 404);
  if (joinRequest.status !== 'pending') throw new AppError('Yêu cầu này đã được xử lý trước đó', 400);

  const team = await Team.findById(joinRequest.team);
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  if (team.leader.toString() !== leaderId.toString()) {
    throw new AppError('Chỉ trưởng nhóm mới có thể duyệt yêu cầu tham gia', 403);
  }

  if (decision === 'accepted') {
    await addMemberWithinCapacity(team._id, joinRequest.applicant);
  }

  joinRequest.status = decision;
  joinRequest.decidedAt = new Date();
  joinRequest.decidedBy = leaderId;
  await joinRequest.save();

  await notificationService.notify({
    recipient: joinRequest.applicant,
    type: decision === 'accepted' ? 'join_request_accepted' : 'join_request_rejected',
    message: `Yêu cầu tham gia nhóm "${team.name}" của bạn đã ${decision === 'accepted' ? 'được chấp nhận' : 'bị từ chối'}`,
    link: `/teams/${team._id}`,
  });

  return joinRequest;
};

const cancelJoinRequest = async (requestId, applicantId) => {
  const joinRequest = await JoinRequest.findById(requestId);
  if (!joinRequest) throw new AppError('Không tìm thấy yêu cầu tham gia', 404);
  if (joinRequest.applicant.toString() !== applicantId.toString()) {
    throw new AppError('Bạn chỉ có thể hủy yêu cầu của chính mình', 403);
  }
  if (joinRequest.status !== 'pending') throw new AppError('Yêu cầu này không thể hủy được nữa', 400);

  joinRequest.status = 'cancelled';
  await joinRequest.save();
  return joinRequest;
};

module.exports = {
  createJoinRequest,
  listMyJoinRequests,
  listTeamJoinRequests,
  decideJoinRequest,
  cancelJoinRequest,
};
