const fs = require('fs/promises');
const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const QuizAttempt = require('../models/quiz-attempt.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const { publicUrlFor, protectedUrlFor, resolveStoredPath } = require('../utils/uploads');
const notificationService = require('./notification.service');

const assertCourseOwnership = async (courseId, requester) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  if (requester.role !== 'admin' && course.lecturer.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể quản lý bài tập của học phần do mình phụ trách', 403);
  }
  return course;
};

const loadOwnedAssignment = async (assignmentId, requester) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new AppError('Không tìm thấy bài tập', 404);
  await assertCourseOwnership(assignment.course, requester);
  return assignment;
};

const shapeMySubmission = (submission, assignmentId) => {
  if (!submission) return null;
  return {
    _id: submission._id,
    status: submission.status,
    score: submission.score,
    feedback: submission.feedback,
    fileUrl: submission.fileUrl
      ? protectedUrlFor('submission', { assignmentId, submissionId: submission._id })
      : '',
    fileName: submission.fileName,
    content: submission.content,
    submittedAt: submission.submittedAt,
    gradedAt: submission.gradedAt,
  };
};

const createAssignment = async (requester, payload) => {
  await assertCourseOwnership(payload.course, requester);
  const assignment = await Assignment.create({ ...payload, createdBy: requester.id });

  if (assignment.isPublished) {
    const enrollments = await Enrollment.find({ course: assignment.course }).select('student').lean();
    await notificationService.notifyMany(
      enrollments.map((row) => row.student),
      {
        type: 'assignment_posted',
        message: `Bài tập mới: "${assignment.title}"`,
        link: '/assignments',
      }
    );
  }

  return assignment;
};

const listAssignments = async (query, requester) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.course) filter.course = query.course;

  if (requester.role === 'student') {
    filter.isPublished = true;
    const enrollments = await Enrollment.find({ student: requester.id }).select('course').lean();
    const enrolledIds = enrollments.map((row) => row.course);
    filter.course = query.course
      ? filter.course
      : { $in: enrolledIds };
    if (query.course && !enrolledIds.some((id) => id.toString() === query.course)) {
      return buildPageResult([], 0, page, limit);
    }
  } else if (requester.role === 'lecturer' && query.mine !== 'false') {
    filter.createdBy = requester.id;
  }

  const [items, total] = await Promise.all([
    Assignment.find(filter)
      .populate('course', 'code title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Assignment.countDocuments(filter),
  ]);

  const assignmentIds = items.map((item) => item._id);
  let enriched = items;

  if (requester.role === 'student') {
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      student: requester.id,
    }).lean();
    const map = submissions.reduce((acc, sub) => ({ ...acc, [sub.assignment.toString()]: sub }), {});
    enriched = items.map((item) => ({
      ...item,
      mySubmission: shapeMySubmission(map[item._id.toString()], item._id),
    }));
  } else {
    const counts = await Submission.aggregate([
      { $match: { assignment: { $in: assignmentIds } } },
      { $group: { _id: '$assignment', total: { $sum: 1 }, graded: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } } } },
    ]);
    const map = counts.reduce((acc, row) => ({ ...acc, [row._id.toString()]: row }), {});
    enriched = items.map((item) => ({
      ...item,
      submissionCount: map[item._id.toString()]?.total || 0,
      gradedCount: map[item._id.toString()]?.graded || 0,
    }));
  }

  return buildPageResult(enriched, total, page, limit);
};

const getAssignmentById = async (assignmentId, requester) => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('course', 'code title lecturer')
    .lean();
  if (!assignment) throw new AppError('Không tìm thấy bài tập', 404);

  if (requester.role === 'student') {
    if (!assignment.isPublished) throw new AppError('Bài tập này chưa được công bố', 403);
    const enrolled = await Enrollment.findOne({ course: assignment.course._id, student: requester.id }).lean();
    if (!enrolled) throw new AppError('Bạn chưa ghi danh học phần của bài tập này', 403);
    const submission = await Submission.findOne({ assignment: assignmentId, student: requester.id }).lean();
    return { ...assignment, mySubmission: shapeMySubmission(submission, assignmentId) };
  }

  const submissionCount = await Submission.countDocuments({ assignment: assignmentId });
  return { ...assignment, submissionCount };
};

