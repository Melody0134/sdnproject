const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
} = require('../validators/course.validator');
const courseController = require('../controllers/course.controller');

const router = express.Router();

router.use(protect);

router.get('/', validate(listCoursesQuerySchema, 'query'), courseController.listCourses);
router.get('/:id', courseController.getCourse);
router.get('/:id/roster', restrictTo('lecturer', 'admin'), courseController.getRoster);
router.get('/:id/gradebook', restrictTo('lecturer', 'admin'), courseController.getGradebook);
router.get('/:id/analytics', restrictTo('lecturer', 'admin'), courseController.getAnalytics);

router.post('/', restrictTo('lecturer', 'admin'), validate(createCourseSchema), courseController.createCourse);
router.post('/:id/enroll', restrictTo('student'), courseController.enrollCourse);
router.delete('/:id/enroll', restrictTo('student'), courseController.unenrollCourse);
router.patch('/:id', restrictTo('lecturer', 'admin'), validate(updateCourseSchema), courseController.updateCourse);
router.delete('/:id', restrictTo('lecturer', 'admin'), courseController.deleteCourse);

module.exports = router;
