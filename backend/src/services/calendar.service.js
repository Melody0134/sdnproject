const Assignment = require('../models/assignment.model');
const Post = require('../models/post.model');
const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const Submission = require('../models/submission.model');

const DAY_MS = 24 * 60 * 60 * 1000;

const getUpcoming = async (requester) => {
  const since = new Date(Date.now() - DAY_MS);

  let courseIds = null;
  if (requester.role === 'student') {
    const enrollments = await Enrollment.find({ student: requester.id }).select('course').lean();
    courseIds = enrollments.map((row) => row.course);
  } else if (requester.role === 'lecturer') {
    const courses = await Course.find({ lecturer: requester.id }).select('_id').lean();
    courseIds = courses.map((course) => course._id);
  }

  const assignmentFilter = { dueDate: { $gte: since } };
  if (requester.role === 'student') assignmentFilter.isPublished = true;
  if (courseIds) assignmentFilter.course = { $in: courseIds };

  const [assignments, events] = await Promise.all([
    Assignment.find(assignmentFilter)
      .select('title dueDate maxScore course')
      .populate('course', 'code title')
      .sort({ dueDate: 1 })
      .limit(50)
      .lean(),
    Post.find({ type: 'event', status: 'published', eventDate: { $gte: since } })
      .select('title eventDate author')
      .populate('author', 'name')
      .sort({ eventDate: 1 })
      .limit(50)
      .lean(),
  ]);

  let submittedSet = new Set();
  if (requester.role === 'student' && assignments.length) {
    const submissions = await Submission.find({
      student: requester.id,
      assignment: { $in: assignments.map((a) => a._id) },
    })
      .select('assignment')
      .lean();
    submittedSet = new Set(submissions.map((row) => row.assignment.toString()));
  }

  const items = [
    ...assignments.map((a) => ({
      kind: 'assignment',
      id: a._id,
      title: a.title,
      date: a.dueDate,
      course: a.course ? { _id: a.course._id, code: a.course.code, title: a.course.title } : null,
      submitted: submittedSet.has(a._id.toString()),
    })),
    ...events.map((p) => ({
      kind: 'event',
      id: p._id,
      title: p.title,
      date: p.eventDate,
      author: p.author?.name || null,
    })),
  ];

  return items.sort((a, b) => new Date(a.date) - new Date(b.date));
};

module.exports = { getUpcoming };
