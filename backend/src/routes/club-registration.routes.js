const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const clubController = require('../controllers/club.controller');
const { createClubRegistrationSchema, listClubRegistrationsQuerySchema } = require('../validators/admin.validator');

const router = express.Router();

router.use(protect, restrictTo('student', 'club_leader'));
router.get('/mine', validate(listClubRegistrationsQuerySchema, 'query'), clubController.listMyRegistrations);
router.post('/', validate(createClubRegistrationSchema), clubController.createRegistration);

module.exports = router;
