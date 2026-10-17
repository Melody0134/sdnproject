const SystemSetting = require('../models/system-setting.model');

const getSystemSetting = async () =>
  SystemSetting.findOneAndUpdate(
    { singletonKey: 'system' },
    { $setOnInsert: { singletonKey: 'system' } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
    .select('-singletonKey')
    .lean();

const updateSystemSetting = async (updates, adminId) =>
  SystemSetting.findOneAndUpdate(
    { singletonKey: 'system' },
    { $set: { ...updates, updatedBy: adminId }, $setOnInsert: { singletonKey: 'system' } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  )
    .select('-singletonKey')
    .lean();

module.exports = { getSystemSetting, updateSystemSetting };
