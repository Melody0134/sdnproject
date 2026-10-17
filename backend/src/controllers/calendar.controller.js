const asyncHandler = require('../utils/async-handler');
const calendarService = require('../services/calendar.service');

const getUpcoming = asyncHandler(async (req, res) => {
  const items = await calendarService.getUpcoming(req.user);
  res.status(200).json({ success: true, data: items });
});

module.exports = { getUpcoming };
