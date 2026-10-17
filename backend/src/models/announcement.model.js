const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scope: { type: String, enum: ['global', 'course'], default: 'global' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    audience: { type: String, enum: ['all', 'students', 'lecturers'], default: 'all' },
    isBroadcast: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
  },
  { timestamps: true }
);

announcementSchema.index({ scope: 1, course: 1, status: 1, createdAt: -1 });
announcementSchema.index({ author: 1 });
announcementSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Announcement', announcementSchema);
