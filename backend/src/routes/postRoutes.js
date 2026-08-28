const express = require('express');
const router = express.Router();
const { getPostById, listMyAnnouncements, toggleLike, deletePost } = require('../controllers/postController');
const { addComment, listComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/announcements', protect, listMyAnnouncements);
router.get('/:id', getPostById);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);

router.get('/:postId/comments', listComments);
router.post('/:postId/comments', protect, addComment);

module.exports = router;