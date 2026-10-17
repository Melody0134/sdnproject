const asyncHandler = require('../utils/async-handler');
const teamMessageService = require('../services/team-message.service');

const listMessages = asyncHandler(async (req, res) => {
  const messages = await teamMessageService.listMessages(req.params.id, req.user, req.query);
  res.status(200).json({ success: true, data: messages });
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await teamMessageService.sendMessage(req.params.id, req.user, req.body.content);
  res.status(201).json({ success: true, data: { message } });
});

module.exports = { listMessages, sendMessage };
