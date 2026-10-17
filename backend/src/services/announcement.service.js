const Announcement = require('../models/announcement.model');
const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const User = require('../models/user.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const notificationService = require('./notification.service');

const assertScopeOwnership = async (scope, courseId, requester) => {
  if (scope === 'global') {
    if (requester.role !== 'admin') {
      throw new AppError('Chỉ quản trị viên mới có thể quản lý thông báo toàn hệ thống', 403);
    }
    return null;
  }

  const course = await Course.findById(courseId).select('lecturer').lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  if (requester.role !== 'admin' && course.lecturer.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể quản lý thông báo của học phần do mình phụ trách', 403);
  }
  return course;
};

const createAnnouncement = async (requester, payload, { isBroadcast = false } = {}) => {
  await assertScopeOwnership(payload.scope, payload.course, requester);
  return Announcement.create({ ...payload, author: requester.id, isBroadcast });
};

const buildAudienceFilter = (role) => {
  if (role === 'student') return { audience: { $in: ['all', 'students'] } };
  if (role === 'lecturer') return { audience: { $in: ['all', 'lecturers'] } };
  return {};
};

const listAnnouncements = async (query, requester) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { ...buildAudienceFilter(requester.role) };
  if (requester.role !== 'admin') filter.status = 'published';
  if (query.search) filter.$text = { $search: query.search };
  if (query.scope) filter.scope = query.scope;
  if (query.course) filter.course = query.course;

  const [items, total] = await Promise.all([
    Announcement.find(filter)
      .populate('author', 'name role avatarUrl')
      .populate('course', 'code title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Announcement.countDocuments(filter),
  ]);

  return buildPageResult(items, total, page, limit);
};

const updateAnnouncement = async (announcementId, requester, updates) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) throw new AppError('Không tìm thấy thông báo', 404);
  await assertScopeOwnership(announcement.scope, announcement.course, requester);
  Object.assign(announcement, updates);
  await announcement.save();
  return announcement;
};

const deleteAnnouncement = async (announcementId, requester) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) throw new AppError('Không tìm thấy thông báo', 404);
  await assertScopeOwnership(announcement.scope, announcement.course, requester);
  await announcement.deleteOne();
};

const getBroadcastRecipients = async (announcement) => {
  if (announcement.scope === 'course') {
    const enrollments = await Enrollment.find({ course: announcement.course }).select('student').lean();
    return enrollments.map((enrollment) => enrollment.student);
  }

  const roleFilter = {
    students: 'student',
    lecturers: 'lecturer',
  }[announcement.audience];
  const filter = { isActive: true };
  if (roleFilter) filter.role = roleFilter;
  const users = await User.find(filter).select('_id').lean();
  return users.map((user) => user._id);
};

const broadcastAnnouncement = async (requester, payload) => {
  const announcement = await createAnnouncement(
    requester,
    { ...payload, scope: 'global', course: null },
    { isBroadcast: true }
  );
  const recipients = await getBroadcastRecipients(announcement);
  await notificationService.notifyMany(recipients, {
    type: 'announcement_posted',
    message: `Thông báo mới: "${announcement.title}"`,
    link: '/announcements',
  });
  return { announcement, recipientCount: recipients.length };
};

module.exports = {
  createAnnouncement,
  broadcastAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
