const User       = require('../models/User');
const Enrollment = require('../models/Enrollment');
const cloudinary = require('../config/cloudinary');

// ─── @route  GET /api/users  (admin only) ────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;

  const filter = {};
  if (role)   filter.role  = role;
  if (search) filter.$or   = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    page:  Number(page),
    pages: Math.ceil(total / limit),
    users,
  });
};

// ─── @route  GET /api/users/:id ───────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.status(200).json({ success: true, user });
};

// ─── @route  PUT /api/users/profile ──────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const allowed = ['name', 'bio', 'website', 'social', 'expertise'];
  const updates = {};
  allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true, runValidators: true,
  }).select('-password');

  res.status(200).json({ success: true, user });
};

// ─── @route  PUT /api/users/avatar ───────────────────────────────────────────
exports.uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

  const user = await User.findById(req.user.id);

  // Delete old Cloudinary avatar
  if (user.avatar && user.avatar.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  user.avatar = { public_id: req.file.filename, url: req.file.path };
  await user.save();

  res.status(200).json({ success: true, avatar: user.avatar });
};

// ─── @route  DELETE /api/users/:id  (admin only) ─────────────────────────────
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  // Soft delete — just deactivate
  user.isActive = false;
  await user.save();

  res.status(200).json({ success: true, message: 'User deactivated successfully.' });
};

// ─── @route  PATCH /api/users/:id/role  (admin only) ─────────────────────────
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['student', 'instructor', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  res.status(200).json({ success: true, user });
};

// ─── @route  GET /api/users/instructors ──────────────────────────────────────
exports.getInstructors = async (req, res) => {
  const instructors = await User.find({ role: 'instructor', isActive: true })
    .select('name email bio avatar expertise totalStudents')
    .sort({ totalStudents: -1 });

  res.status(200).json({ success: true, instructors });
};
