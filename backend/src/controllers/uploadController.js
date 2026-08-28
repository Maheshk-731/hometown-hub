const cloudinary = require('../config/cloudinary');

// @desc    Upload an image, returns its public (Cloudinary) URL
// @route   POST /api/uploads/image
// @access  Private
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file was provided' });
  }

  try {
    const url = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'hometown-hub', resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(201).json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
};

module.exports = { uploadImage };