const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/communityController');
const { createPost, getCommunityFeed } = require('../controllers/postController');
const { createEvent, listCommunityEvents } = require('../controllers/eventController');
const { sendMessage, listMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/', listCommunities);
router.post('/', protect, createCommunity);
router.get('/mine', protect, listMyCommunities);
router.get('/:slug', getCommunityBySlug);
router.patch('/:id', protect, updateCommunity);
router.delete('/:id', protect, deleteCommunity);
router.post('/:id/join', protect, joinCommunity);
router.delete('/:id/leave', protect, leaveCommunity);
router.get('/:id/membership', protect, getMyMembership);
router.get('/:id/requests', protect, listJoinRequests);
router.patch('/:id/requests/:membershipId', protect, respondToJoinRequest);
router.post('/:communityId/posts', protect, createPost);
router.get('/:communityId/posts', getCommunityFeed);
router.post('/:communityId/events', protect, createEvent);
router.get('/:communityId/events', listCommunityEvents);
router.post('/:communityId/messages', protect, sendMessage);
router.get('/:communityId/messages', protect, listMessages);

module.exports = router;