const asyncHandler = require('../utils/async-handler');
const userService = require('../services/user.service');

const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: { user } });
});

const updateMyAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar(req.user.id, req.file);
  res.status(200).json({ success: true, data: { user } });
});

const searchStudents = asyncHandler(async (req, res) => {
  const result = await userService.searchStudents(req.query);
  res.status(200).json({ success: true, ...result });
});

const getStudentPublicProfile = asyncHandler(async (req, res) => {
  const student = await userService.getStudentPublicProfile(req.params.id);
  res.status(200).json({ success: true, data: { student } });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(200).json({ success: true, ...result });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: { user } });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUserAsAdmin(req.params.id, req.body, req.user.id);
  res.status(200).json({ success: true, data: { user } });
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.id);
  res.status(204).send();
});

const registerPushToken = asyncHandler(async (req, res) => {
  await userService.addPushToken(req.user.id, req.body.token);
  res.status(200).json({ success: true, data: { registered: true } });
});

const removePushToken = asyncHandler(async (req, res) => {
  await userService.removePushToken(req.user.id, req.body.token);
  res.status(200).json({ success: true, data: { registered: false } });
});

module.exports = {
  updateMyProfile,
  updateMyAvatar,
  searchStudents,
  getStudentPublicProfile,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  registerPushToken,
  removePushToken,
};
