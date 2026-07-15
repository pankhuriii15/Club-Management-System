const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// @desc Get analytics overview metrics
// @route GET /api/admin/analytics
// @access Private/Admin
router.get('/analytics', protect, isAdmin, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCoordinators = await User.countDocuments({ role: 'coordinator' });
    const totalClubs = await Club.countDocuments({});
    const totalEvents = await Event.countDocuments({});
    const totalRegistrations = await Registration.countDocuments({});

    // Club metrics detailed analytics
    const clubs = await Club.find({});
    const clubRevenue = [];

    for (const club of clubs) {
      // Approved members count
      const membersCount = await Registration.countDocuments({ clubId: club._id, status: 'Approved' });

      clubRevenue.push({
        clubId: club._id,
        name: club.name,
        category: club.category,
        membersCount
      });
    }

    // Department-wise distribution
    const departmentsDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCoordinators,
          totalClubs,
          totalEvents,
          totalRegistrations
        },
        clubRevenue,
        departmentsDistribution
      }
    });

  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc Get all users list
// @route GET /api/admin/users
// @access Private/Admin
// Helper function to assign staff to clubs cleanly with replacement logic
const assignStaffToClub = async (user, targetRole, targetClubId) => {
  // Clear any existing assignments first if user's role or club is changing
  const oldClubId = user.clubId;
  if (oldClubId) {
    const oldClub = await Club.findById(oldClubId);
    if (oldClub) {
      if (oldClub.coordinatorId && oldClub.coordinatorId.toString() === user._id.toString()) {
        oldClub.coordinatorId = null;
        await oldClub.save();
      }
      if (oldClub.clubAdminId && oldClub.clubAdminId.toString() === user._id.toString()) {
        oldClub.clubAdminId = null;
        await oldClub.save();
      }
    }
  }

  if (targetRole === 'student') {
    user.role = 'student';
    user.clubId = null;
    await user.save();
    return;
  }

  // Enforce required clubId for staff
  if (!targetClubId) {
    throw new Error('Club assignment is required for Club Admins and Club Presidents.');
  }

  const club = await Club.findById(targetClubId);
  if (!club) {
    throw new Error('Assigned Club not found.');
  }

  if (targetRole === 'coordinator') {
    // Replacement: Find previous coordinator of this club
    const prevCoord = await User.findOne({ role: 'coordinator', clubId: targetClubId });
    if (prevCoord && prevCoord._id.toString() !== user._id.toString()) {
      prevCoord.role = 'student';
      prevCoord.clubId = null;
      await prevCoord.save();
    }

    user.role = 'coordinator';
    user.clubId = targetClubId;
    await user.save();

    club.coordinatorId = user._id;
    await club.save();
  } else if (targetRole === 'admin') {
    // Replacement: Find previous admin of this club
    const prevAdmin = await User.findOne({ role: 'admin', clubId: targetClubId });
    if (prevAdmin && prevAdmin._id.toString() !== user._id.toString()) {
      prevAdmin.role = 'student';
      prevAdmin.clubId = null;
      await prevAdmin.save();
    }

    user.role = 'admin';
    user.clubId = targetClubId;
    await user.save();

    club.clubAdminId = user._id;
    await club.save();
  }
};

// @desc Get all users list
// @route GET /api/admin/users
// @access Private/Admin
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).populate('clubId', 'name').select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get admin users list error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc Create new coordinator or admin account
// @route POST /api/admin/users
// @access Private/Admin
router.post('/users', protect, isAdmin, async (req, res) => {
  const { name, email, password, role, clubId } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role.' });
  }

  if (!['coordinator', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Only Club Admin and Club President accounts can be created by admin.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address.' });
    }

    // Create user temporarily as student to pass initial save validation
    const user = new User({
      name,
      email,
      password,
      role: 'student',
      clubId: null
    });

    await user.save();

    try {
      await assignStaffToClub(user, role, clubId);
    } catch (err) {
      // rollback user creation if assignment fails
      await User.findByIdAndDelete(user._id);
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(201).json({
      success: true,
      message: `${role === 'coordinator' ? 'Club President' : 'Club Admin'} account created successfully.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubId: user.clubId
      }
    });
  } catch (error) {
    console.error('Create staff user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc Update user role & club association
// @route PUT /api/admin/users/:id/role
// @access Private/Admin
router.put('/users/:id/role', protect, isAdmin, async (req, res) => {
  const { role, clubId } = req.body;

  if (!role || !['student', 'coordinator', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role provided' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    await assignStaffToClub(user, role, clubId);

    res.json({
      success: true,
      message: `User ${user.name} promoted/updated successfully.`
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
