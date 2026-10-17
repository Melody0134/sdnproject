const mongoose = require('mongoose');

const teamInvitationSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    invitee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    decidedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

teamInvitationSchema.index(
  { team: 1, invitee: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);
teamInvitationSchema.index({ invitee: 1, status: 1, createdAt: -1 });
teamInvitationSchema.index({ team: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('TeamInvitation', teamInvitationSchema);
