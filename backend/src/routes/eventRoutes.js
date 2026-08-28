const express = require('express');
const router = express.Router();
const { getEventById, listMyEvents, toggleRsvp, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.get('/', protect, listMyEvents);
router.get('/:id', getEventById);
router.patch('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/rsvp', protect, toggleRsvp);

module.exports = router;