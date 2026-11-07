const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const adminController = require('../controllers/admin.controller');
const clubController = require('../controllers/club.controller');
const taxonomyController = require('../controllers/taxonomy.controller');
const {
  idParamsSchema,
  createClubSchema,
  updateClubSchema,
  listClubsQuerySchema,
  listClubRegistrationsQuerySchema,
  rejectClubRegistrationSchema,
  createTaxonomySchema,
  updateTaxonomySchema,
  listTaxonomiesQuerySchema,
  reportQuerySchema,
  updateSystemSettingSchema,
} = require('../validators/admin.validator');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', adminController.getSystemStats);
router.get('/activity', adminController.getRecentActivity);
router.get('/reports', validate(reportQuerySchema, 'query'), adminController.generateReport);
router.get('/settings', adminController.getSystemSetting);
router.patch('/settings', validate(updateSystemSettingSchema), adminController.updateSystemSetting);
router.get('/clubs', validate(listClubsQuerySchema, 'query'), clubController.listClubs);
router.post('/clubs', validate(createClubSchema), clubController.createClub);
router.get('/clubs/:id', validate(idParamsSchema, 'params'), clubController.getClub);
router.patch('/clubs/:id', validate(idParamsSchema, 'params'), validate(updateClubSchema), clubController.updateClub);
router.delete('/clubs/:id', validate(idParamsSchema, 'params'), clubController.deleteClub);
router.get('/club-registrations', validate(listClubRegistrationsQuerySchema, 'query'), clubController.listRegistrations);
router.post('/club-registrations/:id/approve', validate(idParamsSchema, 'params'), clubController.approveRegistration);
router.post(
  '/club-registrations/:id/reject',
  validate(idParamsSchema, 'params'),
  validate(rejectClubRegistrationSchema),
  clubController.rejectRegistration
);
router.get('/taxonomies', validate(listTaxonomiesQuerySchema, 'query'), taxonomyController.listTaxonomies);
router.post('/taxonomies', validate(createTaxonomySchema), taxonomyController.createTaxonomy);
router.patch('/taxonomies/:id', validate(idParamsSchema, 'params'), validate(updateTaxonomySchema), taxonomyController.updateTaxonomy);
router.delete('/taxonomies/:id', validate(idParamsSchema, 'params'), taxonomyController.deleteTaxonomy);

module.exports = router;
