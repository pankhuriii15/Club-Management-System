const Club = require('../models/Club');
const User = require('../models/User');

const validatePasswordStrength = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[@#$%%*&!^()_+=\-\[\]{}|;:',.<>?/`~]/.test(password)) return false;
  return true;
};

// @desc Get all clubs
// @route GET /api/clubs
// @access Public
const getClubs = async (req, res) => {
  const { category } = req.query;
  try {
    const filter = category ? { category } : {};
    const clubs = await Club.find(filter).populate('coordinatorId', 'name email phone department');
    res.json({ success: true, data: clubs });
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single club details
// @route GET /api/clubs/:id
// @access Public
const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('coordinatorId', 'name email phone department');
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    res.json({ success: true, data: club });
  } catch (error) {
    console.error('Get club details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a club
// @route POST /api/clubs
// @access Private/Admin
const createClub = async (req, res) => {
  const { name, description, category, logo, mission, vision, establishedDate, registrationFee, presidentName, presidentEmail, presidentPassword } = req.body;

  try {
    if (!presidentName || !presidentEmail || !presidentPassword) {
      return res.status(400).json({ success: false, message: 'President details (Name, Email, Password) are required' });
    }

    // Validate password strength
    if (!validatePasswordStrength(presidentPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, #, $, %, &, !).'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: presidentEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'President email is already in use by another user' });
    }

    // Step 1: Create the club with coordinatorId as null
    const club = await Club.create({
      name,
      description,
      category,
      logo: logo || '',
      mission: mission || '',
      vision: vision || '',
      establishedDate: establishedDate || Date.now(),
      registrationFee: registrationFee !== undefined ? registrationFee : 0,
      coordinatorId: null,
      president: { name: presidentName, email: presidentEmail, contact: '', photo: '' },
      vicePresident: { name: '', email: '', contact: '', photo: '' },
      pastEvents: [],
      gallery: []
    });

    // Step 2: Create President (User) account associated with the club
    const presidentUser = await User.create({
      name: presidentName,
      email: presidentEmail,
      password: presidentPassword,
      role: 'coordinator',
      clubId: club._id
    });

    // Step 3: Link President ID to club
    club.coordinatorId = presidentUser._id;
    await club.save();

    res.status(201).json({ success: true, data: club });
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update a club
// @route PUT /api/clubs/:id
// @access Private (Admin or assigned Coordinator)
const updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Access check: only global admin, or coordinator/club admin assigned to this club
    const isGlobalAdmin = req.user.role === 'admin' && !req.user.clubId;
    const isMyClub = club._id.toString() === req.user.clubId?.toString();
    const isMyCoordinator = club.coordinatorId ? (club.coordinatorId.toString() === req.user._id.toString()) : false;

    if (!isGlobalAdmin && !isMyClub && !isMyCoordinator) {
      return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to update this club' });
    }

    const {
      name, description, category, logo, mission, vision,
      establishedDate, registrationFee, gallery, pastEvents,
      presidentName, presidentEmail, presidentPassword,
      president, vicePresident
    } = req.body;

    if (name) club.name = name;
    if (description) club.description = description;
    if (category) club.category = category;
    if (logo !== undefined) club.logo = logo;
    if (mission !== undefined) club.mission = mission;
    if (vision !== undefined) club.vision = vision;
    if (establishedDate) club.establishedDate = establishedDate;
    if (registrationFee !== undefined) club.registrationFee = registrationFee;
    if (gallery !== undefined) club.gallery = gallery;
    if (pastEvents !== undefined) club.pastEvents = pastEvents;

    // Validate password strength if provided
    if (presidentPassword && !validatePasswordStrength(presidentPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, #, $, %, &, !).'
      });
    }

    // Update President User account details if requested by Super Admin
    if (req.user.role === 'admin' && (presidentName || presidentEmail || presidentPassword)) {
      if (club.coordinatorId) {
        const presidentUser = await User.findById(club.coordinatorId);
        if (presidentUser) {
          if (presidentName) {
            presidentUser.name = presidentName;
            club.president.name = presidentName;
          }
          if (presidentEmail && presidentEmail !== presidentUser.email) {
            const existingUser = await User.findOne({ email: presidentEmail });
            if (existingUser) {
              return res.status(400).json({ success: false, message: 'President email is already in use' });
            }
            presidentUser.email = presidentEmail;
            club.president.email = presidentEmail;
          }
          if (presidentPassword) {
            presidentUser.password = presidentPassword;
          }
          await presidentUser.save();
        }
      } else {
        // Fallback: create coordinator account if not present
        const existingUser = await User.findOne({ email: presidentEmail });
        if (existingUser) {
          return res.status(400).json({ success: false, message: 'President email is already in use' });
        }
        const presidentUser = await User.create({
          name: presidentName || 'Nikhil Sen',
          email: presidentEmail,
          password: presidentPassword || 'default_password123!',
          role: 'coordinator',
          clubId: club._id
        });
        club.coordinatorId = presidentUser._id;
        club.president = { name: presidentUser.name, email: presidentUser.email, contact: '', photo: '' };
      }
    }

    if (president) {
      club.president = {
        name: president.name !== undefined ? president.name : club.president.name,
        email: president.email !== undefined ? president.email : club.president.email,
        contact: president.contact !== undefined ? president.contact : club.president.contact,
        photo: president.photo !== undefined ? president.photo : club.president.photo
      };
    }

    if (vicePresident) {
      club.vicePresident = {
        name: vicePresident.name !== undefined ? vicePresident.name : club.vicePresident.name,
        email: vicePresident.email !== undefined ? vicePresident.email : club.vicePresident.email,
        contact: vicePresident.contact !== undefined ? vicePresident.contact : club.vicePresident.contact,
        photo: vicePresident.photo !== undefined ? vicePresident.photo : club.vicePresident.photo
      };
    }

    const updatedClub = await club.save();
    res.json({ success: true, data: updatedClub });
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete a club
// @route DELETE /api/clubs/:id
// @access Private/Admin
const deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    await club.deleteOne();
    res.json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get club members
// @route GET /api/clubs/:id/members
// @access Private/Staff
const getMembers = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('members', 'name email enrollment phone department semester profilePhoto');
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    res.json({ success: true, data: club.members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add a member to club
// @route POST /api/clubs/:id/members
// @access Private/Staff
const addMember = async (req, res) => {
  const { userId, email } = req.body;

  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Check authorization
    const isGlobalAdmin = req.user.role === 'admin' && !req.user.clubId;
    const isMyCoordinator = club.coordinatorId ? (club.coordinatorId.toString() === req.user._id.toString()) : false;
    const isMyClub = club._id.toString() === req.user.clubId?.toString();

    if (!isGlobalAdmin && !isMyCoordinator && !isMyClub) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Ensure they have registered an account first.' });
    }

    // Check if already a member
    if (club.members.includes(user._id)) {
      return res.status(400).json({ success: false, message: 'User is already a member of this club' });
    }

    club.members.push(user._id);
    await club.save();

    res.json({ success: true, message: `${user.name} added to club successfully` });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Remove a member from club
// @route DELETE /api/clubs/:id/members/:userId
// @access Private/Staff
const removeMember = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Check authorization
    const isGlobalAdmin = req.user.role === 'admin' && !req.user.clubId;
    const isMyCoordinator = club.coordinatorId ? (club.coordinatorId.toString() === req.user._id.toString()) : false;
    const isMyClub = club._id.toString() === req.user.clubId?.toString();

    if (!isGlobalAdmin && !isMyCoordinator && !isMyClub) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const memberIndex = club.members.indexOf(req.params.userId);
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: 'User is not a member of this club' });
    }

    club.members.splice(memberIndex, 1);
    await club.save();

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all distinct club categories
// @route GET /api/clubs/categories
// @access Public
const getClubCategories = async (req, res) => {
  try {
    const categories = await Club.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get club categories error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  getMembers,
  addMember,
  removeMember,
  getClubCategories
};
