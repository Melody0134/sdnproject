const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
    decidedAt: { type: Date, default: null },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

joinRequestSchema.index(
  { team: 1, applicant: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);
joinRequestSchema.index({ applicant: 1, status: 1 });
joinRequestSchema.index({ team: 1, status: 1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
