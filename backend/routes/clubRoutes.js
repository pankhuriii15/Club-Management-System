const express = require('express');
const router = express.Router();
const { getClubs, getClubById, createClub, updateClub, deleteClub, getMembers, addMember, removeMember, getClubCategories } = require('../controllers/clubController');
const { protect, isAdmin, isStaff } = require('../middleware/authMiddleware');

router.route('/')
  .get(getClubs)
  .post(protect, isAdmin, createClub);

router.get('/categories', getClubCategories);

router.route('/:id')
  .get(getClubById)
  .put(protect, isStaff, updateClub)
  .delete(protect, isAdmin, deleteClub);

// Member management routes
router.get('/:id/members', protect, getMembers);
router.post('/:id/members', protect, isStaff, addMember);
router.delete('/:id/members/:userId', protect, isStaff, removeMember);

module.exports = router;
