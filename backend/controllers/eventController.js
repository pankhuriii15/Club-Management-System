const Event = require('../models/Event');
const Club = require('../models/Club');

// Securely resolves clubId for a user (either Coordinator or Club Admin)
const getUserClubId = async (user) => {
  if (!user) return null;
  if (user.clubId) return user.clubId.toString();
  if (user.role === 'coordinator') {
    const club = await Club.findOne({ coordinatorId: user._id });
    return club ? club._id.toString() : null;
  }
  return null;
};

// @desc Get all events
// @route GET /api/events
// @access Public
const getEvents = async (req, res) => {
  try {
    let filter = {};
    if (req.query.clubId) {
      filter.clubId = req.query.clubId;
    }
    if (req.user && (req.user.role === 'coordinator' || (req.user.role === 'admin' && req.user.clubId))) {
      const clubId = await getUserClubId(req.user);
      if (clubId) {
        filter.clubId = clubId;
      } else {
        // Staff member with no assigned club - see nothing
        return res.json({ success: true, data: [] });
      }
    }
    const events = await Event.find(filter).populate('clubId', 'name logo category');
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single event by ID
// @route GET /api/events/:id
// @access Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('clubId', 'name logo category establishedDate registrationFee president vicePresident');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Scoped restriction check
    if (req.user && (req.user.role === 'coordinator' || (req.user.role === 'admin' && req.user.clubId))) {
      const clubId = await getUserClubId(req.user);
      const eventClubId = event.clubId ? (event.clubId._id || event.clubId).toString() : '';

      if (!clubId || eventClubId !== clubId) {
        return res.status(403).json({ success: false, message: 'Access denied: You cannot view events from other clubs' });
      }
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new event
// @route POST /api/events
// @access Private/Staff
const createEvent = async (req, res) => {
  const { clubId, title, description, date, venue, bannerImage, registrationFee, galleryImages } = req.body;

  try {
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Organizer club not found' });
    }

    // Role-based auth: If coordinator or club admin, ensure they manage this club
    if (req.user.role === 'coordinator' || (req.user.role === 'admin' && req.user.clubId)) {
      const clubId = await getUserClubId(req.user);
      if (!clubId || club._id.toString() !== clubId) {
        return res.status(403).json({ success: false, message: 'Access denied: You can only create events for your own club' });
      }
    }

    const event = await Event.create({
      clubId,
      title,
      description,
      date,
      venue,
      bannerImage: bannerImage || '',
      registrationFee: registrationFee !== undefined ? registrationFee : 0,
      galleryImages: galleryImages || []
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update an event
// @route PUT /api/events/:id
// @access Private/Staff
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const club = await Club.findById(event.clubId);

    // Ensure authorization
    if (req.user.role === 'coordinator' || (req.user.role === 'admin' && req.user.clubId)) {
      const clubId = await getUserClubId(req.user);
      if (!clubId || club._id.toString() !== clubId) {
        return res.status(403).json({ success: false, message: 'Access denied: You can only update events for your own club' });
      }
    }

    const { title, description, date, venue, bannerImage, registrationFee, galleryImages } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (venue) event.venue = venue;
    if (bannerImage !== undefined) event.bannerImage = bannerImage;
    if (registrationFee !== undefined) event.registrationFee = registrationFee;
    if (galleryImages !== undefined) event.galleryImages = galleryImages;

    const updatedEvent = await event.save();
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete an event
// @route DELETE /api/events/:id
// @access Private/Staff
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const club = await Club.findById(event.clubId);

    // Ensure authorization
    if (req.user.role === 'coordinator' || (req.user.role === 'admin' && req.user.clubId)) {
      const clubId = await getUserClubId(req.user);
      if (!clubId || club._id.toString() !== clubId) {
        return res.status(403).json({ success: false, message: 'Access denied: You can only delete events for your own club' });
      }
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
