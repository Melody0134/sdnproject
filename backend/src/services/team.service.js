const mongoose = require('mongoose');
const Team = require('../models/team.model');
const User = require('../models/user.model');
const JoinRequest = require('../models/join-request.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const { rankTeamsForStudent, rankCandidatesForTeam } = require('./matching.service');
const { addMemberWithinCapacity } = require('./team-member.service');

const TEAM_LIST_PROJECTION = 'name description topic major skillsNeeded leader members maxMembers status createdAt';
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createTeam = async (leaderId, payload) => {
  const team = await Team.create({
    ...payload,
    leader: leaderId,
    members: [{ user: leaderId, role: 'leader' }],
  });
  return team;
};

const listTeams = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.major) filter.major = new RegExp(`^${escapeRegex(query.major)}$`, 'i');
  if (query.skill) filter.skillsNeeded = query.skill.toLowerCase();
  if (query.search) filter.$text = { $search: query.search };

  const [teams, total] = await Promise.all([
    Team.find(filter)
      .select(TEAM_LIST_PROJECTION)
      .populate('leader', 'name avatarUrl major')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Team.countDocuments(filter),
  ]);

  return buildPageResult(teams, total, page, limit);
};

const getTeamById = async (teamId) => {
  const team = await Team.findById(teamId)
    .populate('leader', 'name avatarUrl major email')
    .populate('members.user', 'name avatarUrl major skills')
    .lean();
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  return team;
};

const assertLeader = (team, userId) => {
  if (team.leader.toString() !== userId.toString()) {
    throw new AppError('Chỉ trưởng nhóm mới có thể thực hiện hành động này', 403);
  }
};

const updateTeam = async (teamId, userId, updates) => {
  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  assertLeader(team, userId);

  if (updates.maxMembers !== undefined && updates.maxMembers < team.members.length) {
    throw new AppError('Số thành viên tối đa không thể nhỏ hơn số thành viên hiện tại', 422);
  }

  Object.assign(team, updates);
  team.syncStatus();
  await team.save();
  return team;
};

const deleteTeam = async (teamId, requester) => {
  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  if (team.leader.toString() !== requester.id.toString() && requester.role !== 'admin') {
    throw new AppError('Chỉ trưởng nhóm hoặc quản trị viên mới có thể xóa nhóm này', 403);
  }
  await Promise.all([Team.deleteOne({ _id: teamId }), JoinRequest.deleteMany({ team: teamId })]);
};

const listMyTeams = async (userId) => {
  return Team.find({ 'members.user': userId })
    .select(TEAM_LIST_PROJECTION)
    .populate('leader', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .lean();
};

const removeMember = async (teamId, leaderId, memberId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  assertLeader(team, leaderId);
  if (memberId === leaderId.toString()) {
    throw new AppError('Không thể xóa trưởng nhóm khỏi nhóm', 400);
  }
  team.members = team.members.filter((m) => m.user.toString() !== memberId);
  team.syncStatus();
  await team.save();
  return team;
};

const leaveTeam = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  if (team.leader.toString() === userId.toString()) {
    throw new AppError('Hãy chuyển quyền trưởng nhóm trước khi rời nhóm, hoặc xóa nhóm', 400);
  }
  if (!team.isMember(userId)) {
    throw new AppError('Bạn không phải là thành viên của nhóm này', 400);
  }
  team.members = team.members.filter((m) => m.user.toString() !== userId.toString());
  team.syncStatus();
  await team.save();
  return team;
};

const getRecommendedTeams = async (student, limit = 10) => {
  const orConditions = [];
  if (student.major) orConditions.push({ major: new RegExp(`^${escapeRegex(student.major)}$`, 'i') });
  if (student.skills?.length) orConditions.push({ skillsNeeded: { $in: student.skills.map((s) => s.toLowerCase()) } });

  const filter = { status: 'recruiting', 'members.user': { $ne: new mongoose.Types.ObjectId(student.id) } };
  if (orConditions.length) filter.$or = orConditions;

  const candidateTeams = await Team.find(filter)
    .select(TEAM_LIST_PROJECTION)
    .populate('leader', 'name avatarUrl gpa')
    .limit(100)
    .lean();

  const enriched = candidateTeams.map((team) => ({ ...team, leaderGpa: team.leader?.gpa ?? null }));
  return rankTeamsForStudent(student, enriched, limit);
};

const getRecommendedTeammates = async (teamId, requester, limit = 10) => {
  const team = await Team.findById(teamId).lean();
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  assertLeader(team, requester.id);

  const memberIds = team.members.map((m) => m.user);
  const filter = {
    role: 'student',
    isActive: true,
    _id: { $nin: memberIds },
  };
  if (team.skillsNeeded?.length) {
    filter.skills = { $in: team.skillsNeeded };
  }

  const candidates = await User.find(filter)
    .select('name avatarUrl major gpa skills interests description')
    .limit(100)
    .lean();

  return rankCandidatesForTeam(team, candidates, limit);
};

module.exports = {
  createTeam,
  listTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  listMyTeams,
  removeMember,
  leaveTeam,
  getRecommendedTeams,
  getRecommendedTeammates,
  assertLeader,
  addMemberWithinCapacity,
};
