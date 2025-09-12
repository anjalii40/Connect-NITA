const Message = require('../models/Message');
const User = require('../models/User');

// Get conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Message.find({
      participants: { $in: [req.user.id] }
    })
      .populate('participants', 'name email profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversation
const getConversation = async (req, res) => {
  try {
    const conversation = await Message.findById(req.params.id)
      .populate('participants', 'name email profileImage')
      .populate('messages.sender', 'name email profileImage');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create conversation
const createConversation = async (req, res) => {
  try {
    const { participantIds, name, isGroup } = req.body;
    
    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    // Add current user to participants
    const allParticipants = [...new Set([req.user.id, ...participantIds])];

    // Check if conversation already exists (for 1-on-1 chats)
    if (!isGroup && allParticipants.length === 2) {
      const existingConversation = await Message.findOne({
        participants: { $all: allParticipants },
        isGroup: false
      });

      if (existingConversation) {
        return res.json(existingConversation);
      }
    }

    const conversation = new Message({
      participants: allParticipants,
      name: isGroup ? name : null,
      isGroup: isGroup || false,
      messages: []
    });

    await conversation.save();
    await conversation.populate('participants', 'name email profileImage');

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const conversation = await Message.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = {
      sender: req.user.id,
      content,
      messageType,
      timestamp: new Date()
    };

    conversation.messages.push(message);
    conversation.lastMessage = message;
    conversation.updatedAt = new Date();

    await conversation.save();
    await conversation.populate('messages.sender', 'name email profileImage');

    res.json(conversation);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const conversation = await Message.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = conversation.messages.id(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.remove();
    await conversation.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark as read
const markAsRead = async (req, res) => {
  try {
    const conversation = await Message.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark all messages as read for this user
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user.id && !msg.readBy.includes(req.user.id)) {
        msg.readBy.push(req.user.id);
      }
    });

    await conversation.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create group chat
const createGroupChat = async (req, res) => {
  try {
    const { participantIds, name } = req.body;
    
    if (!name || !participantIds || participantIds.length < 2) {
      return res.status(400).json({ message: 'Group name and at least 2 participants are required' });
    }

    const allParticipants = [...new Set([req.user.id, ...participantIds])];

    const conversation = new Message({
      participants: allParticipants,
      name,
      isGroup: true,
      admin: req.user.id,
      messages: []
    });

    await conversation.save();
    await conversation.populate('participants', 'name email profileImage');

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update group chat
const updateGroupChat = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const conversation = await Message.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    if (conversation.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admin can update group' });
    }

    if (name) conversation.name = name;
    if (description) conversation.description = description;

    await conversation.save();
    res.json(conversation);
  } catch (error) {
    console.error('Error updating group chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Leave group chat
const leaveGroupChat = async (req, res) => {
  try {
    const conversation = await Message.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    conversation.participants = conversation.participants.filter(
      id => id.toString() !== req.user.id
    );

    // If admin leaves, assign admin to first remaining participant
    if (conversation.admin.toString() === req.user.id && conversation.participants.length > 0) {
      conversation.admin = conversation.participants[0];
    }

    await conversation.save();
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add group member
const addGroupMember = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const conversation = await Message.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    if (conversation.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    if (conversation.participants.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    conversation.participants.push(userId);
    await conversation.save();

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Error adding group member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove group member
const removeGroupMember = async (req, res) => {
  try {
    const conversation = await Message.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    if (conversation.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    if (!conversation.participants.includes(req.params.memberId)) {
      return res.status(400).json({ message: 'User is not a member' });
    }

    conversation.participants = conversation.participants.filter(
      id => id.toString() !== req.params.memberId
    );

    await conversation.save();
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing group member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
}; 