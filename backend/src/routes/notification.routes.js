const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  listNotificationsQuerySchema,
  sendNotificationSchema,
  notificationIdParamsSchema,
} = require('../validators/notification.validator');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

router.use(protect);

router.get('/', validate(listNotificationsQuerySchema, 'query'), notificationController.listNotifications);
router.post('/send', restrictTo('admin'), validate(sendNotificationSchema), notificationController.sendNotification);
router.post('/read-all', notificationController.markAllRead);
router.post('/:id/read', validate(notificationIdParamsSchema, 'params'), notificationController.markRead);

module.exports = router;
