const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 150 },
    normalizedName: { type: String, required: true, unique: true, maxlength: 150 },
    description: { type: String, default: '', maxlength: 3000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxonomy', default: null },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    logoUrl: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

clubSchema.pre('validate', function normalizeName(next) {
  if (this.name) this.normalizedName = this.name.trim().toLocaleLowerCase('vi');
  next();
});

clubSchema.index({ name: 'text', description: 'text' });
clubSchema.index({ status: 1, createdAt: -1 });
clubSchema.index({ category: 1, createdAt: -1 });
clubSchema.index({ leader: 1 });

module.exports = mongoose.model('Club', clubSchema);
