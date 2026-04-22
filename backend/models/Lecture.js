const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
      trim: true,
      maxlength: [200, 'Lecture title cannot exceed 200 characters'],
    },
    description: { type: String, maxlength: [1000, 'Description cannot exceed 1000 chars'] },
    video: {
      public_id: String,
      url:       { type: String, default: '' },
      duration:  { type: Number, default: 0 }, // seconds
    },
    // Attachments/resources
    resources: [
      {
        name:      String,
        url:       String,
        public_id: String,
      },
    ],
    order:  { type: Number, default: 0 },
    isFree: { type: Boolean, default: false }, // preview lecture
  },
  { timestamps: true }
);

LectureSchema.index({ section: 1, order: 1 });
LectureSchema.index({ course: 1 });

module.exports = mongoose.model('Lecture', LectureSchema);
