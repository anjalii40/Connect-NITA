const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'link'],
    default: 'text'
  },
  attachments: [{
    public_id: String,
    url: String,
    fileName: String,
    fileSize: Number
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  conversationType: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  groupInfo: {
    name: {
      type: String,
      maxlength: [100, 'Group name cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Group description cannot exceed 500 characters']
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    domain: {
      type: String,
      enum: ['technology', 'banking', 'consulting', 'startups', 'government', 'design', 'research', 'general']
    }
  },
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });

module.exports = mongoose.model('Conversation', conversationSchema); 