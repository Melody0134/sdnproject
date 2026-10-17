const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const joinRequestController = require('../controllers/join-request.controller');

const router = express.Router();

router.use(protect);

router.get('/mine', restrictTo('student'), joinRequestController.listMyJoinRequests);
router.post('/:requestId/cancel', restrictTo('student'), joinRequestController.cancelJoinRequest);

module.exports = router;
