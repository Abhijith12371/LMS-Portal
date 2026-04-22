const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      maxlength: [200, 'Section title cannot exceed 200 characters'],
    },
    order: { type: Number, default: 0 },
    lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  },
  { timestamps: true }
);

SectionSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Section', SectionSchema);
