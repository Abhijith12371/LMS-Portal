const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    discountPrice: { type: Number, default: 0 },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
        'DevOps', 'Cloud Computing', 'Cybersecurity', 'Design', 'Business',
        'Marketing', 'Photography', 'Music', 'Personal Development', 'Other',
      ],
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
    },
    language: { type: String, default: 'English' },
    thumbnail: {
      public_id: String,
      url: { type: String, default: '' },
    },
    previewVideo: {
      public_id: String,
      url: { type: String, default: '' },
    },
    // Course curriculum
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    // Aggregated stats
    totalDuration:   { type: Number, default: 0 },  // minutes
    totalLectures:   { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    // Ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0 },
    // What students learn
    learningOutcomes: [String],
    requirements:     [String],
    // Status
    isPublished: { type: Boolean, default: false },
    isFeatured:  { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ─── Indexes for search performance ──────────────────────────────────────────
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' });
CourseSchema.index({ category: 1, isPublished: 1 });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ averageRating: -1 });

// ─── Virtual: isFree ─────────────────────────────────────────────────────────
CourseSchema.virtual('isFree').get(function () {
  return this.price === 0;
});

module.exports = mongoose.model('Course', CourseSchema);
