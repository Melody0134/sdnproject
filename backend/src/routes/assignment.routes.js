const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { uploadRateLimit } = require('../middleware/rate-limit');
const {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitSchema,
  gradeSchema,
  listAssignmentsQuerySchema,
} = require('../validators/assignment.validator');
const assignmentController = require('../controllers/assignment.controller');

const router = express.Router();

router.use(protect);

router.get('/', validate(listAssignmentsQuerySchema, 'query'), assignmentController.listAssignments);
router.get('/gradebook/mine', restrictTo('student'), assignmentController.getMyGradebook);
router.get('/:id', assignmentController.getAssignment);
router.get('/:id/submissions', restrictTo('lecturer', 'admin'), assignmentController.listSubmissions);
router.get('/:id/submissions/:submissionId/download', assignmentController.downloadSubmission);

router.post('/', restrictTo('lecturer', 'admin'), validate(createAssignmentSchema), assignmentController.createAssignment);
router.post(
  '/:id/submissions',
  restrictTo('student'),
  uploadRateLimit,
  upload.single('file'),
  validate(submitSchema),
  assignmentController.submitAssignment
);
router.post(
  '/:id/submissions/:submissionId/grade',
  restrictTo('lecturer', 'admin'),
  validate(gradeSchema),
  assignmentController.gradeSubmission
);

router.patch('/:id', restrictTo('lecturer', 'admin'), validate(updateAssignmentSchema), assignmentController.updateAssignment);
router.delete('/:id', restrictTo('lecturer', 'admin'), assignmentController.deleteAssignment);

module.exports = router;
