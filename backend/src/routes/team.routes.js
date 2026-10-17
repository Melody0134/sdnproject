const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { uploadRateLimit } = require('../middleware/rate-limit');
const {
  createTeamSchema,
  updateTeamSchema,
  searchTeamsQuerySchema,
  joinRequestSchema,
  decideJoinRequestSchema,
  addLinkResourceSchema,
  sendMessageSchema,
} = require('../validators/team.validator');
const teamController = require('../controllers/team.controller');
const joinRequestController = require('../controllers/join-request.controller');
const teamResourceController = require('../controllers/team-resource.controller');
const teamMessageController = require('../controllers/team-message.controller');
const teamInvitationController = require('../controllers/team-invitation.controller');
const {
  createInvitationSchema,
  listInvitationsQuerySchema,
} = require('../validators/team-invitation.validator');

const router = express.Router();

router.use(protect);

router.get('/', validate(searchTeamsQuerySchema, 'query'), teamController.listTeams);
router.post('/', restrictTo('student'), validate(createTeamSchema), teamController.createTeam);

router.get('/mine', teamController.listMyTeams);
router.get('/recommended', restrictTo('student'), teamController.getRecommendedTeams);

router.get('/:id', teamController.getTeam);
router.patch('/:id', validate(updateTeamSchema), teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);

router.get('/:id/recommended-teammates', teamController.getRecommendedTeammates);
router.delete('/:id/members/:userId', teamController.removeMember);
router.post('/:id/leave', teamController.leaveTeam);

router.post('/:id/invitations', restrictTo('student'), validate(createInvitationSchema), teamInvitationController.createInvitation);
router.get(
  '/:id/invitations',
  restrictTo('student'),
  validate(listInvitationsQuerySchema, 'query'),
  teamInvitationController.listTeamInvitations
);

router.post('/:id/join-requests', restrictTo('student'), validate(joinRequestSchema), joinRequestController.createJoinRequest);
router.get('/:id/join-requests', joinRequestController.listTeamJoinRequests);
router.patch('/join-requests/:requestId', validate(decideJoinRequestSchema), joinRequestController.decideJoinRequest);

router.get('/:id/messages', teamMessageController.listMessages);
router.post('/:id/messages', validate(sendMessageSchema), teamMessageController.sendMessage);

router.get('/:id/resources', teamResourceController.listResources);
router.get('/:id/resources/:resourceId/download', teamResourceController.downloadFile);
router.post('/:id/resources/files', uploadRateLimit, upload.single('file'), teamResourceController.uploadFile);
router.post('/:id/resources/links', validate(addLinkResourceSchema), teamResourceController.addLink);
router.delete('/:id/resources/:resourceId', teamResourceController.deleteResource);

module.exports = router;
