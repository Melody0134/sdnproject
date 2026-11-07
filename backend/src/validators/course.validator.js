const Joi = require('joi');

const createCourseSchema = Joi.object({
  code: Joi.string().min(2).max(20).required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).allow(''),
  semester: Joi.string().max(40).allow(''),
  lecturer: Joi.string().hex().length(24),
});

const updateCourseSchema = Joi.object({
  code: Joi.string().min(2).max(20),
  title: Joi.string().min(3).max(200),
  description: Joi.string().max(2000).allow(''),
  semester: Joi.string().max(40).allow(''),
  isActive: Joi.boolean(),
  lecturer: Joi.string().hex().length(24),
}).min(1);

const listCoursesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().max(100).allow(''),
  mine: Joi.string().valid('true', 'false'),
  enrolled: Joi.string().valid('true', 'false'),
});

module.exports = { createCourseSchema, updateCourseSchema, listCoursesQuerySchema };
