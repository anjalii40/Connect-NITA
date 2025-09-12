const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  deleteMessage,
  markAsRead,
  createGroupChat,
  updateGroupChat,
  leaveGroupChat,
  addGroupMember,
  removeGroupMember
} = require('../controllers/messageController');

// Conversation management
router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getConversation);
router.post('/conversations', protect, createConversation);

// Messaging
router.post('/conversations/:id/messages', protect, sendMessage);
router.delete('/conversations/:id/messages/:messageId', protect, deleteMessage);
router.put('/conversations/:id/read', protect, markAsRead);

// Group chat management
router.post('/conversations/group', protect, createGroupChat);
router.put('/conversations/:id/group', protect, updateGroupChat);
router.delete('/conversations/:id/leave', protect, leaveGroupChat);
router.post('/conversations/:id/members', protect, addGroupMember);
router.delete('/conversations/:id/members/:memberId', protect, removeGroupMember);

module.exports = router; 