const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: 'system', unique: true, immutable: true },
    platformName: { type: String, default: 'STE', trim: true, maxlength: 100 },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistration: { type: Boolean, default: true },
    supportEmail: { type: String, default: '', lowercase: true, trim: true },
    maxUploadSizeMb: { type: Number, default: 10, min: 1, max: 100 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
