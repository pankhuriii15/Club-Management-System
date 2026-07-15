const express = require('express');
const router = express.Router();
const { protect, isStaff } = require('../middleware/authMiddleware');
const { upload, uploadImage } = require('../middleware/uploadMiddleware');

// @desc Upload an image file (Logo, Banner, Photo)
// @route POST /api/upload
// @access Private/Staff
router.post('/', protect, isStaff, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided for upload' });
    }

    // Process file (Cloudinary upload or static uploads/ folder path)
    const fileUrl = await uploadImage(req.file);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    console.error('File upload route error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
