const Event = require('../models/Event');
const Membership = require('../models/Membership');

const isApprovedMember = async (userId, communityId) => {
  const membership = await Membership.findOne({
    user: userId,
    community: communityId,
    status: 'approved',
  });
  return membership;
};

// @desc    Create an event in a community
// @route   POST /api/communities/:communityId/events
// @access  Private (approved members only)
const createEvent = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { title, description, location, startDate, endDate, coverImageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Event title is required' });
    }
    if (!startDate) {
      return res.status(400).json({ message: 'Event start date is required' });
    }
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Event start date is invalid' });
    }
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime()) || end < start) {
        return res.status(400).json({ message: 'Event end date must be a valid date after the start date' });
      }
    }

    const membership = await isApprovedMember(req.user._id, communityId);
    if (!membership) {
      return res.status(403).json({ message: 'You must be an approved member of this community to create events' });
    }

    const event = await Event.create({
      community: communityId,
      createdBy: req.user._id,
      title,
      description: description || '',
      location: location || '',
      startDate: start,
      endDate: endDate ? new Date(endDate) : undefined,
      coverImageUrl: coverImageUrl || '',
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating event', error: error.message });
  }
};

// @desc    List events for a community (upcoming first, chronological)
// @route   GET /api/communities/:communityId/events
// @access  Public
const listCommunityEvents = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { status } = req.query;

    const query = { community: communityId };
    if (status) query.status = status;

    const events = await Event.find(query).sort({ startDate: 1 }).populate('createdBy', 'name avatarUrl');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching events', error: error.message });
  }
};

// @desc    Get a single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name avatarUrl');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching event', error: error.message });
  }
};

// @desc    RSVP / un-RSVP to an event (toggle attendance)
// @route   POST /api/events/:id/rsvp
// @access  Private (approved members only)
const toggleRsvp = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const membership = await isApprovedMember(req.user._id, event.community);
    if (!membership) {
      return res.status(403).json({ message: 'You must be an approved member of this community to RSVP' });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'This event has been cancelled' });
    }

    const alreadyGoing = event.attendees.some((id) => String(id) === String(req.user._id));

    if (alreadyGoing) {
      event.attendees = event.attendees.filter((id) => String(id) !== String(req.user._id));
    } else {
      event.attendees.push(req.user._id);
    }

    await event.save();

    res.json({ attending: !alreadyGoing, attendeeCount: event.attendees.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating RSVP', error: error.message });
  }
};

// @desc    Update an event (creator or community moderator/admin)
// @route   PATCH /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isCreator = String(event.createdBy) === String(req.user._id);
    if (!isCreator) {
      const membership = await Membership.findOne({
        user: req.user._id,
        community: event.community,
        status: 'approved',
      });
      const canModerate = membership && ['admin', 'moderator'].includes(membership.role);
      if (!canModerate) {
        return res.status(403).json({ message: 'You do not have permission to update this event' });
      }
    }

    const allowedFields = ['title', 'description', 'location', 'startDate', 'endDate', 'coverImageUrl', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating event', error: error.message });
  }
};

// @desc    Delete an event (creator or community moderator/admin)
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isCreator = String(event.createdBy) === String(req.user._id);
    if (!isCreator) {
      const membership = await Membership.findOne({
        user: req.user._id,
        community: event.community,
        status: 'approved',
      });
      const canModerate = membership && ['admin', 'moderator'].includes(membership.role);
      if (!canModerate) {
        return res.status(403).json({ message: 'You do not have permission to delete this event' });
      }
    }

    await Event.deleteOne({ _id: event._id });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting event', error: error.message });
  }
};

// @desc    List upcoming events across every community the current user has joined.
//          Supports ?filter=attending to show only events they've RSVP'd to.
// @route   GET /api/events
// @access  Private
const listMyEvents = async (req, res) => {
  try {
    const { filter } = req.query;

    const memberships = await Membership.find({ user: req.user._id, status: 'approved' });
    const communityIds = memberships.map((m) => m.community);

    if (communityIds.length === 0) {
      return res.json([]);
    }

    const query = { community: { $in: communityIds }, status: 'upcoming' };
    if (filter === 'attending') {
      query.attendees = req.user._id;
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .populate('createdBy', 'name avatarUrl')
      .populate('community', 'name slug');

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your events', error: error.message });
  }
};

module.exports = {
  createEvent,
  listCommunityEvents,
  listMyEvents,
  getEventById,
  toggleRsvp,
  updateEvent,
  deleteEvent,
};