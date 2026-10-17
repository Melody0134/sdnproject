const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'love', 'clap'], default: 'like' },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['academic_update', 'event'], required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000 },
    eventDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    location: { type: String, default: '', trim: true, maxlength: 300 },
    capacity: { type: Number, default: null, min: 1 },
    registrationDeadline: { type: Date, default: null },
    onlineUrl: { type: String, default: '', trim: true, maxlength: 2000 },
    registrationCount: { type: Number, default: 0, min: 0 },
    tagsNeeded: { type: [String], default: [] },
    reactions: { type: [reactionSchema], default: [] },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
  },
  { timestamps: true }
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ type: 1 });
postSchema.index({ type: 1, status: 1, eventDate: 1 });

module.exports = mongoose.model('Post', postSchema);
