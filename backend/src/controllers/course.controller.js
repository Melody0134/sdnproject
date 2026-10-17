const asyncHandler = require('../utils/async-handler');
const courseService = require('../services/course.service');
const enrollmentService = require('../services/enrollment.service');
const assignmentService = require('../services/assignment.service');
const courseAnalyticsService = require('../services/course-analytics.service');

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.user, req.body);
  res.status(201).json({ success: true, data: { course } });
});

const listCourses = asyncHandler(async (req, res) => {
  const result = await courseService.listCourses(req.query, req.user);
  res.status(200).json({ success: true, ...result });
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id, req.user);
  res.status(200).json({ success: true, data: { course } });
});

const enrollCourse = asyncHandler(async (req, res) => {
  await enrollmentService.enroll(req.params.id, req.user.id);
  res.status(201).json({ success: true, data: { enrolled: true } });
});

const unenrollCourse = asyncHandler(async (req, res) => {
  await enrollmentService.unenroll(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { enrolled: false } });
});

const getRoster = asyncHandler(async (req, res) => {
  const students = await courseService.getRoster(req.params.id, req.user);
  res.status(200).json({ success: true, data: students });
});

const getGradebook = asyncHandler(async (req, res) => {
  const gradebook = await assignmentService.getCourseGradebook(req.params.id, req.user);
  res.status(200).json({ success: true, data: gradebook });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await courseAnalyticsService.getCourseAnalytics(req.params.id, req.user);
  res.status(200).json({ success: true, data: analytics });
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.user, req.body);
  res.status(200).json({ success: true, data: { course } });
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.user);
  res.status(204).send();
});

module.exports = {
  createCourse,
  listCourses,
  getCourse,
  enrollCourse,
  unenrollCourse,
  getRoster,
  getGradebook,
  getAnalytics,
  updateCourse,
  deleteCourse,
};
