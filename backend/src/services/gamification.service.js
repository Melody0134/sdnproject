const User = require('../models/user.model');
const Submission = require('../models/submission.model');
const QuizAttempt = require('../models/quiz-attempt.model');
const Comment = require('../models/comment.model');
const LessonProgress = require('../models/lesson-progress.model');

const BADGES = [
  { key: 'submitter', label: 'Chuyên cần', description: 'Nộp từ 5 bài tập', icon: 'clipboard' },
  { key: 'quiz_master', label: 'Cao thủ trắc nghiệm', description: 'Hoàn thành 10 lượt trắc nghiệm', icon: 'quiz' },
  { key: 'learner', label: 'Chăm học', description: 'Hoàn thành 10 bài học', icon: 'book' },
  { key: 'social', label: 'Gắn kết cộng đồng', description: 'Viết 10 bình luận', icon: 'chat' },
  { key: 'top3', label: 'Top 3 bảng xếp hạng', description: 'Nằm trong top 3 toàn hệ thống', icon: 'trophy' },
];

const toCountMap = (rows) =>
  rows.reduce((acc, row) => ({ ...acc, [row._id.toString()]: row }), {});

const computeStats = async () => {
  const [submissions, attempts, comments, lessons] = await Promise.all([
    Submission.aggregate([
      { $group: { _id: '$student', count: { $sum: 1 }, scoreSum: { $sum: { $ifNull: ['$score', 0] } } } },
    ]),
    QuizAttempt.aggregate([{ $group: { _id: '$student', count: { $sum: 1 } } }]),
    Comment.aggregate([{ $group: { _id: '$author', count: { $sum: 1 } } }]),
    LessonProgress.aggregate([{ $group: { _id: '$student', count: { $sum: 1 } } }]),
  ]);

  return {
    submissionMap: toCountMap(submissions),
    attemptMap: toCountMap(attempts),
    commentMap: toCountMap(comments),
    lessonMap: toCountMap(lessons),
  };
};

const statsForUser = (userId, maps) => {
  const key = userId.toString();
  const submission = maps.submissionMap[key];
  return {
    submissionCount: submission?.count || 0,
    scoreSum: Math.round(submission?.scoreSum || 0),
    quizAttempts: maps.attemptMap[key]?.count || 0,
    comments: maps.commentMap[key]?.count || 0,
    lessonsCompleted: maps.lessonMap[key]?.count || 0,
  };
};

const pointsOf = (stats) =>
  stats.submissionCount * 10 +
  stats.scoreSum +
  stats.quizAttempts * 5 +
  stats.comments * 2 +
  stats.lessonsCompleted * 5;

const badgesOf = (stats, rank) => {
  const earned = [];
  if (stats.submissionCount >= 5) earned.push('submitter');
  if (stats.quizAttempts >= 10) earned.push('quiz_master');
  if (stats.lessonsCompleted >= 10) earned.push('learner');
  if (stats.comments >= 10) earned.push('social');
  if (rank != null && rank <= 3) earned.push('top3');
  return BADGES.map((badge) => ({ ...badge, earned: earned.includes(badge.key) }));
};

const buildRanking = async () => {
  const [students, maps] = await Promise.all([
    User.find({ role: 'student', isActive: true }).select('name avatarUrl major').lean(),
    computeStats(),
  ]);

  const ranked = students
    .map((student) => {
      const stats = statsForUser(student._id, maps);
      return { student, stats, points: pointsOf(stats) };
    })
    .sort((a, b) => b.points - a.points)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return ranked;
};

const getLeaderboard = async (requester) => {
  const ranked = await buildRanking();
  const top = ranked.slice(0, 20).map((row) => ({
    rank: row.rank,
    points: row.points,
    student: row.student,
  }));

  let me = null;
  if (requester.role === 'student') {
    const mine = ranked.find((row) => row.student._id.toString() === requester.id.toString());
    if (mine) {
      me = {
        rank: mine.rank,
        points: mine.points,
        stats: mine.stats,
        badges: badgesOf(mine.stats, mine.rank),
      };
    }
  }

  return { top, me, totalStudents: ranked.length };
};

module.exports = { getLeaderboard };
