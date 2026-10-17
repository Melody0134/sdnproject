const asyncHandler = require('../utils/async-handler');
const clubService = require('../services/club.service');

const listClubs = asyncHandler(async (req, res) => {
  const result = await clubService.listClubs(req.query);
  res.status(200).json({ success: true, ...result });
});

const getClub = asyncHandler(async (req, res) => {
  const club = await clubService.getClubById(req.params.id);
  res.status(200).json({ success: true, data: { club } });
});

const createClub = asyncHandler(async (req, res) => {
  const club = await clubService.createClub(req.body);
  res.status(201).json({ success: true, data: { club } });
});

const updateClub = asyncHandler(async (req, res) => {
  const club = await clubService.updateClub(req.params.id, req.body);
  res.status(200).json({ success: true, data: { club } });
});

const deleteClub = asyncHandler(async (req, res) => {
  await clubService.deleteClub(req.params.id);
  res.status(204).send();
});

const createRegistration = asyncHandler(async (req, res) => {
  const registration = await clubService.createRegistration(req.user.id, req.body);
  res.status(201).json({ success: true, data: { registration } });
});

const listMyRegistrations = asyncHandler(async (req, res) => {
  const result = await clubService.listRegistrations(req.query, req.user.id);
  res.status(200).json({ success: true, ...result });
});

const listRegistrations = asyncHandler(async (req, res) => {
  const result = await clubService.listRegistrations(req.query);
  res.status(200).json({ success: true, ...result });
});

const approveRegistration = asyncHandler(async (req, res) => {
  const registration = await clubService.approveRegistration(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { registration } });
});

const rejectRegistration = asyncHandler(async (req, res) => {
  const registration = await clubService.rejectRegistration(
    req.params.id,
    req.user.id,
    req.body.rejectionReason
  );
  res.status(200).json({ success: true, data: { registration } });
});

module.exports = {
  listClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  createRegistration,
  listMyRegistrations,
  listRegistrations,
  approveRegistration,
  rejectRegistration,
};
