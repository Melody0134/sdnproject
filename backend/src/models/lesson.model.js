const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: '', maxlength: 10000 },
    order: { type: Number, default: 0 },
    materials: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }], default: [] },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1, createdAt: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
