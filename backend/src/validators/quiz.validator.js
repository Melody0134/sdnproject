const Joi = require('joi');

const questionSchema = Joi.object({
  questionText: Joi.string().min(3).max(500).required(),
  options: Joi.array().items(Joi.string().max(200)).min(2).max(6).required(),
  correctIndexes: Joi.array().items(Joi.number().integer().min(0)).min(1).unique().required(),
});

const createQuizSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  course: Joi.string().hex().length(24).allow(null),
  questions: Joi.array().items(questionSchema).min(1).max(50).required(),
});

const updateQuizSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  course: Joi.string().hex().length(24).allow(null),
  questions: Joi.array().items(questionSchema).min(1).max(50),
  isPublished: Joi.boolean(),
}).min(1);

const submitAttemptSchema = Joi.object({
  answers: Joi.array().items(Joi.array().items(Joi.number().integer().min(0))).required(),
});

const listQuizzesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  course: Joi.string().hex().length(24),
  mine: Joi.string().valid('true', 'false'),
});

module.exports = {
  createQuizSchema,
  updateQuizSchema,
  submitAttemptSchema,
  listQuizzesQuerySchema,
};
