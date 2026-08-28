const Community = require('../models/Community');
const User = require('../models/User');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @desc    List communities awaiting platform approval
// @route   GET /api/admin/communities/pending
// @access  Private (platform admin)
const listPendingCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('createdBy', 'name email');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pending communities', error: error.message });
  }
};

// @desc    Approve or reject a community creation request
// @route   PATCH /api/admin/communities/:id
// @access  Private (platform admin)
const reviewCommunity = async (req, res) => {
  try {
    const { decision } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'approved' or 'rejected'" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    community.status = decision;
    await community.save();

    await Notification.create({
      user: community.createdBy,
      type: 'community_approved',
      message:
        decision === 'approved'
          ? `Your community "${community.name}" was approved and is now live.`
          : `Your community "${community.name}" was not approved.`,
      relatedCommunity: community._id,
    });

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error reviewing community', error: error.message });
  }
};

// @desc    List platform users (paginated, optional search)
// @route   GET /api/admin/users
// @access  Private (platform admin)
const listUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ page, limit, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
};

// @desc    Update a user's platform role or active status
// @route   PATCH /api/admin/users/:id
// @access  Private (platform admin)
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;

    if (role && !['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: "role must be one of 'user', 'moderator', 'admin'" });
    }

    if (String(req.user._id) === String(req.params.id) && role && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user', error: error.message });
  }
};

// @desc    List reports (open by default)
// @route   GET /api/admin/reports
// @access  Private (platform admin)
const listReports = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { status: status || 'open' };

    const reports = await Report.find(query).sort({ createdAt: -1 }).populate('reportedBy', 'name email');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching reports', error: error.message });
  }
};

// @desc    Resolve or dismiss a report
// @route   PATCH /api/admin/reports/:id
// @access  Private (platform admin)
const resolveReport = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;

    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: "status must be 'resolved' or 'dismissed'" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    report.resolvedBy = req.user._id;
    report.resolutionNote = resolutionNote || '';
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error resolving report', error: error.message });
  }
};

module.exports = {
  listPendingCommunities,
  reviewCommunity,
  listUsers,
  updateUser,
  listReports,
  resolveReport,
};
