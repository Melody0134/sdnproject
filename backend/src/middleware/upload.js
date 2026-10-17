const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AppError = require('../utils/app-error');
const { UPLOADS_ROOT, AVATARS_ROOT, datedSubdir } = require('../utils/uploads');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/zip',
]);

const AVATAR_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const MIME_EXTENSIONS = new Map([
  ['application/pdf', new Set(['.pdf'])],
  ['application/msword', new Set(['.doc'])],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', new Set(['.docx'])],
  ['application/vnd.ms-powerpoint', new Set(['.ppt'])],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', new Set(['.pptx'])],
  ['application/vnd.ms-excel', new Set(['.xls'])],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', new Set(['.xlsx'])],
  ['text/plain', new Set(['.txt'])],
  ['image/png', new Set(['.png'])],
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/webp', new Set(['.webp'])],
  ['application/zip', new Set(['.zip'])],
]);

const createStorage = (root) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(root, datedSubdir());
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, `${hash}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const storage = createStorage(UPLOADS_ROOT);
const avatarStorage = createStorage(AVATARS_ROOT);

const hasConsistentExtension = (file) => {
  const allowedExtensions = MIME_EXTENSIONS.get(file.mimetype);
  return allowedExtensions?.has(path.extname(file.originalname).toLowerCase()) || false;
};

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new AppError(`Định dạng file không được hỗ trợ: ${file.mimetype}`, 415));
    return;
  }
  if (!hasConsistentExtension(file)) {
    cb(new AppError('Phần mở rộng tệp không phù hợp với định dạng đã khai báo', 415));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    if (!AVATAR_MIME_TYPES.has(file.mimetype)) {
      cb(new AppError('Ảnh đại diện chỉ hỗ trợ định dạng PNG, JPEG hoặc WebP', 415));
      return;
    }
    if (!hasConsistentExtension(file)) {
      cb(new AppError('Phần mở rộng ảnh không phù hợp với định dạng đã khai báo', 415));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

module.exports = upload;
module.exports.avatarUpload = avatarUpload;
