const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'enrollment', 'payment', 'course_published', 'new_review',
        'new_student', 'announcement', 'system',
      ],
      required: true,
    },
    title:   { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 500 },
    // Optional link (e.g., /courses/:id)
    link:    { type: String, default: '' },
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
