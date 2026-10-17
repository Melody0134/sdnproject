const Joi = require('joi');

const listNotificationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  unreadOnly: Joi.string().valid('true', 'false'),
});

const sendNotificationSchema = Joi.object({
  recipient: Joi.string().hex().length(24),
  audience: Joi.string().valid('all', 'student', 'lecturer', 'admin', 'club_leader'),
  message: Joi.string().trim().min(1).max(300).required(),
  link: Joi.string().max(500).allow('').default(''),
}).xor('recipient', 'audience');

const notificationIdParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

module.exports = {
  listNotificationsQuerySchema,
  sendNotificationSchema,
  notificationIdParamsSchema,
};
