const Quiz = require('../models/quiz.model');
const QuizAttempt = require('../models/quiz-attempt.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const { parseQuestions } = require('../utils/quiz-workbook');

const QUIZ_LIST_PROJECTION = 'title course createdBy questions isPublished createdAt';

const validateQuestions = (questions) => {
  for (const question of questions) {
    if (question.correctIndexes.some((index) => index >= question.options.length)) {
      throw new AppError('Đáp án đúng không nằm trong danh sách lựa chọn', 422);
    }
  }
};

const sameSet = (a, b) => {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((value) => set.has(value));
};

const createQuiz = async (createdBy, payload) => {
  validateQuestions(payload.questions);
  return Quiz.create({ ...payload, createdBy });
};

const importQuiz = async (createdBy, filePath, payload) => {
  const questions = await parseQuestions(filePath);
  const isPublished = payload.isPublished === false || payload.isPublished === 'false' ? false : true;
  return createQuiz(createdBy, {
    title: payload.title,
    course: payload.course || null,
    isPublished,
    questions,
  });
};

const listQuizzes = async (query, requester) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.course) filter.course = query.course;
  if (query.mine === 'true') filter.createdBy = requester.id;
  if (requester.role === 'student') filter.isPublished = true;

  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .select(QUIZ_LIST_PROJECTION)
      .populate('course', 'code title')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Quiz.countDocuments(filter),
  ]);

  const shaped = quizzes.map((quiz) => ({ ...quiz, questionCount: quiz.questions.length, questions: undefined }));
  return buildPageResult(shaped, total, page, limit);
};

const getQuizForTaking = async (quizId, requester) => {
  const quiz = await Quiz.findById(quizId).populate('course', 'code title').lean();
  if (!quiz) throw new AppError('Không tìm thấy bộ câu hỏi', 404);
  if (requester.role === 'student' && !quiz.isPublished) {
    throw new AppError('Bộ câu hỏi này chưa được công bố', 403);
  }

  const revealAnswers = requester.role !== 'student';
  return {
    ...quiz,
    questions: quiz.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
      correctIndexes: revealAnswers ? q.correctIndexes : undefined,
    })),
  };
};

const submitAttempt = async (quizId, studentId, answers) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw new AppError('Không tìm thấy bộ câu hỏi', 404);
  if (!quiz.isPublished) throw new AppError('Bộ câu hỏi này chưa được công bố', 403);
  if (answers.length !== quiz.questions.length) {
    throw new AppError('Số lượng câu trả lời không khớp với số câu hỏi', 422);
  }

  let score = 0;
  const review = quiz.questions.map((question, index) => {
    const selectedIndexes = Array.isArray(answers[index]) ? answers[index] : [];
    const isCorrect = sameSet(selectedIndexes, question.correctIndexes);
    if (isCorrect) score += 1;
    return {
      questionText: question.questionText,
      options: question.options,
      selectedIndexes,
      correctIndexes: question.correctIndexes,
      isCorrect,
    };
  });

  const attempt = await QuizAttempt.create({
    quiz: quizId,
    student: studentId,
    answers,
    score,
    totalQuestions: quiz.questions.length,
  });

  return { attempt, review, score, totalQuestions: quiz.questions.length };
};

const listMyAttempts = async (studentId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { student: studentId };
  if (query.quiz) filter.quiz = query.quiz;

  const [attempts, total] = await Promise.all([
    QuizAttempt.find(filter)
      .populate({ path: 'quiz', select: 'title course', populate: { path: 'course', select: 'code title' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    QuizAttempt.countDocuments(filter),
  ]);

  return buildPageResult(attempts, total, page, limit);
};

const assertQuizOwnership = (quiz, requester) => {
  if (requester.role !== 'admin' && quiz.createdBy.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể chỉnh sửa bộ câu hỏi do mình tạo', 403);
  }
};

const updateQuiz = async (quizId, requester, updates) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new AppError('Không tìm thấy bộ câu hỏi', 404);
  assertQuizOwnership(quiz, requester);
  if (updates.questions) validateQuestions(updates.questions);
  if ('title' in updates) quiz.title = updates.title;
  if ('course' in updates) quiz.course = updates.course || null;
  if ('questions' in updates) quiz.questions = updates.questions;
  if ('isPublished' in updates) quiz.isPublished = updates.isPublished;
  await quiz.save();
  return quiz;
};

const deleteQuiz = async (quizId, requester) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new AppError('Không tìm thấy bộ câu hỏi', 404);
  assertQuizOwnership(quiz, requester);
  await Promise.all([Quiz.deleteOne({ _id: quizId }), QuizAttempt.deleteMany({ quiz: quizId })]);
};

module.exports = {
  createQuiz,
  importQuiz,
  listQuizzes,
  getQuizForTaking,
  submitAttempt,
  listMyAttempts,
  updateQuiz,
  deleteQuiz,
};
