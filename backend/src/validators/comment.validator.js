const Joi = require('joi');

const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});

const listCommentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

module.exports = { createCommentSchema, listCommentsQuerySchema };
