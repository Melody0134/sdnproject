const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const AppError = require('../utils/app-error');

const enroll = async (courseId, studentId) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  if (!course.isActive) throw new AppError('Học phần này đã đóng, không thể ghi danh', 422);

  const existing = await Enrollment.findOne({ course: courseId, student: studentId }).lean();
  if (existing) throw new AppError('Bạn đã ghi danh học phần này', 409);

  return Enrollment.create({ course: courseId, student: studentId });
};

const unenroll = async (courseId, studentId) => {
  const result = await Enrollment.deleteOne({ course: courseId, student: studentId });
  if (result.deletedCount === 0) throw new AppError('Bạn chưa ghi danh học phần này', 404);
};

const isEnrolled = async (courseId, studentId) => {
  const found = await Enrollment.findOne({ course: courseId, student: studentId }).select('_id').lean();
  return Boolean(found);
};

const listRoster = async (courseId) => {
  const rows = await Enrollment.find({ course: courseId })
    .populate('student', 'name email avatarUrl major gpa')
    .sort({ createdAt: 1 })
    .lean();
  return rows.map((row) => ({ ...row.student, enrolledAt: row.createdAt }));
};

const listStudentCourseIds = async (studentId) => {
  const rows = await Enrollment.find({ student: studentId }).select('course').lean();
  return rows.map((row) => row.course);
};

const countByCourse = async (courseId) => Enrollment.countDocuments({ course: courseId });

module.exports = {
  enroll,
  unenroll,
  isEnrolled,
  listRoster,
  listStudentCourseIds,
  countByCourse,
};
