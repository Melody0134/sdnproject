const Club = require('../models/club.model');
const ClubRegistration = require('../models/club-registration.model');
const Taxonomy = require('../models/taxonomy.model');
const User = require('../models/user.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');

const assertCategory = async (categoryId) => {
  if (!categoryId) return;
  const category = await Taxonomy.findOne({ _id: categoryId, type: 'category', isActive: true }).select('_id').lean();
  if (!category) throw new AppError('Danh mục câu lạc bộ không hợp lệ hoặc đã ngừng sử dụng', 422);
};

const assertLeader = async (leaderId) => {
  const leader = await User.findOne({ _id: leaderId, isActive: true }).select('_id role').lean();
  if (!leader) throw new AppError('Không tìm thấy người phụ trách đang hoạt động', 422);
  return leader;
};

const listClubs = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.search) filter.$text = { $search: query.search };
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  const [clubs, total] = await Promise.all([
    Club.find(filter)
      .select('-normalizedName')
      .populate('leader', 'name email avatarUrl')
      .populate('category', 'type name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Club.countDocuments(filter),
  ]);
  return buildPageResult(clubs, total, page, limit);
};

const getClubById = async (clubId) => {
  const club = await Club.findById(clubId)
    .select('-normalizedName')
    .populate('leader', 'name email avatarUrl')
    .populate('category', 'type name')
    .lean();
  if (!club) throw new AppError('Không tìm thấy câu lạc bộ', 404);
  return club;
};

const createClub = async (payload) => {
  await Promise.all([assertCategory(payload.category), assertLeader(payload.leader)]);
  return Club.create(payload);
};

const updateClub = async (clubId, updates) => {
  await Promise.all([assertCategory(updates.category), updates.leader ? assertLeader(updates.leader) : null]);
  const club = await Club.findById(clubId);
  if (!club) throw new AppError('Không tìm thấy câu lạc bộ', 404);
  Object.assign(club, updates);
  await club.save();
  return club;
};

const deleteClub = async (clubId) => {
  const club = await Club.findByIdAndDelete(clubId).select('_id').lean();
  if (!club) throw new AppError('Không tìm thấy câu lạc bộ', 404);
};

const createRegistration = async (applicantId, payload) => {
  await assertCategory(payload.category);
  const normalizedClubName = payload.clubName.trim().toLocaleLowerCase('vi');
  const existingClub = await Club.findOne({ normalizedName: normalizedClubName }).select('_id').lean();
  if (existingClub) throw new AppError('Tên câu lạc bộ đã tồn tại', 409);
  return ClubRegistration.create({ ...payload, applicant: applicantId });
};

const listRegistrations = async (query, applicantId = null) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (applicantId) filter.applicant = applicantId;
  const [registrations, total] = await Promise.all([
    ClubRegistration.find(filter)
      .select('-normalizedClubName')
      .populate('applicant', 'name email role')
      .populate('category', 'type name')
      .populate('decidedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ClubRegistration.countDocuments(filter),
  ]);
  return buildPageResult(registrations, total, page, limit);
};

const claimRegistration = async (registrationId, adminId) => {
  const registration = await ClubRegistration.findOneAndUpdate(
    { _id: registrationId, status: 'pending', decidedBy: null },
    { decidedBy: adminId },
    { new: true }
  );
  if (registration) return registration;
  const existing = await ClubRegistration.findById(registrationId).select('status').lean();
  if (!existing) throw new AppError('Không tìm thấy hồ sơ đăng ký câu lạc bộ', 404);
  throw new AppError('Hồ sơ này đã được xử lý', 409);
};

const approveRegistration = async (registrationId, adminId) => {
  const registration = await claimRegistration(registrationId, adminId);
  let club;
  try {
    await Promise.all([assertCategory(registration.category), assertLeader(registration.applicant)]);
    club = await Club.create({
      name: registration.clubName,
      description: registration.description,
      category: registration.category,
      leader: registration.applicant,
      contactEmail: registration.contactEmail,
      logoUrl: registration.logoUrl,
    });
    registration.status = 'approved';
    registration.club = club._id;
    registration.decidedBy = adminId;
    registration.decidedAt = new Date();
    await registration.save();
    await User.updateOne({ _id: registration.applicant, role: 'student' }, { role: 'club_leader' });
    return registration;
  } catch (error) {
    if (club) await Club.deleteOne({ _id: club._id });
    await ClubRegistration.updateOne(
      { _id: registrationId, status: 'pending', decidedBy: adminId },
      { $set: { decidedBy: null }, $unset: { decidedAt: 1, club: 1 } }
    );
    throw error;
  }
};

const rejectRegistration = async (registrationId, adminId, rejectionReason) => {
  const registration = await ClubRegistration.findOneAndUpdate(
    { _id: registrationId, status: 'pending', decidedBy: null },
    { status: 'rejected', rejectionReason, decidedBy: adminId, decidedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (registration) return registration;
  const existing = await ClubRegistration.findById(registrationId).select('status').lean();
  if (!existing) throw new AppError('Không tìm thấy hồ sơ đăng ký câu lạc bộ', 404);
  throw new AppError('Hồ sơ này đã được xử lý', 409);
};

module.exports = {
  listClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  createRegistration,
  listRegistrations,
  approveRegistration,
  rejectRegistration,
};
