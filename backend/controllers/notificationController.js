const Notification = require('../models/Notification');

// ─── @route  GET /api/notifications ──────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const total = await Notification.countDocuments({ user: req.user.id });
  const notifications = await Notification.find({ user: req.user.id })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

  res.status(200).json({ success: true, total, unreadCount, notifications });
};

// ─── @route  PATCH /api/notifications/:id/read ───────────────────────────────
exports.markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });

  res.status(200).json({ success: true, notification });
};

// ─── @route  PATCH /api/notifications/read-all ───────────────────────────────
exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read.' });
};

// ─── @route  DELETE /api/notifications/:id ───────────────────────────────────
exports.deleteNotification = async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
  res.status(200).json({ success: true, message: 'Notification deleted.' });
};
