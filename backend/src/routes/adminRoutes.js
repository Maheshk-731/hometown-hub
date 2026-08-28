const express = require('express');
const router = express.Router();
const {
  listPendingCommunities,
  reviewCommunity,
  listUsers,
  updateUser,
  listReports,
  resolveReport,
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect, requireRole('admin'));

router.get('/communities/pending', listPendingCommunities);
router.patch('/communities/:id', reviewCommunity);
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.get('/reports', listReports);
router.patch('/reports/:id', resolveReport);

module.exports = router;