const updateAssignment = async (assignmentId, requester, updates) => {
  const assignment = await loadOwnedAssignment(assignmentId, requester);
  Object.assign(assignment, updates);
  await assignment.save();
  return assignment;
};

const deleteAssignment = async (assignmentId, requester) => {
  const assignment = await loadOwnedAssignment(assignmentId, requester);
  const submissions = await Submission.find({ assignment: assignmentId }).select('fileUrl +storagePath').lean();
  await Promise.all(
    submissions.map((sub) => {
      const filePath = resolveStoredPath(sub.storagePath, sub.fileUrl);
      return filePath ? fs.unlink(filePath).catch(() => {}) : Promise.resolve();
    })
  );
  await Promise.all([
    Assignment.deleteOne({ _id: assignmentId }),
    Submission.deleteMany({ assignment: assignmentId }),
  ]);
};

const submitAssignment = async (assignmentId, studentId, { content }, file) => {
  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw new AppError('Không tìm thấy bài tập', 404);
  if (!assignment.isPublished) throw new AppError('Bài tập này chưa được công bố', 403);

  const enrolled = await Enrollment.findOne({ course: assignment.course, student: studentId }).lean();
  if (!enrolled) throw new AppError('Bạn chưa ghi danh học phần của bài tập này', 403);

  if (!content?.trim() && !file) {
    throw new AppError('Vui lòng nhập nội dung hoặc đính kèm tệp', 422);
  }

  const existing = await Submission.findOne({ assignment: assignmentId, student: studentId }).select('+storagePath');
  const fileData = file
    ? {
        fileUrl: publicUrlFor(file),
        storagePath: file.path,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      }
    : null;

  if (existing) {
    if (fileData && existing.fileUrl) {
      const oldPath = resolveStoredPath(existing.storagePath, existing.fileUrl);
      if (oldPath) await fs.unlink(oldPath).catch(() => {});
    }
    existing.content = content || '';
    if (fileData) Object.assign(existing, fileData);
    existing.status = 'submitted';
    existing.score = null;
    existing.feedback = '';
    existing.gradedBy = null;
    existing.gradedAt = null;
    existing.submittedAt = new Date();
    await existing.save();
    if (fileData) {
      existing.fileUrl = protectedUrlFor('submission', { assignmentId, submissionId: existing._id });
      await existing.save();
    }
    return Submission.findById(existing._id).select('-storagePath').lean();
  }

  const submission = await Submission.create({
    assignment: assignmentId,
    student: studentId,
    content: content || '',
    ...(fileData || {}),
    submittedAt: new Date(),
  });
  if (fileData) {
    submission.fileUrl = protectedUrlFor('submission', { assignmentId, submissionId: submission._id });
    await submission.save();
  }
  return Submission.findById(submission._id).select('-storagePath').lean();
};

const listSubmissions = async (assignmentId, requester) => {
  await loadOwnedAssignment(assignmentId, requester);
  const submissions = await Submission.find({ assignment: assignmentId })
    .populate('student', 'name email avatarUrl major')
    .sort({ createdAt: -1 })
    .lean();
  return submissions.map((submission) => ({
    ...submission,
    fileUrl: submission.fileUrl
      ? protectedUrlFor('submission', { assignmentId, submissionId: submission._id })
      : '',
  }));
};

const getSubmissionFile = async (assignmentId, submissionId, requester) => {
  const submission = await Submission.findOne({ _id: submissionId, assignment: assignmentId })
    .select('+storagePath')
    .lean();
  if (!submission) throw new AppError('Không tìm thấy bài nộp', 404);
  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw new AppError('Không tìm thấy bài tập', 404);
  if (requester.role === 'student' && submission.student.toString() !== requester.id.toString()) {
    throw new AppError('Bạn không có quyền tải bài nộp này', 403);
  }
  if (requester.role !== 'student') await assertCourseOwnership(assignment.course, requester);
  const filePath = resolveStoredPath(submission.storagePath, submission.fileUrl);
  if (!filePath) throw new AppError('Không tìm thấy tệp bài nộp', 404);
  return { filePath, fileName: submission.fileName, mimeType: submission.mimeType };
};

