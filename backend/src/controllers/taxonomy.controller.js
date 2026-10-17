const asyncHandler = require('../utils/async-handler');
const taxonomyService = require('../services/taxonomy.service');

const listTaxonomies = asyncHandler(async (req, res) => {
  const result = await taxonomyService.listTaxonomies(req.query);
  res.status(200).json({ success: true, ...result });
});

const createTaxonomy = asyncHandler(async (req, res) => {
  const taxonomy = await taxonomyService.createTaxonomy(req.body);
  res.status(201).json({ success: true, data: { taxonomy } });
});

const updateTaxonomy = asyncHandler(async (req, res) => {
  const taxonomy = await taxonomyService.updateTaxonomy(req.params.id, req.body);
  res.status(200).json({ success: true, data: { taxonomy } });
});

const deleteTaxonomy = asyncHandler(async (req, res) => {
  await taxonomyService.deleteTaxonomy(req.params.id);
  res.status(204).send();
});

module.exports = { listTaxonomies, createTaxonomy, updateTaxonomy, deleteTaxonomy };
