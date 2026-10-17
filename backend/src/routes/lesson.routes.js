const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createLessonSchema,
  updateLessonSchema,
  listLessonsQuerySchema,
} = require('../validators/lesson.validator');
const lessonController = require('../controllers/lesson.controller');

const router = express.Router();

router.use(protect);

router.get('/', validate(listLessonsQuerySchema, 'query'), lessonController.listLessons);
router.post('/', restrictTo('lecturer', 'admin'), validate(createLessonSchema), lessonController.createLesson);
router.patch('/:id', restrictTo('lecturer', 'admin'), validate(updateLessonSchema), lessonController.updateLesson);
router.delete('/:id', restrictTo('lecturer', 'admin'), lessonController.deleteLesson);

router.post('/:id/complete', restrictTo('student'), lessonController.completeLesson);
router.delete('/:id/complete', restrictTo('student'), lessonController.uncompleteLesson);

module.exports = router;
