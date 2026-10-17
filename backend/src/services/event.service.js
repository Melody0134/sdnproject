const Post = require('../models/post.model');
const EventRegistration = require('../models/event-registration.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');

const getEvent = async (eventId) => {
  const event = await Post.findById(eventId)
    .select('author type title status eventDate registrationDeadline capacity registrationCount')
    .lean();
  if (!event || event.type !== 'event') throw new AppError('Không tìm thấy sự kiện', 404);
  return event;
};

const assertEventManager = (event, requester) => {
  if (requester.role === 'admin') return;
  if (event.author.toString() !== requester.id.toString()) {
    throw new AppError('Chỉ người tạo sự kiện hoặc quản trị viên mới có thể quản lý người tham gia', 403);
  }
};

const getRegistrationAvailabilityError = (event, now) => {
  if (event.status !== 'published') return new AppError('Sự kiện hiện không nhận đăng ký', 400);
  if (event.eventDate <= now) return new AppError('Sự kiện đã bắt đầu hoặc kết thúc', 400);
  if (event.registrationDeadline && event.registrationDeadline <= now) {
    return new AppError('Đã hết hạn đăng ký sự kiện', 400);
  }
  if (event.capacity != null && (event.registrationCount || 0) >= event.capacity) {
    return new AppError('Sự kiện đã đủ số lượng người tham gia', 409);
  }
  return new AppError('Không thể đăng ký sự kiện vào lúc này', 409);
};

const registerForEvent = async (eventId, participantId) => {
  const event = await getEvent(eventId);
  const now = new Date();
  if (event.status !== 'published' || event.eventDate <= now ||
    (event.registrationDeadline && event.registrationDeadline <= now) ||
    (event.capacity != null && (event.registrationCount || 0) >= event.capacity)) {
    throw getRegistrationAvailabilityError(event, now);
  }

  let registration;
  try {
    registration = await EventRegistration.create({ event: eventId, participant: participantId });
  } catch (err) {
    if (err.code === 11000) throw new AppError('Bạn đã đăng ký sự kiện này', 409);
    throw err;
  }

  const registrationFilter = {
    _id: eventId,
    type: 'event',
    status: 'published',
    eventDate: { $gt: now },
    $and: [
      { $or: [{ registrationDeadline: null }, { registrationDeadline: { $gt: now } }] },
      {
        $expr: {
          $or: [
            { $eq: [{ $ifNull: ['$capacity', null] }, null] },
            { $lt: [{ $ifNull: ['$registrationCount', 0] }, '$capacity'] },
          ],
        },
      },
    ],
  };
  const reservedEvent = await Post.findOneAndUpdate(
    registrationFilter,
    { $inc: { registrationCount: 1 } },
    { new: true }
  ).select('capacity registrationCount');

  if (!reservedEvent) {
    await EventRegistration.updateOne(
      { _id: registration._id, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date(), cancelledBy: participantId }
    );
    const currentEvent = await getEvent(eventId);
    throw getRegistrationAvailabilityError(currentEvent, new Date());
  }

  return registration;
};

const cancelActiveRegistration = async (eventId, participantId, cancelledBy) => {
  const registration = await EventRegistration.findOneAndUpdate(
    { event: eventId, participant: participantId, status: 'active' },
    { status: 'cancelled', cancelledAt: new Date(), cancelledBy },
    { new: true }
  );
  if (!registration) throw new AppError('Không tìm thấy đăng ký đang hoạt động', 404);
  await Post.updateOne({ _id: eventId, registrationCount: { $gt: 0 } }, { $inc: { registrationCount: -1 } });
  return registration;
};

const cancelRegistration = async (eventId, participantId) => {
  await getEvent(eventId);
  return cancelActiveRegistration(eventId, participantId, participantId);
};

const listParticipants = async (eventId, requester, query) => {
  const event = await getEvent(eventId);
  assertEventManager(event, requester);
  const { page, limit, skip } = parsePagination(query);
  const filter = { event: eventId, status: 'active' };
  const [items, total] = await Promise.all([
    EventRegistration.find(filter)
      .select('participant createdAt')
      .populate('participant', 'name email role avatarUrl major')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    EventRegistration.countDocuments(filter),
  ]);
  return buildPageResult(items, total, page, limit);
};

const removeParticipant = async (eventId, participantId, requester) => {
  const event = await getEvent(eventId);
  assertEventManager(event, requester);
  return cancelActiveRegistration(eventId, participantId, requester.id);
};

const getRegistrationState = async (eventId, participantId) => {
  return Boolean(await EventRegistration.exists({ event: eventId, participant: participantId, status: 'active' }));
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  listParticipants,
  removeParticipant,
  getRegistrationState,
};
