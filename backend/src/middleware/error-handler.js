const AppError = require('../utils/app-error');
const fs = require('fs/promises');

const notFound = (req, res, next) => {
  next(new AppError(`Không tìm thấy đường dẫn: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = async (err, req, res, next) => {
  let { statusCode = 500, message } = err;
  let details = err.details || null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'Dữ liệu';
    message = `${field} đã tồn tại trong hệ thống`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Định danh không hợp lệ: ${err.value}`;
  } else if (err.name === 'MulterError') {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Tệp tải lên vượt quá dung lượng cho phép' : 'Tệp tải lên không hợp lệ';
  }

  if (!err.isOperational && statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  if (req.file?.path) {
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') console.error(cleanupError);
    }
  }

  res.status(statusCode).json({
    success: false,
    message: message || 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau',
    details,
  });
};

module.exports = { notFound, errorHandler };
