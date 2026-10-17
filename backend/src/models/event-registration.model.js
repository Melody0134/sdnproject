const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

eventRegistrationSchema.index(
  { event: 1, participant: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);
eventRegistrationSchema.index({ event: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
