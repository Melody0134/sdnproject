const mongoose = require('mongoose');

const TAXONOMY_TYPES = ['skill', 'major', 'category'];

const taxonomySchema = new mongoose.Schema(
  {
    type: { type: String, enum: TAXONOMY_TYPES, required: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    normalizedName: { type: String, required: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

taxonomySchema.pre('validate', function normalizeName(next) {
  if (this.name) this.normalizedName = this.name.trim().toLocaleLowerCase('vi');
  next();
});

taxonomySchema.index({ type: 1, normalizedName: 1 }, { unique: true });
taxonomySchema.index({ type: 1, isActive: 1, name: 1 });
taxonomySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Taxonomy', taxonomySchema);
module.exports.TAXONOMY_TYPES = TAXONOMY_TYPES;
