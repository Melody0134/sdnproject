const Joi = require('joi');

const createTeamSchema = Joi.object({
  name: Joi.string().min(3).max(120).required(),
  description: Joi.string().max(2000).allow(''),
  topic: Joi.string().max(200).allow(''),
  major: Joi.string().max(120).allow(''),
  skillsNeeded: Joi.array().items(Joi.string().max(40)).max(20),
  maxMembers: Joi.number().integer().min(1).max(20),
});

const updateTeamSchema = Joi.object({
  name: Joi.string().min(3).max(120),
  description: Joi.string().max(2000).allow(''),
  topic: Joi.string().max(200).allow(''),
  major: Joi.string().max(120).allow(''),
  skillsNeeded: Joi.array().items(Joi.string().max(40)).max(20),
  maxMembers: Joi.number().integer().min(1).max(20),
  status: Joi.string().valid('recruiting', 'full', 'closed'),
}).min(1);

const searchTeamsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().max(100).allow(''),
  major: Joi.string().max(120).allow(''),
  skill: Joi.string().max(40).allow(''),
  status: Joi.string().valid('recruiting', 'full', 'closed'),
});

const joinRequestSchema = Joi.object({
  message: Joi.string().max(500).allow(''),
});

const decideJoinRequestSchema = Joi.object({
  decision: Joi.string().valid('accepted', 'rejected').required(),
});

const addLinkResourceSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  linkUrl: Joi.string().uri().required(),
});

const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

module.exports = {
  createTeamSchema,
  updateTeamSchema,
  searchTeamsQuerySchema,
  joinRequestSchema,
  decideJoinRequestSchema,
  addLinkResourceSchema,
  sendMessageSchema,
};
