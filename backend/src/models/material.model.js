const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 1000 },
    fileUrl: { type: String, required: true },
    storagePath: { type: String, default: '', select: false },
    fileName: { type: String, required: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

materialSchema.index({ course: 1, createdAt: -1 });
materialSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Material', materialSchema);
