const Lesson = require('../models/lesson.model');
const LessonProgress = require('../models/lesson-progress.model');
const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const AppError = require('../utils/app-error');

const assertCourseOwnership = async (courseId, requester) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  if (requester.role !== 'admin' && course.lecturer.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể quản lý bài học của học phần do mình phụ trách', 403);
  }
  return course;
};

const normalizePayload = (payload) => {
  const normalized = { ...payload };
  if ('quiz' in normalized && !normalized.quiz) normalized.quiz = null;
  return normalized;
};

const createLesson = async (requester, payload) => {
  await assertCourseOwnership(payload.course, requester);
  return Lesson.create({ ...normalizePayload(payload), createdBy: requester.id });
};

const listLessons = async (courseId, requester) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);

  const lessons = await Lesson.find({ course: courseId })
    .populate('materials', 'title fileUrl fileName size')
    .populate('quiz', 'title isPublished')
    .sort({ order: 1, createdAt: 1 })
    .lean();

  if (requester.role !== 'student') {
    return { lessons: lessons.map((lesson) => ({ ...lesson, completed: false })), completedCount: 0 };
  }

  const progress = await LessonProgress.find({ course: courseId, student: requester.id })
    .select('lesson')
    .lean();
  const doneSet = new Set(progress.map((row) => row.lesson.toString()));
  const shaped = lessons.map((lesson) => ({ ...lesson, completed: doneSet.has(lesson._id.toString()) }));
  return { lessons: shaped, completedCount: shaped.filter((l) => l.completed).length };
};

const updateLesson = async (lessonId, requester, updates) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError('Không tìm thấy bài học', 404);
  await assertCourseOwnership(lesson.course, requester);
  Object.assign(lesson, normalizePayload(updates));
  await lesson.save();
  return lesson;
};

const deleteLesson = async (lessonId, requester) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError('Không tìm thấy bài học', 404);
  await assertCourseOwnership(lesson.course, requester);
  await Promise.all([lesson.deleteOne(), LessonProgress.deleteMany({ lesson: lessonId })]);
};

const markComplete = async (lessonId, studentId) => {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw new AppError('Không tìm thấy bài học', 404);

  const enrolled = await Enrollment.findOne({ course: lesson.course, student: studentId }).lean();
  if (!enrolled) throw new AppError('Bạn chưa ghi danh học phần của bài học này', 403);

  await LessonProgress.updateOne(
    { lesson: lessonId, student: studentId },
    { $setOnInsert: { lesson: lessonId, course: lesson.course, student: studentId } },
    { upsert: true }
  );
};

const unmarkComplete = async (lessonId, studentId) => {
  await LessonProgress.deleteOne({ lesson: lessonId, student: studentId });
};

module.exports = { createLesson, listLessons, updateLesson, deleteLesson, markComplete, unmarkComplete };
