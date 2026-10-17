const Post = require('../models/post.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const commentService = require('./comment.service');
const eventService = require('./event.service');
const EventRegistration = require('../models/event-registration.model');

const CREATOR_ROLES = new Set(['lecturer', 'admin', 'club_leader']);

const shapePost = (post, userId, commentCount = 0) => {
  const reactionCount = post.reactions?.length || 0;
  const myReaction = post.reactions?.find((r) => r.user.toString() === userId.toString())?.type || null;
  return { ...post, reactionCount, myReaction, commentCount, reactions: undefined };
};

const createPost = async (author, payload) => {
  validateEventDates(payload);
  return Post.create({ ...payload, author });
};

const validateEventDates = (post) => {
  if (post.type !== 'event') return;
  if (!post.eventDate) throw new AppError('Sự kiện bắt buộc phải có thời gian bắt đầu', 422);
  const eventDate = new Date(post.eventDate);
  if (post.endDate && new Date(post.endDate) < eventDate) {
    throw new AppError('Thời gian kết thúc không được trước thời gian bắt đầu', 422);
  }
  if (post.registrationDeadline && new Date(post.registrationDeadline) > eventDate) {
    throw new AppError('Hạn đăng ký không được sau thời gian bắt đầu', 422);
  }
};

const listPosts = async (query, requester) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (requester.role !== 'admin') filter.status = 'published';
  if (query.type) filter.type = query.type;
  if (query.mine === 'true') filter.author = requester.id;

  const [items, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name role avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  const commentCounts = await commentService.countByPosts(items.map((post) => post._id));
  const shaped = items.map((post) => shapePost(post, requester.id, commentCounts[post._id.toString()] || 0));
  return buildPageResult(shaped, total, page, limit);
};

const getPost = async (postId, requester) => {
  const post = await Post.findById(postId).populate('author', 'name role avatarUrl').lean();
  if (!post || (post.status !== 'published' && requester.role !== 'admin' &&
    post.author._id.toString() !== requester.id.toString())) {
    throw new AppError('Không tìm thấy bài đăng', 404);
  }
  const [commentCounts, isRegistered] = await Promise.all([
    commentService.countByPosts([post._id]),
    post.type === 'event' ? eventService.getRegistrationState(post._id, requester.id) : false,
  ]);
  return { ...shapePost(post, requester.id, commentCounts[post._id.toString()] || 0), isRegistered };
};

const assertAuthorOrModerator = (post, requester) => {
  if (requester.role === 'admin') return;
  if (post.author.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể chỉnh sửa bài đăng do mình tạo', 403);
  }
};

const updatePost = async (postId, requester, updates) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Không tìm thấy bài đăng', 404);
  if (updates.status && requester.role !== 'admin' && post.author.toString() !== requester.id.toString()) {
    throw new AppError('Chỉ tác giả hoặc quản trị viên mới có thể thay đổi trạng thái bài đăng', 403);
  }
  assertAuthorOrModerator(post, requester);
  const mergedPost = { ...post.toObject(), ...updates };
  validateEventDates(mergedPost);
  const filter = { _id: postId };
  if (updates.capacity !== undefined && updates.capacity !== null) {
    filter.$expr = { $lte: [{ $ifNull: ['$registrationCount', 0] }, updates.capacity] };
  }
  const updatedPost = await Post.findOneAndUpdate(filter, updates, { new: true, runValidators: true });
  if (!updatedPost) throw new AppError('Sức chứa không được nhỏ hơn số người đã đăng ký', 409);
  return updatedPost;
};

const deletePost = async (postId, requester) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Không tìm thấy bài đăng', 404);
  assertAuthorOrModerator(post, requester);
  await Promise.all([post.deleteOne(), EventRegistration.deleteMany({ event: postId })]);
};

const toggleReaction = async (postId, userId, type) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Không tìm thấy bài đăng', 404);

  const existingIndex = post.reactions.findIndex((r) => r.user.toString() === userId.toString());
  if (existingIndex >= 0) {
    if (post.reactions[existingIndex].type === type) {
      post.reactions.splice(existingIndex, 1);
    } else {
      post.reactions[existingIndex].type = type;
    }
  } else {
    post.reactions.push({ user: userId, type });
  }
  await post.save();

  const myReaction = post.reactions.find((r) => r.user.toString() === userId.toString())?.type || null;
  return { reactionCount: post.reactions.length, myReaction };
};

module.exports = { CREATOR_ROLES, createPost, listPosts, getPost, updatePost, deletePost, toggleReaction };
