const multer = require('multer');

// Files are kept in memory (as a Buffer) and streamed straight to Cloudinary
// instead of being written to local disk, since local disk storage doesn't
// survive redeploys on hosts like Render's free tier.
const storage = multer.memoryStorage();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;