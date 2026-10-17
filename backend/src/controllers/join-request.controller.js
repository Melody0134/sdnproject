const asyncHandler = require('../utils/async-handler');
const joinRequestService = require('../services/join-request.service');

const createJoinRequest = asyncHandler(async (req, res) => {
  const joinRequest = await joinRequestService.createJoinRequest(req.params.id, req.user.id, req.body.message);
  res.status(201).json({ success: true, data: { joinRequest } });
});

const listMyJoinRequests = asyncHandler(async (req, res) => {
  const result = await joinRequestService.listMyJoinRequests(req.user.id, req.query);
  res.status(200).json({ success: true, ...result });
});

const listTeamJoinRequests = asyncHandler(async (req, res) => {
  const result = await joinRequestService.listTeamJoinRequests(req.params.id, req.user.id, req.query);
  res.status(200).json({ success: true, ...result });
});

const decideJoinRequest = asyncHandler(async (req, res) => {
  const joinRequest = await joinRequestService.decideJoinRequest(req.params.requestId, req.user.id, req.body.decision);
  res.status(200).json({ success: true, data: { joinRequest } });
});

const cancelJoinRequest = asyncHandler(async (req, res) => {
  const joinRequest = await joinRequestService.cancelJoinRequest(req.params.requestId, req.user.id);
  res.status(200).json({ success: true, data: { joinRequest } });
});

module.exports = {
  createJoinRequest,
  listMyJoinRequests,
  listTeamJoinRequests,
  decideJoinRequest,
  cancelJoinRequest,
};
