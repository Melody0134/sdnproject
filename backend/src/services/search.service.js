const Course = require('../models/course.model');
const Material = require('../models/material.model');
const Post = require('../models/post.model');
const Team = require('../models/team.model');
const Quiz = require('../models/quiz.model');
const Enrollment = require('../models/enrollment.model');
const AppError = require('../utils/app-error');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const globalSearch = async (query, requester) => {
  const q = (query || '').trim();
  if (q.length < 2) throw new AppError('Từ khóa tìm kiếm cần ít nhất 2 ký tự', 422);

  const regex = new RegExp(escapeRegex(q), 'i');

  const quizFilter = { title: regex };
  if (requester.role === 'student') quizFilter.isPublished = true;

  const materialFilter = { title: regex };
  if (requester.role === 'student') {
    const enrollments = await Enrollment.find({ student: requester.id }).select('course').lean();
    materialFilter.course = { $in: enrollments.map((row) => row.course) };
  }

  const [courses, materials, posts, teams, quizzes] = await Promise.all([
    Course.find({ isActive: true, $or: [{ code: regex }, { title: regex }] })
      .select('code title semester')
      .limit(5)
      .lean(),
    Material.find(materialFilter)
      .select('title fileName course')
      .populate('course', 'code')
      .limit(5)
      .lean(),
    Post.find({ title: regex, status: 'published' })
      .select('title type createdAt')
      .limit(5)
      .lean(),
    Team.find({ name: regex })
      .select('name status members maxMembers')
      .limit(5)
      .lean(),
    Quiz.find(quizFilter)
      .select('title course')
      .populate('course', 'code')
      .limit(5)
      .lean(),
  ]);

  return {
    courses,
    materials,
    posts,
    teams: teams.map((team) => ({
      _id: team._id,
      name: team.name,
      status: team.status,
      memberCount: team.members?.length || 0,
      maxMembers: team.maxMembers,
    })),
    quizzes,
  };
};

module.exports = { globalSearch };
