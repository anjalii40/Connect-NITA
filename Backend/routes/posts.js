const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  commentOnPost,
  deleteComment,
  sharePost,
  pinPost,
  unpinPost,
  reportPost,
  getPostsByHashtag
} = require('../controllers/postController');

// Post CRUD
router.post('/', protect, createPost);
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Engagement
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);
router.post('/:id/comment', protect, commentOnPost);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.post('/:id/share', protect, sharePost);

// Post management
router.post('/:id/pin', protect, pinPost);
router.delete('/:id/pin', protect, unpinPost);

// Moderation
router.post('/:id/report', protect, reportPost);

// Discovery
router.get('/hashtag/:hashtag', optionalAuth, getPostsByHashtag);

module.exports = router; 