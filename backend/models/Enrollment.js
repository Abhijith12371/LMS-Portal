const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // Array of completed lecture IDs
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
    // Overall progress percentage (0–100)
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    // Last lecture the student was on
    lastWatched: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
    isCompleted: { type: Boolean, default: false },
    completedAt:  Date,
    // Payment this enrollment is linked to
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    // Certificate
    certificateUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// Ensure one enrollment per user-course pair
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
