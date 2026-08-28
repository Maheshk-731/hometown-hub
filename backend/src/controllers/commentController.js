const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Membership = require('../models/Membership');

// @desc    Add a comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private (approved members only)
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      community: post.community,
      status: 'approved',
    });
    if (!membership) {
      return res.status(403).json({ message: 'You must be an approved member of this community to comment' });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content,
    });

    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding comment', error: error.message });
  }
};

// @desc    List comments for a post (oldest first)
// @route   GET /api/posts/:postId/comments
// @access  Public
const listComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, status: 'visible' })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatarUrl');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching comments', error: error.message });
  }
};

// @desc    Delete a comment (author or community moderator/admin)
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAuthor = String(comment.author) === String(req.user._id);

    if (!isAuthor) {
      const post = await Post.findById(comment.post);
      const membership = post
        ? await Membership.findOne({ user: req.user._id, community: post.community, status: 'approved' })
        : null;
      const canModerate = membership && ['admin', 'moderator'].includes(membership.role);
      if (!canModerate) {
        return res.status(403).json({ message: 'You do not have permission to delete this comment' });
      }
    }

    await Comment.deleteOne({ _id: comment._id });

    const post = await Post.findById(comment.post);
    if (post && post.commentCount > 0) {
      post.commentCount -= 1;
      await post.save();
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting comment', error: error.message });
  }
};

module.exports = { addComment, listComments, deleteComment };
