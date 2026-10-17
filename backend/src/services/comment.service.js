const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const notificationService = require('./notification.service');

const listForPost = async (postId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { post: postId };
  const [items, total] = await Promise.all([
    Comment.find(filter)
      .populate('author', 'name role avatarUrl')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(filter),
  ]);
  return buildPageResult(items, total, page, limit);
};

const addComment = async (postId, authorId, content) => {
  const post = await Post.findById(postId).select('author title').lean();
  if (!post) throw new AppError('Không tìm thấy bài đăng', 404);

  const comment = await Comment.create({ post: postId, author: authorId, content });

  if (post.author.toString() !== authorId.toString()) {
    await notificationService.notify({
      recipient: post.author,
      type: 'post_commented',
      message: `Có bình luận mới trong bài đăng "${post.title}"`,
      link: `/feed`,
    });
  }

  return Comment.findById(comment._id).populate('author', 'name role avatarUrl').lean();
};

const deleteComment = async (postId, commentId, requester) => {
  const comment = await Comment.findOne({ _id: commentId, post: postId });
  if (!comment) throw new AppError('Không tìm thấy bình luận', 404);
  if (requester.role !== 'admin' && comment.author.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể xóa bình luận của mình', 403);
  }
  await comment.deleteOne();
};

const countByPosts = async (postIds) => {
  if (!postIds.length) return {};
  const rows = await Comment.aggregate([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: '$post', count: { $sum: 1 } } },
  ]);
  return rows.reduce((acc, row) => ({ ...acc, [row._id.toString()]: row.count }), {});
};

module.exports = { listForPost, addComment, deleteComment, countByPosts };
