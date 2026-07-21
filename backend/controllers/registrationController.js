const Registration = require('../models/Registration');
const Club = require('../models/Club');
const Event = require('../models/Event');
const User = require('../models/User');
const {
  sendRegistrationConfirmationEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendShortlistEmail,
  sendInterviewDetailsEmail
} = require('../utils/emailService');

// @desc Register for a Club (Application-based)
// @route POST /api/registerClub
// @access Private/Student
const registerClub = async (req, res) => {
  const { clubId, remarks, applicationDetails } = req.body;

  if (!clubId) {
    return res.status(400).json({ success: false, message: 'Club ID is required' });
  }

  try {
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Check if student already registered/pending
    const existing = await Registration.findOne({
      userId: req.user._id,
      clubId: clubId
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a registration request for this club' });
    }

    // Create registration with application details — run create + user lookup in parallel
    const [registration, student] = await Promise.all([
      Registration.create({
        userId: req.user._id,
        clubId,
        status: 'Pending',
        remarks: remarks || '',
        applicationDetails: applicationDetails || { reason: '', skills: '' }
      }),
      User.findById(req.user._id)
    ]);

    // Send response immediately
    res.status(201).json({
      success: true,
      message: 'Registration request created successfully',
      data: registration
    });

    // Fire email completely in background (after response is sent)
    if (student) {
      sendRegistrationConfirmationEmail(student, club.name, true)
        .catch(err => console.error('Club registration email error:', err));
    }

  } catch (error) {
    console.error('Register club error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Register for an Event
// @route POST /api/registerEvent
// @access Private/Student
const registerEvent = async (req, res) => {
  const { eventId, remarks } = req.body;

  if (!eventId) {
    return res.status(400).json({ success: false, message: 'Event ID is required' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if student already registered/pending
    const existing = await Registration.findOne({
      userId: req.user._id,
      eventId: eventId
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a registration request for this event' });
    }

    // Free registration (payments disabled) — run create + user lookup in parallel
    const [registration, student] = await Promise.all([
      Registration.create({
        userId: req.user._id,
        eventId,
        status: 'Registered',
        remarks: remarks || ''
      }),
      User.findById(req.user._id)
    ]);

    // Send response immediately
    res.status(201).json({
      success: true,
      message: 'Registration request created successfully',
      data: registration
    });

    // Fire email completely in background (after response is sent)
    if (student) {
      sendRegistrationConfirmationEmail(student, event.title, false)
        .catch(err => console.error('Event registration email error:', err));
    }

  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get registrations list (Role-based filters)
// @route GET /api/registrations
// @access Private
const getRegistrations = async (req, res) => {
  const { type } = req.query;
  try {
    let filter = {};

    if (req.user.role === 'student') {
      filter.userId = req.user._id;
      if (type === 'club') {
        filter.clubId = { $ne: null };
      } else if (type === 'event') {
        filter.eventId = { $ne: null };
      }
    } else if (req.user.role === 'coordinator' || (req.user.role === 'admin' && req.user.clubId)) {
      let targetClubId = req.user.clubId;
      if (!targetClubId && req.user.role === 'coordinator') {
        const club = await Club.findOne({ coordinatorId: req.user._id });
        targetClubId = club ? club._id : null;
      }

      if (!targetClubId) {
        return res.json({ success: true, data: [] });
      }

      if (type === 'club') {
        filter = { clubId: targetClubId };
      } else if (type === 'event') {
        const events = await Event.find({ clubId: targetClubId });
        const eventIds = events.map(e => e._id);
        filter = { eventId: { $in: eventIds } };
      } else {
        const events = await Event.find({ clubId: targetClubId });
        const eventIds = events.map(e => e._id);
        filter = {
          $or: [
            { clubId: targetClubId },
            { eventId: { $in: eventIds } }
          ]
        };
      }
    } else {
      // Global Admins bypass filter checks to view all registrations
      if (type === 'club') {
        filter = { clubId: { $ne: null } };
      } else if (type === 'event') {
        filter = { eventId: { $ne: null } };
      }
    }

    const registrations = await Registration.find(filter)
      .populate('userId', 'name email enrollment phone department semester')
      .populate('clubId', 'name category registrationFee')
      .populate('eventId', 'title registrationFee date venue')
      .sort({ registrationDate: -1 });

    res.json({ success: true, data: registrations });
  } catch (error) {
    console.error('Get registrations list error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update registration approval status & notify student
// @route PUT /api/registrations/:id/status
// @access Private/Staff
const updateRegistrationStatus = async (req, res) => {
  const { status, remarks, interviewDetails } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration record not found' });
    }

    if (req.user.role === 'coordinator' || (req.user.role === 'admin' && req.user.clubId)) {
      let authorized = false;
      let targetClubId = req.user.clubId ? req.user.clubId.toString() : '';
      if (!targetClubId && req.user.role === 'coordinator') {
        const club = await Club.findOne({ coordinatorId: req.user._id });
        targetClubId = club ? club._id.toString() : '';
      }

      if (registration.clubId) {
        const club = await Club.findById(registration.clubId);
        if (club) {
          const isMyClub = club._id.toString() === targetClubId;
          const isMyCoordinator = club.coordinatorId ? (club.coordinatorId.toString() === req.user._id.toString()) : false;
          if (isMyClub || isMyCoordinator) {
            authorized = true;
          }
        }
      } else if (registration.eventId) {
        const event = await Event.findById(registration.eventId);
        if (event) {
          const club = await Club.findById(event.clubId);
          if (club) {
            const isMyClub = club._id.toString() === targetClubId;
            const isMyCoordinator = club.coordinatorId ? (club.coordinatorId.toString() === req.user._id.toString()) : false;
            if (isMyClub || isMyCoordinator) {
              authorized = true;
            }
          }
        }
      }

      if (!authorized) {
        return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to review this registration' });
      }
    }

    // Update state fields
    registration.status = status;
    registration.remarks = remarks || '';

    // Save interview details if provided (on approval)
    if (interviewDetails && (status === 'Approved' || status === 'Selected')) {
      registration.interviewDetails = {
        venue: interviewDetails.venue || '',
        date: interviewDetails.date || '',
        time: interviewDetails.time || '',
        location: interviewDetails.location || '',
        notes: interviewDetails.notes || ''
      };
    }

    const updated = await registration.save();

    // If club registration is approved, add the user to the club's members array
    if ((status === 'Approved' || status === 'Selected') && registration.clubId) {
      const club = await Club.findById(registration.clubId);
      if (club && !club.members.includes(registration.userId)) {
        club.members.push(registration.userId);
        await club.save();
      }
    }

    // Fetch student info and target name to compose email
    const student = await User.findById(registration.userId);
    let itemName = 'Club/Event';
    let isClub = true;

    if (registration.clubId) {
      const club = await Club.findById(registration.clubId);
      if (club) itemName = club.name;
    } else if (registration.eventId) {
      const event = await Event.findById(registration.eventId);
      if (event) {
        itemName = event.title;
        isClub = false;
      }
    }

    // Send transactional status emails based on new status
    if (status === 'Approved' || status === 'Selected') {
      // If club approval with interview details, send interview email
      if (isClub && interviewDetails && (interviewDetails.venue || interviewDetails.date)) {
        sendInterviewDetailsEmail(student, itemName, interviewDetails)
          .catch(err => console.error('Interview email error:', err));
      } else {
        sendApprovalEmail(student, itemName, isClub)
          .catch(err => console.error('Approval email error:', err));
      }
    } else if (status === 'Rejected') {
      sendRejectionEmail(student, itemName, isClub, remarks)
        .catch(err => console.error('Rejection email error:', err));
    } else if (status === 'Shortlisted') {
      sendShortlistEmail(student, itemName, isClub, remarks)
        .catch(err => console.error('Shortlist email error:', err));
    }

    res.json({
      success: true,
      message: `Registration status updated to ${status} and notification sent.`,
      data: updated
    });

  } catch (error) {
    console.error('Update registration status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerClub,
  registerEvent,
  getRegistrations,
  updateRegistrationStatus
};
