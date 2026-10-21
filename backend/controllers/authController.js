const User = require('../models/User');
const Club = require('../models/Club');
const jwt = require('jsonwebtoken');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eduevent_super_secret_jwt_key_123!', {
    expiresIn: '12h'
  });
};

// @desc Register new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  const { name, email, password, phone, department, semester, enrollment, role, clubId } = req.body;
  console.log(`[DEBUG REGISTER] email="${email}" password="${password}"`);

  try {
    // Enforce @medicaps.ac.in email domain for student registrations
    if (!email.toLowerCase().endsWith('@medicaps.ac.in')) {
      return res.status(400).json({ success: false, message: 'Students must register with a @medicaps.ac.in email address' });
    }

    // Validate password constraints
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
    if (!hasDigit || !hasSpecialChar) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one digit and one special character' });
    }

    // Validate phone number constraints
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return res.status(400).json({ success: false, message: 'Phone number must contain at least 10 digits' });
    }

    // Block registration with super admin email
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || '').toLowerCase();
    if (email.toLowerCase() === superAdminEmail) {
      return res.status(400).json({ success: false, message: 'This email is reserved and cannot be used for registration' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`[DEBUG REGISTER] user already exists: ${email}`);
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    const userRole = 'student';

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      department: department || '',
      semester: semester || '',
      enrollment: enrollment || '',
      role: userRole,
      clubId: null
    });

    if (user) {
      console.log(`[DEBUG REGISTER] user created successfully: ${email}, hashed password in DB: ${user.password}`);

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          enrollment: user.enrollment,
          clubId: user.clubId,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user details provided' });
    }
  } catch (error) {
    console.error('[DEBUG REGISTER] error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[DEBUG LOGIN] email="${email}" password="${password}"`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[DEBUG LOGIN] user not found in DB for email="${email}"`);
      return res.status(404).json({ success: false, message: 'Email is not registered' });
    }

    const matches = await user.comparePassword(password);
    console.log(`[DEBUG LOGIN] user found. hashed_pw="${user.password}" input_pw="${password}" matches=${matches}`);

    if (matches) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          enrollment: user.enrollment,
          profilePhoto: user.profilePhoto,
          clubId: user.clubId,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    console.error('[DEBUG LOGIN] error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Forgot Password - Direct password reset (bypass email link)
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and new password' });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
  if (!hasDigit || !hasSpecialChar) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one digit and one special character' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email address' });
    }

    // Direct password update
    user.password = password;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully! You can now log in.' });
  } catch (error) {
    console.error('Direct reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reset Password
// @route POST /api/auth/reset-password
// @access Public
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eduevent_super_secret_jwt_key_123!');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ success: true, message: 'Password reset successful! You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Reset token has expired. Please request a new link.' });
    }
    res.status(400).json({ success: false, message: 'Invalid or malformed reset token' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword
};
