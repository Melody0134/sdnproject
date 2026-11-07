const Course = require('../models/course.model');
const Material = require('../models/material.model');
const Enrollment = require('../models/enrollment.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const enrollmentService = require('./enrollment.service');

const createCourse = async (requester, payload) => {
  const lecturer = requester.role === 'admin' && payload.lecturer ? payload.lecturer : requester.id;
  return Course.create({ ...payload, lecturer });
};

const enrichWithEnrollment = async (courses, requester) => {
  const ids = courses.map((course) => course._id);
  const [counts, myEnrollments] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: ids } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
    requester.role === 'student'
      ? Enrollment.find({ student: requester.id, course: { $in: ids } }).select('course').lean()
      : Promise.resolve([]),
  ]);
  const countMap = counts.reduce((acc, row) => ({ ...acc, [row._id.toString()]: row.count }), {});
  const enrolledSet = new Set(myEnrollments.map((row) => row.course.toString()));
  return courses.map((course) => ({
    ...course,
    enrollmentCount: countMap[course._id.toString()] || 0,
    isEnrolled: enrolledSet.has(course._id.toString()),
  }));
};

const listCourses = async (query, requester) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.search) filter.$text = { $search: query.search };
  if (query.mine === 'true' && requester.role === 'lecturer') filter.lecturer = requester.id;
  if (requester.role === 'student') filter.isActive = true;
  if (query.enrolled === 'true' && requester.role === 'student') {
    const courseIds = await enrollmentService.listStudentCourseIds(requester.id);
    filter._id = { $in: courseIds };
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate('lecturer', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  const enriched = await enrichWithEnrollment(courses, requester);
  return buildPageResult(enriched, total, page, limit);
};

const getCourseById = async (courseId, requester) => {
  const course = await Course.findById(courseId).populate('lecturer', 'name avatarUrl email').lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  const [enrollmentCount, isEnrolled] = await Promise.all([
    enrollmentService.countByCourse(courseId),
    requester.role === 'student' ? enrollmentService.isEnrolled(courseId, requester.id) : Promise.resolve(false),
  ]);
  return { ...course, enrollmentCount, isEnrolled };
};

const getRoster = async (courseId, requester) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  assertOwnership(course, requester);
  return enrollmentService.listRoster(courseId);
};

const assertOwnership = (course, requester) => {
  if (requester.role === 'admin') return;
  if (course.lecturer.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể quản lý học phần do mình phụ trách', 403);
  }
};

const updateCourse = async (courseId, requester, updates) => {
  const course = await Course.findById(courseId);
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  assertOwnership(course, requester);
  if (updates.lecturer && requester.role !== 'admin') delete updates.lecturer;
  Object.assign(course, updates);
  await course.save();
  return course;
};

const deleteCourse = async (courseId, requester) => {
  const course = await Course.findById(courseId);
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  assertOwnership(course, requester);
  await Promise.all([
    Course.deleteOne({ _id: courseId }),
    Material.deleteMany({ course: courseId }),
    Enrollment.deleteMany({ course: courseId }),
  ]);
};

module.exports = {
  createCourse,
  listCourses,
  getCourseById,
  getRoster,
  updateCourse,
  deleteCourse,
  assertOwnership,
};
