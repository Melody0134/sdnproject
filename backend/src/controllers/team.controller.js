const asyncHandler = require('../utils/async-handler');
const teamService = require('../services/team.service');
const User = require('../models/user.model');

const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.user.id, req.body);
  res.status(201).json({ success: true, data: { team } });
});

const listTeams = asyncHandler(async (req, res) => {
  const result = await teamService.listTeams(req.query);
  res.status(200).json({ success: true, ...result });
});

const getTeam = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamById(req.params.id);
  res.status(200).json({ success: true, data: { team } });
});

const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.updateTeam(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, data: { team } });
});

const deleteTeam = asyncHandler(async (req, res) => {
  await teamService.deleteTeam(req.params.id, req.user);
  res.status(204).send();
});

const listMyTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.listMyTeams(req.user.id);
  res.status(200).json({ success: true, data: { teams } });
});

const removeMember = asyncHandler(async (req, res) => {
  const team = await teamService.removeMember(req.params.id, req.user.id, req.params.userId);
  res.status(200).json({ success: true, data: { team } });
});

const leaveTeam = asyncHandler(async (req, res) => {
  const team = await teamService.leaveTeam(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { team } });
});

const getRecommendedTeams = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user.id).lean();
  const recommendations = await teamService.getRecommendedTeams(
    { ...student, id: student._id.toString() },
    Number(req.query.limit) || 10
  );
  res.status(200).json({ success: true, data: { recommendations } });
});

const getRecommendedTeammates = asyncHandler(async (req, res) => {
  const recommendations = await teamService.getRecommendedTeammates(
    req.params.id,
    req.user,
    Number(req.query.limit) || 10
  );
  res.status(200).json({ success: true, data: { recommendations } });
});

module.exports = {
  createTeam,
  listTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  listMyTeams,
  removeMember,
  leaveTeam,
  getRecommendedTeams,
  getRecommendedTeammates,
};
