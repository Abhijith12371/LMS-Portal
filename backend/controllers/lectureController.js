const Lecture  = require('../models/Lecture');
const Section  = require('../models/Section');
const Course   = require('../models/Course');
const cloudinary = require('../config/cloudinary');

// ─── @route  POST /api/lectures  (instructor/admin) ──────────────────────────
exports.createLecture = async (req, res) => {
  const { sectionId, courseId, title, description, isFree, order } = req.body;

  // Verify section exists and belongs to instructor
  const section = await Section.findById(sectionId).populate('course');
  if (!section) return res.status(404).json({ success: false, message: 'Section not found.' });

  if (section.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const lecture = await Lecture.create({
    section: sectionId,
    course:  courseId,
    title,
    description,
    isFree:  isFree || false,
    order:   order  || section.lectures.length,
    video:   req.file ? { public_id: req.file.filename, url: req.file.path, duration: 0 } : {},
  });

  // Add lecture to section
  await Section.findByIdAndUpdate(sectionId, { $push: { lectures: lecture._id } });

  // Update course lecture count
  await Course.findByIdAndUpdate(courseId, { $inc: { totalLectures: 1 } });

  res.status(201).json({ success: true, lecture });
};

// ─── @route  PUT /api/lectures/:id ───────────────────────────────────────────
exports.updateLecture = async (req, res) => {
  let lecture = await Lecture.findById(req.params.id).populate('course');
  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found.' });

  if (lecture.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  if (req.file) {
    // Delete old video
    if (lecture.video?.public_id) {
      await cloudinary.uploader.destroy(lecture.video.public_id, { resource_type: 'video' });
    }
    req.body.video = { public_id: req.file.filename, url: req.file.path, duration: 0 };
  }

  lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  res.status(200).json({ success: true, lecture });
};

// ─── @route  DELETE /api/lectures/:id ────────────────────────────────────────
exports.deleteLecture = async (req, res) => {
  const lecture = await Lecture.findById(req.params.id).populate('course');
  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found.' });

  if (lecture.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  // Delete video from Cloudinary
  if (lecture.video?.public_id) {
    await cloudinary.uploader.destroy(lecture.video.public_id, { resource_type: 'video' });
  }

  // Remove from section
  await Section.findByIdAndUpdate(lecture.section, { $pull: { lectures: lecture._id } });
  await Course.findByIdAndUpdate(lecture.course._id, { $inc: { totalLectures: -1 } });

  await lecture.deleteOne();

  res.status(200).json({ success: true, message: 'Lecture deleted.' });
};

// ─── @route  GET /api/lectures/:id ───────────────────────────────────────────
exports.getLecture = async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found.' });

  res.status(200).json({ success: true, lecture });
};
