const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  listInvitationsQuerySchema,
  invitationIdParamsSchema,
} = require('../validators/team-invitation.validator');
const teamInvitationController = require('../controllers/team-invitation.controller');

const router = express.Router();

router.use(protect, restrictTo('student'));

router.get('/mine', validate(listInvitationsQuerySchema, 'query'), teamInvitationController.listMyInvitations);
router.post(
  '/:invitationId/accept',
  validate(invitationIdParamsSchema, 'params'),
  teamInvitationController.acceptInvitation
);
router.post(
  '/:invitationId/reject',
  validate(invitationIdParamsSchema, 'params'),
  teamInvitationController.rejectInvitation
);

module.exports = router;
