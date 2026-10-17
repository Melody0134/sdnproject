const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'join_request_received',
        'join_request_accepted',
        'join_request_rejected',
        'team_invitation_received',
        'team_invitation_accepted',
        'team_invitation_rejected',
        'team_member_removed',
        'announcement_posted',
        'quiz_published',
        'post_commented',
        'assignment_posted',
        'assignment_graded',
        'admin_message',
      ],
      required: true,
    },
    message: { type: String, required: true, maxlength: 300 },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
