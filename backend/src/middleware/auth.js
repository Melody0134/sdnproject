const { verifyToken } = require('../utils/token');
const AppError = require('../utils/app-error');
const asyncHandler = require('../utils/async-handler');
const User = require('../models/user.model');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new AppError('Vui lòng đăng nhập để tiếp tục', 401);
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);
  }

  const user = await User.findById(payload.sub).lean();
  if (!user || !user.isActive) {
    throw new AppError('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa', 401);
  }
  if ((payload.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
    throw new AppError('Phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại', 401);
  }

  req.user = { ...user, id: user._id.toString() };
  next();
});

const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new AppError('Bạn không có quyền thực hiện hành động này', 403);
  }
  next();
};

module.exports = { protect, restrictTo };
