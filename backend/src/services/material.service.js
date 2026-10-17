const fs = require('fs/promises');
const Material = require('../models/material.model');
const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const { publicUrlFor, protectedUrlFor, resolveStoredPath } = require('../utils/uploads');

const MATERIAL_LIST_PROJECTION = 'course title description fileUrl fileName mimeType size downloadCount uploadedBy createdAt';

const assertCourseOwnership = async (courseId, requester) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new AppError('Không tìm thấy học phần', 404);
  if (requester.role !== 'admin' && course.lecturer.toString() !== requester.id.toString()) {
    throw new AppError('Bạn chỉ có thể tải tài liệu lên học phần do mình phụ trách', 403);
  }
  return course;
};

const uploadMaterial = async (requester, file, { course, title, description }) => {
  await assertCourseOwnership(course, requester);

  const material = await Material.create({
    course,
    title,
    description,
    fileUrl: publicUrlFor(file),
    storagePath: file.path,
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: requester.id,
  });
  material.fileUrl = protectedUrlFor('material', { materialId: material._id });
  await material.save();
  return Material.findById(material._id).select(MATERIAL_LIST_PROJECTION).lean();
};

const listMaterials = async (query, requester) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.course) filter.course = query.course;
  if (query.search) filter.$text = { $search: query.search };
  if (requester.role === 'student') {
    const enrollments = await Enrollment.find({ student: requester.id }).select('course').lean();
    const courseIds = enrollments.map((row) => row.course);
    filter.course = filter.course ? { $in: courseIds, $eq: filter.course } : { $in: courseIds };
  }

  const [materials, total] = await Promise.all([
    Material.find(filter)
      .select(MATERIAL_LIST_PROJECTION)
      .populate('course', 'code title')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Material.countDocuments(filter),
  ]);

  return buildPageResult(
    materials.map((material) => ({
      ...material,
      fileUrl: protectedUrlFor('material', { materialId: material._id }),
    })),
    total,
    page,
    limit
  );
};

const getMaterialFile = async (materialId, requester) => {
  const material = await Material.findById(materialId).select('+storagePath').lean();
  if (!material) throw new AppError('Không tìm thấy tài liệu', 404);
  if (requester.role === 'student') {
    const enrollment = await Enrollment.findOne({ course: material.course, student: requester.id }).lean();
    if (!enrollment) throw new AppError('Bạn chưa ghi danh học phần của tài liệu này', 403);
  }
  const filePath = resolveStoredPath(material.storagePath, material.fileUrl);
  if (!filePath) throw new AppError('Không tìm thấy tệp tài liệu', 404);
  await Material.updateOne({ _id: materialId }, { $inc: { downloadCount: 1 } });
  return { filePath, fileName: material.fileName, mimeType: material.mimeType };
};

const registerDownload = async (materialId) => {
  const material = await Material.findByIdAndUpdate(
    materialId,
    { $inc: { downloadCount: 1 } },
    { new: true }
  )
    .select(MATERIAL_LIST_PROJECTION)
    .lean();
  if (!material) throw new AppError('Không tìm thấy tài liệu', 404);
  return material;
};

const updateMaterial = async (materialId, requester, updates) => {
  const material = await Material.findById(materialId).select('+storagePath');
  if (!material) throw new AppError('Không tìm thấy tài liệu', 404);
  await assertCourseOwnership(material.course, requester);
  if (updates.course && updates.course !== material.course.toString()) {
    await assertCourseOwnership(updates.course, requester);
    material.course = updates.course;
  }
  if ('title' in updates) material.title = updates.title;
  if ('description' in updates) material.description = updates.description;
  await material.save();
  return Material.findById(materialId)
    .select(MATERIAL_LIST_PROJECTION)
    .populate('course', 'code title')
    .populate('uploadedBy', 'name')
    .lean();
};

const deleteMaterial = async (materialId, requester) => {
  const material = await Material.findById(materialId);
  if (!material) throw new AppError('Không tìm thấy tài liệu', 404);
  await assertCourseOwnership(material.course, requester);

  const filePath = resolveStoredPath(material.storagePath, material.fileUrl);
  if (filePath) await fs.unlink(filePath).catch(() => {});
  await material.deleteOne();
};

module.exports = { uploadMaterial, listMaterials, registerDownload, getMaterialFile, updateMaterial, deleteMaterial };
