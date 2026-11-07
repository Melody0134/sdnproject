const Joi = require('joi');

const uploadMaterialSchema = Joi.object({
  course: Joi.string().hex().length(24).required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).allow(''),
});

const updateMaterialSchema = Joi.object({
  course: Joi.string().hex().length(24),
  title: Joi.string().min(2).max(200),
  description: Joi.string().max(1000).allow(''),
}).min(1);

const listMaterialsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  course: Joi.string().hex().length(24),
  search: Joi.string().max(100).allow(''),
});

module.exports = { uploadMaterialSchema, updateMaterialSchema, listMaterialsQuerySchema };
