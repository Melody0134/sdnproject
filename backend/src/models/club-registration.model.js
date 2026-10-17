const mongoose = require('mongoose');

const clubRegistrationSchema = new mongoose.Schema(
  {
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clubName: { type: String, required: true, trim: true, maxlength: 150 },
    normalizedClubName: { type: String, required: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 3000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxonomy', default: null },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    logoUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: '', maxlength: 1000 },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', default: null },
  },
  { timestamps: true }
);

clubRegistrationSchema.pre('validate', function normalizeClubName(next) {
  if (this.clubName) this.normalizedClubName = this.clubName.trim().toLocaleLowerCase('vi');
  next();
});

clubRegistrationSchema.index(
  { applicant: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);
clubRegistrationSchema.index(
  { normalizedClubName: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);
clubRegistrationSchema.index({ status: 1, createdAt: -1 });
clubRegistrationSchema.index({ applicant: 1, createdAt: -1 });

module.exports = mongoose.model('ClubRegistration', clubRegistrationSchema);
