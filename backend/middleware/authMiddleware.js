const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eduevent_super_secret_jwt_key_123!');
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin' && !req.user.clubId) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Super Admin role required' });
  }
};

const isCoordinator = (req, res, next) => {
  if (req.user && req.user.role === 'coordinator') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Club Coordinator role required' });
  }
};

const isStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'coordinator' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Staff role required' });
  }
};

const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Only students can register for clubs or events' });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eduevent_super_secret_jwt_key_123!');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.error('Optional auth token validation failed:', error);
    }
  }
  next();
};

module.exports = { protect, isAdmin, isCoordinator, isStaff, isStudent, optionalProtect };
