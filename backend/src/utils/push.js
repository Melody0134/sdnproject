const User = require('../models/user.model');

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const APP_TITLE = 'STE';

const isExpoToken = (token) =>
  typeof token === 'string' && (token.startsWith('ExponentPushToken') || token.startsWith('ExpoPushToken'));

const chunk = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const deliver = async (messages) => {
  if (!messages.length || typeof fetch !== 'function') return;
  for (const batch of chunk(messages, 100)) {
    try {
      await fetch(EXPO_PUSH_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
    } catch (err) {
      console.error('[push] gửi thông báo đẩy thất bại:', err.message);
    }
  }
};

const sendPushToUsers = async (userIds, { body, data = {} }) => {
  if (!userIds.length) return;
  const users = await User.find({ _id: { $in: userIds }, pushTokens: { $exists: true, $ne: [] } })
    .select('pushTokens')
    .lean();

  const messages = [];
  for (const user of users) {
    for (const token of user.pushTokens || []) {
      if (isExpoToken(token)) {
        messages.push({ to: token, title: APP_TITLE, body, data, sound: 'default' });
      }
    }
  }

  await deliver(messages);
};

module.exports = { sendPushToUsers };
