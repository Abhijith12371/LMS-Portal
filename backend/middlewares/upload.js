const multer  = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─── Image Upload (thumbnails, avatars) ───────────────────────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1280, crop: 'limit', quality: 'auto' }],
  },
});

// ─── Video Upload ─────────────────────────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  },
});

// ─── Document Upload ──────────────────────────────────────────────────────────
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms/documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
  },
});

// ─── Size Limits ──────────────────────────────────────────────────────────────
const fileSizeLimits = {
  image:    5  * 1024 * 1024, // 5 MB
  video:    500 * 1024 * 1024, // 500 MB
  document: 50  * 1024 * 1024, // 50 MB
};

const uploadImage    = multer({ storage: imageStorage,    limits: { fileSize: fileSizeLimits.image } });
const uploadVideo    = multer({ storage: videoStorage,    limits: { fileSize: fileSizeLimits.video } });
const uploadDocument = multer({ storage: documentStorage, limits: { fileSize: fileSizeLimits.document } });

module.exports = { uploadImage, uploadVideo, uploadDocument };
