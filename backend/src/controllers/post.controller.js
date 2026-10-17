const asyncHandler = require('../utils/async-handler');
const postService = require('../services/post.service');

const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.user.id, req.body);
  res.status(201).json({ success: true, data: { post } });
});

const listPosts = asyncHandler(async (req, res) => {
  const result = await postService.listPosts(req.query, req.user);
  res.status(200).json({ success: true, ...result });
});

const getPost = asyncHandler(async (req, res) => {
  const post = await postService.getPost(req.params.id, req.user);
  res.status(200).json({ success: true, data: { post } });
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.user, req.body);
  res.status(200).json({ success: true, data: { post } });
});

const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user);
  res.status(204).send();
});

const reactToPost = asyncHandler(async (req, res) => {
  const result = await postService.toggleReaction(req.params.id, req.user.id, req.body.type);
  res.status(200).json({ success: true, data: result });
});

module.exports = { createPost, listPosts, getPost, updatePost, deletePost, reactToPost };