const gradeSubmission = async (assignmentId, submissionId, requester, { score, feedback }) => {
  const assignment = await loadOwnedAssignment(assignmentId, requester);
  if (score > assignment.maxScore) {
    throw new AppError(`Điểm không được vượt quá ${assignment.maxScore}`, 422);
  }
  const submission = await Submission.findOne({ _id: submissionId, assignment: assignmentId });
  if (!submission) throw new AppError('Không tìm thấy bài nộp', 404);

  submission.score = score;
  submission.feedback = feedback || '';
  submission.status = 'graded';
  submission.gradedBy = requester.id;
  submission.gradedAt = new Date();
  await submission.save();

  await notificationService.notify({
    recipient: submission.student,
    type: 'assignment_graded',
    message: `Bài tập "${assignment.title}" đã được chấm: ${score}/${assignment.maxScore}`,
    link: '/assignments',
  });

  return submission;
};

const getStudentGradebook = async (studentId) => {
  const submissions = await Submission.find({ student: studentId })
    .populate({ path: 'assignment', select: 'title maxScore course', populate: { path: 'course', select: 'code title' } })
    .sort({ createdAt: -1 })
    .lean();

  const attempts = await QuizAttempt.aggregate([
    { $match: { student: studentId } },
    { $sort: { score: -1 } },
    {
      $group: {
        _id: '$quiz',
        bestScore: { $first: '$score' },
        totalQuestions: { $first: '$totalQuestions' },
        attempts: { $sum: 1 },
      },
    },
  ]);

  const quizIds = attempts.map((row) => row._id);
  const Quiz = require('../models/quiz.model');
  const quizzes = await Quiz.find({ _id: { $in: quizIds } })
    .select('title course')
    .populate('course', 'code title')
    .lean();
  const quizMap = quizzes.reduce((acc, quiz) => ({ ...acc, [quiz._id.toString()]: quiz }), {});

  return {
    assignments: submissions
      .filter((sub) => sub.assignment)
      .map((sub) => ({
        assignmentId: sub.assignment._id,
        title: sub.assignment.title,
        course: sub.assignment.course,
        maxScore: sub.assignment.maxScore,
        status: sub.status,
        score: sub.score,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt,
      })),
    quizzes: attempts.map((row) => ({
      quizId: row._id,
      title: quizMap[row._id.toString()]?.title || 'Bộ câu hỏi',
      course: quizMap[row._id.toString()]?.course || null,
      bestScore: row.bestScore,
      totalQuestions: row.totalQuestions,
      attempts: row.attempts,
    })),
  };
};

const getCourseGradebook = async (courseId, requester) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  if (requester.role !== 'admin' && course.lecturer.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể xem sổ điểm của học phần do mình phụ trách', 403);
  }

  const [assignments, enrollments] = await Promise.all([
    Assignment.find({ course: courseId }).select('title maxScore').sort({ createdAt: 1 }).lean(),
    Enrollment.find({ course: courseId }).populate('student', 'name email avatarUrl').sort({ createdAt: 1 }).lean(),
  ]);

  const assignmentIds = assignments.map((a) => a._id);
  const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
    .select('assignment student status score')
    .lean();

  const subMap = submissions.reduce((acc, sub) => {
    acc[`${sub.assignment.toString()}:${sub.student.toString()}`] = sub;
    return acc;
  }, {});

  const students = enrollments
    .filter((row) => row.student)
    .map((row) => ({
      student: row.student,
      grades: assignments.reduce((acc, assignment) => {
        const sub = subMap[`${assignment._id.toString()}:${row.student._id.toString()}`];
        acc[assignment._id.toString()] = sub
          ? { status: sub.status, score: sub.score }
          : { status: 'missing', score: null };
        return acc;
      }, {}),
    }));

  return { course: { _id: course._id, code: course.code, title: course.title }, assignments, students };
};

module.exports = {
  createAssignment,
  listAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  listSubmissions,
  getSubmissionFile,
  gradeSubmission,
  getStudentGradebook,
  getCourseGradebook,
};
