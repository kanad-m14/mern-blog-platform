const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', getUserProfile);
router.put('/:id', protect, updateUserProfile);

module.exports = router;