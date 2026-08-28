// @desc    Upload an image, returns its public URL
// @route   POST /api/uploads/image
// @access  Private
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file was provided' });
  }

  const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;

  res.status(201).json({ url });
};

module.exports = { uploadImage };
