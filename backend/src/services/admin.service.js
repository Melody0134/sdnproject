const User = require('../models/user.model');
const Team = require('../models/team.model');
const Course = require('../models/course.model');
const Material = require('../models/material.model');
const Quiz = require('../models/quiz.model');
const QuizAttempt = require('../models/quiz-attempt.model');
const Post = require('../models/post.model');

const countByRole = async () => {
  const rows = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  return rows.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});
};

const countTeamsByStatus = async () => {
  const rows = await Team.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  return rows.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});
};

const getSystemStats = async () => {
  const [usersByRole, teamsByStatus, totalCourses, totalMaterials, totalQuizzes, totalAttempts, hiddenPosts] =
    await Promise.all([
      countByRole(),
      countTeamsByStatus(),
      Course.countDocuments(),
      Material.countDocuments(),
      Quiz.countDocuments(),
      QuizAttempt.countDocuments(),
      Post.countDocuments({ status: 'hidden' }),
    ]);

  const totalUsers = Object.values(usersByRole).reduce((sum, n) => sum + n, 0);
  const totalTeams = Object.values(teamsByStatus).reduce((sum, n) => sum + n, 0);

  return {
    totalUsers,
    usersByRole,
    totalTeams,
    teamsByStatus,
    totalCourses,
    totalMaterials,
    totalQuizzes,
    totalAttempts,
    hiddenPosts,
  };
};

const getRecentActivity = async () => {
  const [users, teams, posts] = await Promise.all([
    User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(6).lean(),
    Team.find()
      .select('name status createdAt')
      .populate('leader', 'name')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Post.find()
      .select('title type status createdAt')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return { users, teams, posts };
};

module.exports = { getSystemStats, getRecentActivity };
