const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const Quiz = require('../models/quiz.model');
const QuizAttempt = require('../models/quiz-attempt.model');
const Lesson = require('../models/lesson.model');
const LessonProgress = require('../models/lesson-progress.model');
const AppError = require('../utils/app-error');

const getCourseAnalytics = async (courseId, requester) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  if (requester.role !== 'admin' && course.lecturer.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể xem phân tích của học phần do mình phụ trách', 403);
  }

  const [enrollments, assignments, quizzes, lessonCount] = await Promise.all([
    Enrollment.find({ course: courseId }).populate('student', 'name email avatarUrl').lean(),
    Assignment.find({ course: courseId }).select('_id maxScore').lean(),
    Quiz.find({ course: courseId }).select('_id').lean(),
    Lesson.countDocuments({ course: courseId }),
  ]);

  const assignmentIds = assignments.map((a) => a._id);
  const quizIds = quizzes.map((q) => q._id);
  const maxScoreMap = assignments.reduce(
    (acc, a) => ({ ...acc, [a._id.toString()]: a.maxScore || 10 }),
    {}
  );

  const [submissions, attempts, progresses] = await Promise.all([
    assignmentIds.length
      ? Submission.find({ assignment: { $in: assignmentIds } })
          .select('assignment student status score')
          .lean()
      : Promise.resolve([]),
    quizIds.length
      ? QuizAttempt.aggregate([
          { $match: { quiz: { $in: quizIds } } },
          { $group: { _id: '$student', count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),
    LessonProgress.aggregate([
      { $match: { course: course._id } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]),
  ]);

  const attemptMap = attempts.reduce((acc, row) => ({ ...acc, [row._id.toString()]: row.count }), {});
  const progressMap = progresses.reduce((acc, row) => ({ ...acc, [row._id.toString()]: row.count }), {});

  const perStudent = {};
  for (const sub of submissions) {
    const key = sub.student.toString();
    if (!perStudent[key]) perStudent[key] = { submitted: 0, graded: 0, percentSum: 0 };
    perStudent[key].submitted += 1;
    if (sub.status === 'graded' && sub.score != null) {
      const max = maxScoreMap[sub.assignment.toString()] || 10;
      perStudent[key].graded += 1;
      perStudent[key].percentSum += (sub.score / max) * 100;
    }
  }

  const students = enrollments
    .filter((row) => row.student)
    .map((row) => {
      const key = row.student._id.toString();
      const agg = perStudent[key] || { submitted: 0, graded: 0, percentSum: 0 };
      const avgPercent = agg.graded > 0 ? Math.round(agg.percentSum / agg.graded) : null;
      const submissionRate = assignments.length > 0 ? agg.submitted / assignments.length : null;
      const lessonsCompleted = progressMap[key] || 0;
      const atRisk =
        (submissionRate != null && submissionRate < 0.5) ||
        (avgPercent != null && avgPercent < 50);

      return {
        student: row.student,
        submittedCount: agg.submitted,
        totalAssignments: assignments.length,
        avgPercent,
        quizAttempts: attemptMap[key] || 0,
        lessonsCompleted,
        totalLessons: lessonCount,
        atRisk,
      };
    })
    .sort((a, b) => Number(b.atRisk) - Number(a.atRisk));

  return {
    course: { _id: course._id, code: course.code, title: course.title },
    totals: {
      students: students.length,
      assignments: assignments.length,
      quizzes: quizzes.length,
      lessons: lessonCount,
      atRisk: students.filter((s) => s.atRisk).length,
    },
    students,
  };
};

module.exports = { getCourseAnalytics };
