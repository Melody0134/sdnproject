const express = require('express');
const { protect } = require('../middleware/auth');
const searchController = require('../controllers/search.controller');

const router = express.Router();

router.use(protect);

router.get('/', searchController.globalSearch);

module.exports = router;
