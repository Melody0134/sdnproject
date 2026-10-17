const asyncHandler = require('../utils/async-handler');
const notificationService = require('../services/notification.service');

const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.listForUser(req.user.id, req.query);
  res.status(200).json({ success: true, ...result });
});

const markRead = asyncHandler(async (req, res) => {
  await notificationService.markRead(req.user.id, req.params.id);
  res.status(200).json({ success: true });
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  res.status(200).json({ success: true });
});

const sendNotification = asyncHandler(async (req, res) => {
  const recipientCount = await notificationService.sendByAdmin(req.body);
  res.status(201).json({ success: true, data: { recipientCount } });
});

module.exports = { listNotifications, markRead, markAllRead, sendNotification };
