const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  listAnnouncementsQuerySchema,
  announcementIdParamsSchema,
} = require('../validators/announcement.validator');
const announcementController = require('../controllers/announcement.controller');

const router = express.Router();

router.use(protect);

router.get('/', validate(listAnnouncementsQuerySchema, 'query'), announcementController.listAnnouncements);
router.post('/', restrictTo('lecturer', 'admin'), validate(createAnnouncementSchema), announcementController.createAnnouncement);
router.post('/broadcast', restrictTo('admin'), validate(createAnnouncementSchema), announcementController.broadcastAnnouncement);
router.patch(
  '/:id',
  restrictTo('lecturer', 'admin'),
  validate(announcementIdParamsSchema, 'params'),
  validate(updateAnnouncementSchema),
  announcementController.updateAnnouncement
);
router.delete(
  '/:id',
  restrictTo('lecturer', 'admin'),
  validate(announcementIdParamsSchema, 'params'),
  announcementController.deleteAnnouncement
);

module.exports = router;
