const express = require('express');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const clubController = require('../controllers/club.controller');
const { listClubsQuerySchema, idParamsSchema } = require('../validators/admin.validator');

const router = express.Router();

router.use(protect);

router.get('/', validate(listClubsQuerySchema, 'query'), clubController.listClubs);
router.get('/:id', validate(idParamsSchema, 'params'), clubController.getClub);

module.exports = router;

