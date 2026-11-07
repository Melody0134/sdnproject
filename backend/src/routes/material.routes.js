const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { uploadRateLimit } = require('../middleware/rate-limit');
const {
  uploadMaterialSchema,
  updateMaterialSchema,
  listMaterialsQuerySchema,
} = require('../validators/material.validator');
const materialController = require('../controllers/material.controller');

const router = express.Router();

router.use(protect);

router.get('/', validate(listMaterialsQuerySchema, 'query'), materialController.listMaterials);
router.post(
  '/',
  restrictTo('lecturer', 'admin'),
  uploadRateLimit,
  upload.single('file'),
  validate(uploadMaterialSchema),
  materialController.uploadMaterial
);
router.get('/:id/download', materialController.downloadMaterial);
router.post('/:id/download', materialController.downloadMaterial);
router.patch(
  '/:id',
  restrictTo('lecturer', 'admin'),
  validate(updateMaterialSchema),
  materialController.updateMaterial
);
router.delete('/:id', restrictTo('lecturer', 'admin'), materialController.deleteMaterial);

module.exports = router;
