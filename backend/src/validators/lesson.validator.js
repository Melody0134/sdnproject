const Joi = require('joi');

const createLessonSchema = Joi.object({
  course: Joi.string().hex().length(24).required(),
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().max(10000).allow(''),
  order: Joi.number().integer().min(0),
  materials: Joi.array().items(Joi.string().hex().length(24)).max(20),
  quiz: Joi.string().hex().length(24).allow(null, ''),
});

const updateLessonSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  content: Joi.string().max(10000).allow(''),
  order: Joi.number().integer().min(0),
  materials: Joi.array().items(Joi.string().hex().length(24)).max(20),
  quiz: Joi.string().hex().length(24).allow(null, ''),
}).min(1);

const listLessonsQuerySchema = Joi.object({
  course: Joi.string().hex().length(24).required(),
});

module.exports = { createLessonSchema, updateLessonSchema, listLessonsQuerySchema };
