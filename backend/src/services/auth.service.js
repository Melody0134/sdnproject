const crypto = require('crypto');
const User = require('../models/user.model');
const AppError = require('../utils/app-error');
const { signToken } = require('../utils/token');
const { nodeEnv } = require('../config/env');

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const createAccessToken = (user) =>
  signToken({ sub: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion });

const register = async ({ name, email, password, major }) => {
  const existing = await User.findOne({ email }).select('_id').lean();
  if (existing) {
    throw new AppError('Email này đã được đăng ký', 409);
  }

  const user = await User.create({ name, email, password, major, role: 'student' });
  const token = createAccessToken(user);
  return { token, user: user.toPublicJSON() };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email hoặc mật khẩu không chính xác', 401);
  }
  if (!user.isActive) {
    throw new AppError('Tài khoản của bạn đã bị vô hiệu hóa', 403);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = createAccessToken(user);
  return { token, user: user.toPublicJSON() };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Mật khẩu hiện tại không chính xác', 400);
  }

  user.password = newPassword;
  user.tokenVersion += 1;
  await user.save();
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email, isActive: true });
  let resetToken;

  if (user) {
    resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save({ validateBeforeSave: false });
  }

  return nodeEnv !== 'production' && resetToken ? { resetToken } : {};
};

const resetPassword = async ({ resetToken, newPassword }) => {
  const passwordResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await User.findOne({
    passwordResetTokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
    isActive: true,
  }).select('+passwordResetTokenHash +passwordResetExpiresAt');

  if (!user) {
    throw new AppError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400);
  }

  user.password = newPassword;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.tokenVersion += 1;
  await user.save();
};

const logout = async (userId) => {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
};

module.exports = { register, login, changePassword, forgotPassword, resetPassword, logout };
