const Joi = require('joi');

const listParticipantsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const participantParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  userId: Joi.string().hex().length(24).required(),
});

module.exports = { listParticipantsQuerySchema, participantParamsSchema };
