const AppError = require('../utils/app-error');
const asyncHandler = require('../utils/async-handler');
const materialService = require('../services/material.service');

const uploadMaterial = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Vui lòng chọn tệp tài liệu để tải lên', 400);
  const material = await materialService.uploadMaterial(req.user, req.file, req.body);
  res.status(201).json({ success: true, data: { material } });
});

const listMaterials = asyncHandler(async (req, res) => {
  const result = await materialService.listMaterials(req.query, req.user);
  res.status(200).json({ success: true, ...result });
});

const downloadMaterial = asyncHandler(async (req, res) => {
  const { filePath, fileName, mimeType } = await materialService.getMaterialFile(req.params.id, req.user);
  res.type(mimeType).download(filePath, fileName);
});

const updateMaterial = asyncHandler(async (req, res) => {
  const material = await materialService.updateMaterial(req.params.id, req.user, req.body);
  res.status(200).json({ success: true, data: { material } });
});

const deleteMaterial = asyncHandler(async (req, res) => {
  await materialService.deleteMaterial(req.params.id, req.user);
  res.status(204).send();
});

module.exports = { uploadMaterial, listMaterials, downloadMaterial, updateMaterial, deleteMaterial };
