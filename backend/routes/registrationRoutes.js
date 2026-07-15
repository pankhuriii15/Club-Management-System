const express = require('express');
const router = express.Router();
const {
  registerClub,
  registerEvent,
  getRegistrations,
  updateRegistrationStatus
} = require('../controllers/registrationController');
const { protect, isStaff, isStudent } = require('../middleware/authMiddleware');

router.post('/registerClub', protect, isStudent, registerClub);
router.post('/registerEvent', protect, isStudent, registerEvent);
router.get('/registrations', protect, getRegistrations);
router.put('/registrations/:id/status', protect, isStaff, updateRegistrationStatus);

module.exports = router;
