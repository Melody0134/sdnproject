const Joi = require('joi');

const createAnnouncementSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(3).max(5000).required(),
  scope: Joi.string().valid('global', 'course').default('global'),
  course: Joi.string().hex().length(24).when('scope', { is: 'course', then: Joi.required(), otherwise: Joi.valid(null) }),
  audience: Joi.string().valid('all', 'students', 'lecturers').default('all'),
});

const updateAnnouncementSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  content: Joi.string().min(3).max(5000),
  audience: Joi.string().valid('all', 'students', 'lecturers'),
  status: Joi.string().valid('published', 'hidden'),
}).min(1);

const listAnnouncementsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().trim().min(2).max(100),
  scope: Joi.string().valid('global', 'course'),
  course: Joi.string().hex().length(24),
});

const announcementIdParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  listAnnouncementsQuerySchema,
  announcementIdParamsSchema,
};
