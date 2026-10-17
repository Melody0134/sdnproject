const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { avatarUpload } = require('../middleware/upload');
const { uploadRateLimit } = require('../middleware/rate-limit');
const {
  updateProfileSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  pushTokenSchema,
  listUsersQuerySchema,
  searchStudentsQuerySchema,
  userIdParamsSchema,
} = require('../validators/user.validator');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/students', validate(searchStudentsQuerySchema, 'query'), userController.searchStudents);
router.get('/students/:id', validate(userIdParamsSchema, 'params'), userController.getStudentPublicProfile);

router.use(protect);

router.patch('/me', validate(updateProfileSchema), userController.updateMyProfile);
router.post('/me/avatar', uploadRateLimit, avatarUpload.single('avatar'), userController.updateMyAvatar);
router.post('/me/push-token', validate(pushTokenSchema), userController.registerPushToken);
router.delete('/me/push-token', validate(pushTokenSchema), userController.removePushToken);

router.get('/', restrictTo('admin'), validate(listUsersQuerySchema, 'query'), userController.listUsers);
router.post('/', restrictTo('admin'), validate(adminCreateUserSchema), userController.createUser);
router.patch('/:id', restrictTo('admin'), validate(userIdParamsSchema, 'params'), validate(adminUpdateUserSchema), userController.updateUser);
router.delete('/:id', restrictTo('admin'), validate(userIdParamsSchema, 'params'), userController.deleteUser);

module.exports = router;
