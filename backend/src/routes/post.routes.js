const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createPostSchema,
  updatePostSchema,
  reactSchema,
  listPostsQuerySchema,
  postIdParamsSchema,
} = require('../validators/post.validator');
const { listParticipantsQuerySchema, participantParamsSchema } = require('../validators/event.validator');
const { createCommentSchema, listCommentsQuerySchema } = require('../validators/comment.validator');
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const eventController = require('../controllers/event.controller');

const router = express.Router();

router.use(protect);

router.get('/', validate(listPostsQuerySchema, 'query'), postController.listPosts);
router.post('/', restrictTo('lecturer', 'admin', 'club_leader'), validate(createPostSchema), postController.createPost);
router.get('/:id', validate(postIdParamsSchema, 'params'), postController.getPost);
router.patch('/:id', validate(postIdParamsSchema, 'params'), validate(updatePostSchema), postController.updatePost);
router.delete('/:id', validate(postIdParamsSchema, 'params'), postController.deletePost);
router.post('/:id/react', validate(postIdParamsSchema, 'params'), validate(reactSchema), postController.reactToPost);

router.post('/:id/registrations', validate(postIdParamsSchema, 'params'), eventController.registerForEvent);
router.delete('/:id/registrations/me', validate(postIdParamsSchema, 'params'), eventController.cancelRegistration);
router.get(
  '/:id/participants',
  validate(postIdParamsSchema, 'params'),
  validate(listParticipantsQuerySchema, 'query'),
  eventController.listParticipants
);
router.delete(
  '/:id/participants/:userId',
  validate(participantParamsSchema, 'params'),
  eventController.removeParticipant
);

router.get('/:id/comments', validate(listCommentsQuerySchema, 'query'), commentController.listComments);
router.post('/:id/comments', validate(createCommentSchema), commentController.addComment);
router.delete('/:id/comments/:commentId', commentController.deleteComment);

module.exports = router;
