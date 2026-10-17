const express = require('express');
const { protect } = require('../middleware/auth');
const calendarController = require('../controllers/calendar.controller');

const router = express.Router();

router.use(protect);

router.get('/upcoming', calendarController.getUpcoming);

module.exports = router;
