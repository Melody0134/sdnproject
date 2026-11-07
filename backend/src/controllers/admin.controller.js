const asyncHandler = require('../utils/async-handler');
const adminService = require('../services/admin.service');
const reportService = require('../services/report.service');
const systemSettingService = require('../services/system-setting.service');

const getSystemStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getSystemStats();
  res.status(200).json({ success: true, data: { stats } });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const activity = await adminService.getRecentActivity();
  res.status(200).json({ success: true, data: { activity } });
});

const generateReport = asyncHandler(async (req, res) => {
  const report = await reportService.getReport(req.query);
  if (req.query.format === 'csv') {
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="bao-cao-he-thong.csv"');
    return res.status(200).send(reportService.buildCsv(report));
  }
  return res.status(200).json({ success: true, data: { report } });
});

const getSystemSetting = asyncHandler(async (req, res) => {
  const setting = await systemSettingService.getSystemSetting();
  res.status(200).json({ success: true, data: { setting } });
});

const updateSystemSetting = asyncHandler(async (req, res) => {
  const setting = await systemSettingService.updateSystemSetting(req.body, req.user.id);
  res.status(200).json({ success: true, data: { setting } });
});

module.exports = {
  getSystemStats,
  getRecentActivity,
  generateReport,
  getSystemSetting,
  updateSystemSetting,
};
