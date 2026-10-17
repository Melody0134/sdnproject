const User = require('../models/user.model');
const Team = require('../models/team.model');
const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const Post = require('../models/post.model');
const Club = require('../models/club.model');
const ClubRegistration = require('../models/club-registration.model');

const buildDateFilter = (query) => {
  const createdAt = {};
  if (query.from) createdAt.$gte = new Date(query.from);
  if (query.to) {
    const end = new Date(query.to);
    end.setUTCHours(23, 59, 59, 999);
    createdAt.$lte = end;
  }
  return Object.keys(createdAt).length ? { createdAt } : {};
};

const countGrouped = async (Model, dateFilter, field) => {
  const rows = await Model.aggregate([
    { $match: dateFilter },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return rows.reduce((result, row) => ({ ...result, [row._id || 'unknown']: row.count }), {});
};

const getReport = async (query) => {
  const dateFilter = buildDateFilter(query);
  const [users, usersByRole, teams, teamsByStatus, courses, enrollments, posts, postsByStatus, clubs, clubsByStatus, registrations, registrationsByStatus] =
    await Promise.all([
      User.countDocuments(dateFilter),
      countGrouped(User, dateFilter, 'role'),
      Team.countDocuments(dateFilter),
      countGrouped(Team, dateFilter, 'status'),
      Course.countDocuments(dateFilter),
      Enrollment.countDocuments(dateFilter),
      Post.countDocuments(dateFilter),
      countGrouped(Post, dateFilter, 'status'),
      Club.countDocuments(dateFilter),
      countGrouped(Club, dateFilter, 'status'),
      ClubRegistration.countDocuments(dateFilter),
      countGrouped(ClubRegistration, dateFilter, 'status'),
    ]);
  return {
    range: { from: query.from || null, to: query.to || null },
    generatedAt: new Date(),
    totals: { users, teams, courses, enrollments, posts, clubs, clubRegistrations: registrations },
    breakdowns: { usersByRole, teamsByStatus, postsByStatus, clubsByStatus, clubRegistrationsByStatus: registrationsByStatus },
  };
};

const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;

const buildCsv = (report) => {
  const rows = [['Nhóm', 'Chỉ số', 'Giá trị']];
  Object.entries(report.totals).forEach(([key, value]) => rows.push(['Tổng', key, value]));
  Object.entries(report.breakdowns).forEach(([group, values]) => {
    Object.entries(values).forEach(([key, value]) => rows.push([group, key, value]));
  });
  return `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`;
};

module.exports = { getReport, buildCsv };
