const mongoose = require('mongoose');

const teamResourceSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['file', 'link'], required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    fileUrl: { type: String, default: '' },
    storagePath: { type: String, default: '', select: false },
    fileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    linkUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

teamResourceSchema.index({ team: 1, createdAt: -1 });

module.exports = mongoose.model('TeamResource', teamResourceSchema);
