const Post = require('../models/Post');
const Membership = require('../models/Membership');
const Community = require('../models/Community');

const isApprovedMember = async (userId, communityId) => {
  const membership = await Membership.findOne({
    user: userId,
    community: communityId,
    status: 'approved',
  });
  return membership;
};

// @desc    Create a post in a community
// @route   POST /api/communities/:communityId/posts
// @access  Private (approved members only)
const createPost = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { content, imageUrl, tags, type } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    const membership = await isApprovedMember(req.user._id, communityId);
    if (!membership) {
      return res.status(403).json({ message: 'You must be an approved member of this community to post' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Only community moderators/admins may mark a post as a news/announcement.
    // Anyone else's request to do so is silently downgraded to a regular post.
    const canPostAnnouncement = ['admin', 'moderator'].includes(membership.role);
    const resolvedType = type === 'announcement' && canPostAnnouncement ? 'announcement' : 'post';

    const post = await Post.create({
      community: communityId,
      author: req.user._id,
      content,
      imageUrl: imageUrl || '',
      tags: tags || [],
      type: resolvedType,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating post', error: error.message });
  }
};

// @desc    Get feed of posts for a community (paginated, newest first, pinned first)
// @route   GET /api/communities/:communityId/posts
// @access  Public
const getCommunityFeed = async (req, res) => {
  try {
    const { communityId } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const posts = await Post.find({ community: communityId, status: 'visible' })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name avatarUrl');

    res.json({ page, limit, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching feed', error: error.message });
  }
};

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name avatarUrl');
    if (!post || post.status !== 'visible') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching post', error: error.message });
  }
};

// @desc    Like or unlike a post (toggle)
// @route   POST /api/posts/:id/like
// @access  Private (approved members only)
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const membership = await isApprovedMember(req.user._id, post.community);
    if (!membership) {
      return res.status(403).json({ message: 'You must be an approved member of this community' });
    }

    const alreadyLiked = post.likes.some((id) => String(id) === String(req.user._id));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => String(id) !== String(req.user._id));
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({ liked: !alreadyLiked, likeCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling like', error: error.message });
  }
};

// @desc    Delete a post (author or community moderator/admin only)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isAuthor = String(post.author) === String(req.user._id);

    if (!isAuthor) {
      const membership = await Membership.findOne({
        user: req.user._id,
        community: post.community,
        status: 'approved',
      });
      const canModerate = membership && ['admin', 'moderator'].includes(membership.role);
      if (!canModerate) {
        return res.status(403).json({ message: 'You do not have permission to delete this post' });
      }
    }

    await Post.deleteOne({ _id: post._id });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting post', error: error.message });
  }
};

// @desc    List announcement/news posts across every community the current user has joined
// @route   GET /api/posts/announcements
// @access  Private
const listMyAnnouncements = async (req, res) => {
  try {
    const memberships = await Membership.find({ user: req.user._id, status: 'approved' });
    const communityIds = memberships.map((m) => m.community);

    if (communityIds.length === 0) {
      return res.json([]);
    }

    const announcements = await Post.find({
      community: { $in: communityIds },
      type: 'announcement',
      status: 'visible',
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('author', 'name avatarUrl')
      .populate('community', 'name slug');

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching announcements', error: error.message });
  }
};

module.exports = { createPost, getCommunityFeed, listMyAnnouncements, getPostById, toggleLike, deletePost };