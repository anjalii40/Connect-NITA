const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadProfileImage, uploadResume } = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  uploadProfileImage: uploadProfileImageController,
  uploadResume: uploadResumeController,
  searchUsers,
  getAlumniDirectory,
  followUser,
  unfollowUser,
  getConnections,
  getFollowers,
  getFollowing,
  blockUser,
  unblockUser,
  reportUser
} = require('../controllers/userController');

// Profile routes
router.get('/profile/:id', optionalAuth, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/image', protect, uploadProfileImage, uploadProfileImageController);
router.post('/profile/resume', protect, uploadResume, uploadResumeController);

// Search and directory
router.get('/search', optionalAuth, searchUsers);
router.get('/alumni-directory', optionalAuth, getAlumniDirectory);

// Social features
router.post('/follow/:id', protect, followUser);
router.delete('/follow/:id', protect, unfollowUser);
router.get('/connections', protect, getConnections);
router.get('/followers/:id', optionalAuth, getFollowers);
router.get('/following/:id', optionalAuth, getFollowing);

// Moderation
router.post('/block/:id', protect, blockUser);
router.delete('/block/:id', protect, unblockUser);
router.post('/report/:id', protect, reportUser);

module.exports = router; 