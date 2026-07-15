const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, isStaff, optionalProtect } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalProtect, getEvents)
  .post(protect, isStaff, createEvent);

router.route('/:id')
  .get(optionalProtect, getEventById)
  .put(protect, isStaff, updateEvent)
  .delete(protect, isStaff, deleteEvent);

module.exports = router;
