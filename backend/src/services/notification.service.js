const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');
const { sendPushToUsers } = require('../utils/push');

const notify = async ({ recipient, type, message, link = '' }) => {
  const doc = await Notification.create({ recipient, type, message, link });
  sendPushToUsers([recipient], { body: message, data: { type, link } }).catch(() => {});
  return doc;
};

const notifyMany = async (recipients, { type, message, link = '' }) => {
  if (!recipients.length) return;
  await Notification.insertMany(recipients.map((recipient) => ({ recipient, type, message, link })));
  sendPushToUsers(recipients, { body: message, data: { type, link } }).catch(() => {});
};

const listForUser = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { recipient: userId };
  if (query.unreadOnly === 'true') filter.isRead = false;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return { ...buildPageResult(items, total, page, limit), unreadCount };
};

const markRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  ).lean();
  if (!notification) throw new AppError('Không tìm thấy thông báo', 404);
  return notification;
};

const markAllRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

const sendByAdmin = async ({ recipient, audience, message, link }) => {
  if (recipient) {
    const user = await User.findOne({ _id: recipient, isActive: true }).select('_id').lean();
    if (!user) throw new AppError('Không tìm thấy người dùng đang hoạt động', 404);
    await notify({ recipient: user._id, type: 'admin_message', message, link });
    return 1;
  }

  const filter = { isActive: true };
  if (audience !== 'all') filter.role = audience;
  const users = await User.find(filter).select('_id').lean();
  const recipients = users.map((user) => user._id);
  await notifyMany(recipients, { type: 'admin_message', message, link });
  return recipients.length;
};

module.exports = { notify, notifyMany, listForUser, markRead, markAllRead, sendByAdmin };
