const asyncHandler = require('../utils/async-handler');
const lessonService = require('../services/lesson.service');

const createLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.createLesson(req.user, req.body);
  res.status(201).json({ success: true, data: { lesson } });
});

const listLessons = asyncHandler(async (req, res) => {
  const result = await lessonService.listLessons(req.query.course, req.user);
  res.status(200).json({ success: true, data: result });
});

const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.updateLesson(req.params.id, req.user, req.body);
  res.status(200).json({ success: true, data: { lesson } });
});

const deleteLesson = asyncHandler(async (req, res) => {
  await lessonService.deleteLesson(req.params.id, req.user);
  res.status(204).send();
});

const completeLesson = asyncHandler(async (req, res) => {
  await lessonService.markComplete(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { completed: true } });
});

const uncompleteLesson = asyncHandler(async (req, res) => {
  await lessonService.unmarkComplete(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { completed: false } });
});

module.exports = { createLesson, listLessons, updateLesson, deleteLesson, completeLesson, uncompleteLesson };
