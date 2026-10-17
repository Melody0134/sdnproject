const asyncHandler = require('../utils/async-handler');
const commentService = require('../services/comment.service');

const listComments = asyncHandler(async (req, res) => {
  const result = await commentService.listForPost(req.params.id, req.query);
  res.status(200).json({ success: true, ...result });
});

const addComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment(req.params.id, req.user.id, req.body.content);
  res.status(201).json({ success: true, data: { comment } });
});

const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.params.id, req.params.commentId, req.user);
  res.status(204).send();
});

module.exports = { listComments, addComment, deleteComment };
