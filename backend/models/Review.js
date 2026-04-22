const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    },
    // Instructor reply
    instructorReply: {
      comment:   { type: String, default: '' },
      repliedAt: Date,
    },
    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One review per user per course
ReviewSchema.index({ user: 1, course: 1 }, { unique: true });
ReviewSchema.index({ course: 1 });

// ─── Recalculate average rating on save ───────────────────────────────────────
ReviewSchema.statics.calcAverageRating = async function (courseId) {
  const stats = await this.aggregate([
    { $match: { course: courseId } },
    { $group: { _id: '$course', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const Course = require('./Course');
  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount:   stats[0].count,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, { averageRating: 0, reviewCount: 0 });
  }
};

ReviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.course);
});

ReviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.course);
});

module.exports = mongoose.model('Review', ReviewSchema);
