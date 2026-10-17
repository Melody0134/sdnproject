const asyncHandler = require('../utils/async-handler');
const gamificationService = require('../services/gamification.service');

const getLeaderboard = asyncHandler(async (req, res) => {
  const result = await gamificationService.getLeaderboard(req.user);
  res.status(200).json({ success: true, data: result });
});

module.exports = { getLeaderboard };
