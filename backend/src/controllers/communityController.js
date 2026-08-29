const Community = require('../models/Community');
const Membership = require('../models/Membership');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Event = require('../models/Event');
const Message = require('../models/Message');
const Report = require('../models/Report');

const slugify = (name, city) => {
  return `${name}-${city}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// @desc    Create a new community
// @route   POST /api/communities
// @access  Private
const createCommunity = async (req, res) => {
  try {
    const { name, city, state, country, description, rules, coverImageUrl, avatarUrl } = req.body;

    if (!name || !city) {
      return res.status(400).json({ message: 'Community name and city are required' });
    }

    let slug = slugify(name, city);
    const existingSlug = await Community.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const community = await Community.create({
      name,
      slug,
      place: { city, state, country },
      description: description || '',
      rules: rules || '',
      coverImageUrl: coverImageUrl || '',
      avatarUrl: avatarUrl || '',
      createdBy: req.user._id,
      status: 'approved', // Automatically approve the community upon creation
    });

    // Creator becomes an approved member of their own community
   const membership = await Membership.create({
  user: req.user._id,
  community: community._id,
  role: 'admin',
  status: 'approved',
});

await Community.findByIdAndUpdate(community._id, { $inc: { memberCount: 1 } });

res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating community', error: error.message });
  }
};

// @desc    List/browse communities (approved only), optional city filter
// @route   GET /api/communities
// @access  Public
const listCommunities = async (req, res) => {
  try {
    const { city, search } = req.query;
    const query = { status: 'approved' };

    if (city) {
      query['place.city'] = new RegExp(`^${city}$`, 'i');
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { 'place.city': regex }, { 'place.state': regex }];
    }

    const communities = await Community.find(query).sort({ memberCount: -1 });
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching communities', error: error.message });
  }
};

// @desc    Get single community by slug
// @route   GET /api/communities/:slug
// @access  Public
const getCommunityBySlug = async (req, res) => {
  try {
    const community = await Community.findOne({ slug: req.params.slug });
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching community', error: error.message });
  }
};

// @desc    Request to join a community
// @route   POST /api/communities/:id/join
// @access  Private
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const existing = await Membership.findOne({ user: req.user._id, community: community._id });
    if (existing) {
      return res.status(409).json({ message: `Membership already ${existing.status}` });
    }

    const membership = await Membership.create({
      user: req.user._id,
      community: community._id,
      role: 'member',
      status: 'pending',
    });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: 'Server error joining community', error: error.message });
  }
};

// @desc    Leave a community
// @route   DELETE /api/communities/:id/leave
// @access  Private
const leaveCommunity = async (req, res) => {
  try {
    const membership = await Membership.findOne({ user: req.user._id, community: req.params.id });
    if (!membership) {
      return res.status(404).json({ message: 'You are not a member of this community' });
    }

    await Membership.deleteOne({ _id: membership._id });

    if (membership.status === 'approved') {
      await Community.findByIdAndUpdate(req.params.id, { $inc: { memberCount: -1 } });
    }

    res.json({ message: 'Left community successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error leaving community', error: error.message });
  }
};

// @desc    List pending membership requests for a community (moderator/admin only)
// @route   GET /api/communities/:id/requests
// @access  Private (community moderator/admin)
const listJoinRequests = async (req, res) => {
  try {
    const requesterMembership = await Membership.findOne({
      user: req.user._id,
      community: req.params.id,
      status: 'approved',
    });

    if (!requesterMembership || !['admin', 'moderator'].includes(requesterMembership.role)) {
      return res.status(403).json({ message: 'Only community moderators or admins can view requests' });
    }

    const requests = await Membership.find({ community: req.params.id, status: 'pending' }).populate(
      'user',
      'name email avatarUrl'
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching join requests', error: error.message });
  }
};

// @desc    Approve or reject a membership request
// @route   PATCH /api/communities/:id/requests/:membershipId
// @access  Private (community moderator/admin)
const respondToJoinRequest = async (req, res) => {
  try {
    const { decision } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'approved' or 'rejected'" });
    }

    const requesterMembership = await Membership.findOne({
      user: req.user._id,
      community: req.params.id,
      status: 'approved',
    });

    if (!requesterMembership || !['admin', 'moderator'].includes(requesterMembership.role)) {
      return res.status(403).json({ message: 'Only community moderators or admins can respond to requests' });
    }

    const targetMembership = await Membership.findOne({
      _id: req.params.membershipId,
      community: req.params.id,
    });

    if (!targetMembership) {
      return res.status(404).json({ message: 'Membership request not found' });
    }

    targetMembership.status = decision;
    await targetMembership.save();

    if (decision === 'approved') {
      await Community.findByIdAndUpdate(req.params.id, { $inc: { memberCount: 1 } });
    }

    const community = await Community.findById(req.params.id);
    await Notification.create({
      user: targetMembership.user,
      type: decision === 'approved' ? 'membership_approved' : 'membership_rejected',
      message:
        decision === 'approved'
          ? `Your request to join ${community?.name || 'the community'} was approved.`
          : `Your request to join ${community?.name || 'the community'} was declined.`,
      relatedCommunity: req.params.id,
    });

    res.json(targetMembership);
  } catch (error) {
    res.status(500).json({ message: 'Server error responding to join request', error: error.message });
  }
};

// @desc    Get the current user's membership status for a community
// @route   GET /api/communities/:id/membership
// @access  Private
const getMyMembership = async (req, res) => {
  try {
    const membership = await Membership.findOne({ user: req.user._id, community: req.params.id });
    if (!membership) {
      return res.json({ status: 'none' });
    }
    res.json({ status: membership.status, role: membership.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching membership status', error: error.message });
  }
};

// @desc    Update a community's editable details (name, description, rules, images)
// @route   PATCH /api/communities/:id
// @access  Private (community moderator/admin)
const updateCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const requesterMembership = await Membership.findOne({
      user: req.user._id,
      community: community._id,
      status: 'approved',
    });

    if (!requesterMembership || !['admin', 'moderator'].includes(requesterMembership.role)) {
      return res.status(403).json({ message: 'Only community moderators or admins can edit this community' });
    }

    const { name, description, rules, coverImageUrl, avatarUrl } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Community name cannot be empty' });
      }
      community.name = name.trim();
    }
    if (description !== undefined) community.description = description.trim();
    if (rules !== undefined) community.rules = rules.trim();
    if (coverImageUrl !== undefined) community.coverImageUrl = coverImageUrl;
    if (avatarUrl !== undefined) community.avatarUrl = avatarUrl;

    await community.save();
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating community', error: error.message });
  }
};

// @desc    Permanently delete a community and all of its posts, comments,
//          events, chat messages, memberships, notifications, and reports
// @route   DELETE /api/communities/:id
// @access  Private (community admin only)
const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const requesterMembership = await Membership.findOne({
      user: req.user._id,
      community: community._id,
      status: 'approved',
    });

    if (!requesterMembership || requesterMembership.role !== 'admin') {
      return res.status(403).json({ message: 'Only a community admin can delete this community' });
    }

    const { confirmName } = req.body;
    if (confirmName !== community.name) {
      return res.status(400).json({ message: 'Community name confirmation does not match' });
    }

    const posts = await Post.find({ community: community._id }).select('_id');
    const postIds = posts.map((p) => p._id);
    const events = await Event.find({ community: community._id }).select('_id');
    const eventIds = events.map((e) => e._id);

    await Comment.deleteMany({ post: { $in: postIds } });
    await Post.deleteMany({ community: community._id });
    await Event.deleteMany({ community: community._id });
    await Message.deleteMany({ community: community._id });
    await Membership.deleteMany({ community: community._id });
    await Notification.deleteMany({
      $or: [{ relatedCommunity: community._id }, { relatedPost: { $in: postIds } }, { relatedEvent: { $in: eventIds } }],
    });
    await Report.deleteMany({
      $or: [
        { targetType: 'community', targetId: community._id },
        { targetType: 'post', targetId: { $in: postIds } },
      ],
    });

    await Community.deleteOne({ _id: community._id });

    res.json({ message: 'Community deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting community', error: error.message });
  }
};

// @desc    List communities the current user has joined (approved or pending)
// @route   GET /api/communities/mine
// @access  Private
const listMyCommunities = async (req, res) => {
  try {
    const memberships = await Membership.find({ user: req.user._id }).populate('community');

    const results = memberships
      .filter((m) => m.community) // guard against orphaned memberships
      .map((m) => ({
        ...m.community.toObject(),
        myRole: m.role,
        myStatus: m.status,
      }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your communities', error: error.message });
  }
};

module.exports = {
  createCommunity,
  listCommunities,
  listMyCommunities,
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
  listJoinRequests,
  respondToJoinRequest,
    getMyMembership,
  updateCommunity,
  deleteCommunity,
};