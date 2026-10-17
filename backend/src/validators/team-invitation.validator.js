const Joi = require('joi');

const createInvitationSchema = Joi.object({
  inviteeId: Joi.string().hex().length(24).required(),
  message: Joi.string().max(500).allow(''),
});

const listInvitationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  status: Joi.string().valid('pending', 'accepted', 'rejected'),
});

const invitationIdParamsSchema = Joi.object({
  invitationId: Joi.string().hex().length(24).required(),
});

module.exports = { createInvitationSchema, listInvitationsQuerySchema, invitationIdParamsSchema };
