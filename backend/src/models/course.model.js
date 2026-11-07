const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    semester: { type: String, default: '', trim: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index({ lecturer: 1 });
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);
