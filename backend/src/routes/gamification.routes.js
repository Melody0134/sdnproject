const express = require('express');
const { protect } = require('../middleware/auth');
const gamificationController = require('../controllers/gamification.controller');

const router = express.Router();

router.use(protect);

router.get('/leaderboard', gamificationController.getLeaderboard);

module.exports = router;
