const asyncHandler = require('../utils/async-handler');
const eventService = require('../services/event.service');

const registerForEvent = asyncHandler(async (req, res) => {
  const registration = await eventService.registerForEvent(req.params.id, req.user.id);
  res.status(201).json({ success: true, data: { registration } });
});

const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await eventService.cancelRegistration(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { registration } });
});

const listParticipants = asyncHandler(async (req, res) => {
  const result = await eventService.listParticipants(req.params.id, req.user, req.query);
  res.status(200).json({ success: true, ...result });
});

const removeParticipant = asyncHandler(async (req, res) => {
  const registration = await eventService.removeParticipant(req.params.id, req.params.userId, req.user);
  res.status(200).json({ success: true, data: { registration } });
});

module.exports = { registerForEvent, cancelRegistration, listParticipants, removeParticipant };
