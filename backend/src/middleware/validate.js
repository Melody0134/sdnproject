const AppError = require('../utils/app-error');

const validate = (schema, target = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[target], { abortEarly: false, stripUnknown: true });
  if (error) {
    throw new AppError('Dữ liệu gửi lên không hợp lệ', 422, error.details.map((d) => d.message));
  }
  req[target] = value;
  next();
};

module.exports = validate;
