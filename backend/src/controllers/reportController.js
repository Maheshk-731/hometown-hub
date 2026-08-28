const Report = require('../models/Report');

const VALID_TARGET_TYPES = ['post', 'comment', 'user', 'community'];

// @desc    File a report against a post, comment, user, or community
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !VALID_TARGET_TYPES.includes(targetType)) {
      return res.status(400).json({ message: `targetType must be one of: ${VALID_TARGET_TYPES.join(', ')}` });
    }
    if (!targetId) {
      return res.status(400).json({ message: 'targetId is required' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'A reason for the report is required' });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      targetType,
      targetId,
      reason,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error filing report', error: error.message });
  }
};

module.exports = { createReport };
