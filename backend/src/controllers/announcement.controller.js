const asyncHandler = require('../utils/async-handler');
const announcementService = require('../services/announcement.service');

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.createAnnouncement(req.user, req.body);
  res.status(201).json({ success: true, data: { announcement } });
});

const broadcastAnnouncement = asyncHandler(async (req, res) => {
  const result = await announcementService.broadcastAnnouncement(req.user, req.body);
  res.status(201).json({ success: true, data: result });
});

const listAnnouncements = asyncHandler(async (req, res) => {
  const result = await announcementService.listAnnouncements(req.query, req.user);
  res.status(200).json({ success: true, ...result });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.updateAnnouncement(req.params.id, req.user, req.body);
  res.status(200).json({ success: true, data: { announcement } });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncement(req.params.id, req.user);
  res.status(204).send();
});

module.exports = {
  createAnnouncement,
  broadcastAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
