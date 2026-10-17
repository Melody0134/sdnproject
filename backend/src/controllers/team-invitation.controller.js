const asyncHandler = require('../utils/async-handler');
const teamInvitationService = require('../services/team-invitation.service');

const createInvitation = asyncHandler(async (req, res) => {
  const invitation = await teamInvitationService.createInvitation(req.params.id, req.user.id, req.body);
  res.status(201).json({ success: true, data: { invitation } });
});

const listTeamInvitations = asyncHandler(async (req, res) => {
  const result = await teamInvitationService.listTeamInvitations(req.params.id, req.user.id, req.query);
  res.status(200).json({ success: true, ...result });
});

const listMyInvitations = asyncHandler(async (req, res) => {
  const result = await teamInvitationService.listMyInvitations(req.user.id, req.query);
  res.status(200).json({ success: true, ...result });
});

const acceptInvitation = asyncHandler(async (req, res) => {
  const invitation = await teamInvitationService.decideInvitation(req.params.invitationId, req.user.id, 'accepted');
  res.status(200).json({ success: true, data: { invitation } });
});

const rejectInvitation = asyncHandler(async (req, res) => {
  const invitation = await teamInvitationService.decideInvitation(req.params.invitationId, req.user.id, 'rejected');
  res.status(200).json({ success: true, data: { invitation } });
});

module.exports = { createInvitation, listTeamInvitations, listMyInvitations, acceptInvitation, rejectInvitation };
