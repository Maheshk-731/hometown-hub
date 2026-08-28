const Message = require('../models/Message');
const Membership = require('../models/Membership');

const requireApprovedMember = async (userId, communityId) => {
  return Membership.findOne({ user: userId, community: communityId, status: 'approved' });
};

// @desc    Send a chat message to a community
// @route   POST /api/communities/:communityId/messages
// @access  Private (approved members only)
const sendMessage = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const membership = await requireApprovedMember(req.user._id, communityId);
    if (!membership) {
      return res.status(403).json({ message: 'You must be an approved member of this community to chat' });
    }

    const message = await Message.create({
      community: communityId,
      sender: req.user._id,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatarUrl');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error sending message', error: error.message });
  }
};

// @desc    List chat messages for a community. Supports ?since=<ISO timestamp>
//          to fetch only new messages (for polling); otherwise returns the
//          most recent 50, oldest first.
// @route   GET /api/communities/:communityId/messages
// @access  Private (approved members only)
const listMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { since } = req.query;

    const membership = await requireApprovedMember(req.user._id, communityId);
    if (!membership) {
      return res.status(403).json({ message: 'You must be an approved member of this community to view chat' });
    }

    const query = { community: communityId, status: 'visible' };

    if (since) {
      const sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        return res.status(400).json({ message: 'Invalid since timestamp' });
      }
      query.createdAt = { $gt: sinceDate };
      const messages = await Message.find(query).sort({ createdAt: 1 }).populate('sender', 'name avatarUrl');
      return res.json(messages);
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name avatarUrl');
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages', error: error.message });
  }
};

module.exports = { sendMessage, listMessages };