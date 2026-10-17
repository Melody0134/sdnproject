const asyncHandler = require('../utils/async-handler');
const searchService = require('../services/search.service');

const globalSearch = asyncHandler(async (req, res) => {
  const results = await searchService.globalSearch(req.query.q, req.user);
  res.status(200).json({ success: true, data: results });
});

module.exports = { globalSearch };
