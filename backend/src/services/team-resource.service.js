const fs = require('fs/promises');
const Team = require('../models/team.model');
const TeamResource = require('../models/team-resource.model');
const AppError = require('../utils/app-error');
const { publicUrlFor, protectedUrlFor, resolveStoredPath } = require('../utils/uploads');

const assertMember = async (teamId, userId) => {
  const team = await Team.findById(teamId).lean();
  if (!team) throw new AppError('Không tìm thấy nhóm', 404);
  const isMember = team.members.some((m) => m.user.toString() === userId.toString());
  if (!isMember) throw new AppError('Chỉ thành viên nhóm mới có thể truy cập không gian làm việc', 403);
  return team;
};

const addFileResource = async (teamId, userId, file, title) => {
  await assertMember(teamId, userId);
  const resource = await TeamResource.create({
    team: teamId,
    uploadedBy: userId,
    type: 'file',
    title: title || file.originalname,
    fileUrl: publicUrlFor(file),
    storagePath: file.path,
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  });
  resource.fileUrl = protectedUrlFor('teamResource', { teamId, resourceId: resource._id });
  await resource.save();
  return TeamResource.findById(resource._id).select('-storagePath').lean();
};

const addLinkResource = async (teamId, userId, { title, linkUrl }) => {
  await assertMember(teamId, userId);
  return TeamResource.create({ team: teamId, uploadedBy: userId, type: 'link', title, linkUrl });
};

const listResources = async (teamId, userId) => {
  await assertMember(teamId, userId);
  const resources = await TeamResource.find({ team: teamId })
    .populate('uploadedBy', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .lean();
  return resources.map((resource) => ({
    ...resource,
    fileUrl: resource.type === 'file'
      ? protectedUrlFor('teamResource', { teamId, resourceId: resource._id })
      : resource.fileUrl,
  }));
};

const deleteResource = async (teamId, resourceId, requester) => {
  const team = await assertMember(teamId, requester.id);
  const resource = await TeamResource.findOne({ _id: resourceId, team: teamId }).select('+storagePath');
  if (!resource) throw new AppError('Không tìm thấy tài nguyên', 404);

  const isOwner = resource.uploadedBy.toString() === requester.id.toString();
  const isLeader = team.leader.toString() === requester.id.toString();
  if (!isOwner && !isLeader) throw new AppError('Bạn không có quyền xóa tài nguyên này', 403);

  if (resource.type === 'file') {
    const filePath = resolveStoredPath(resource.storagePath, resource.fileUrl);
    if (filePath) await fs.unlink(filePath).catch(() => {});
  }
  await resource.deleteOne();
};

const getFile = async (teamId, resourceId, userId) => {
  await assertMember(teamId, userId);
  const resource = await TeamResource.findOne({ _id: resourceId, team: teamId, type: 'file' })
    .select('+storagePath')
    .lean();
  if (!resource) throw new AppError('Không tìm thấy tài nguyên', 404);
  const filePath = resolveStoredPath(resource.storagePath, resource.fileUrl);
  if (!filePath) throw new AppError('Không tìm thấy tệp tài nguyên', 404);
  return { filePath, fileName: resource.fileName, mimeType: resource.mimeType };
};

module.exports = { addFileResource, addLinkResource, listResources, deleteResource, getFile };
