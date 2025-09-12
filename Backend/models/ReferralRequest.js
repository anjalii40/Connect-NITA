const mongoose = require('mongoose');

const referralRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  jobLink: {
    type: String,
    required: [true, 'Job link is required']
  },
  
  // Student's submission
  resume: {
    public_id: String,
    url: {
      type: String,
      required: [true, 'Resume is required']
    }
  },
  achievements: [{
    type: String,
    required: true,
    maxlength: [200, 'Achievement cannot exceed 200 characters']
  }],
  
  // Coding profiles (required for tech roles)
  codingProfiles: {
    leetcode: {
      type: String,
      required: function() {
        return this.domain === 'technology' || this.domain === 'software';
      }
    },
    codeforces: String,
    codechef: String
  },
  
  // Optional portfolio
  portfolio: {
    public_id: String,
    url: String
  },
  personalBlog: String,
  
  // Request details
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending'
  },
  domain: {
    type: String,
    enum: ['technology', 'banking', 'consulting', 'startups', 'government', 'design', 'research', 'other'],
    required: true
  },
  
  // Alumni response
  alumniResponse: {
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    message: {
      type: String,
      maxlength: [500, 'Response message cannot exceed 500 characters']
    },
    respondedAt: Date
  },
  
  // Tracking
  isReadByAlumni: {
    type: Boolean,
    default: false
  },
  isReadByStudent: {
    type: Boolean,
    default: false
  },
  
  // Follow-up
  followUpDate: Date,
  isFollowedUp: {
    type: Boolean,
    default: false
  },
  
  // Notes
  internalNotes: {
    type: String,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Index for efficient querying
referralRequestSchema.index({ student: 1, status: 1 });
referralRequestSchema.index({ alumni: 1, status: 1 });
referralRequestSchema.index({ createdAt: -1 });

// Validation for achievements array
referralRequestSchema.pre('save', function(next) {
  if (this.achievements && this.achievements.length > 5) {
    return next(new Error('Maximum 5 achievements allowed'));
  }
  next();
});

// Method to check if request is pending
referralRequestSchema.methods.isPending = function() {
  return this.status === 'pending';
};

// Method to check if request is accepted
referralRequestSchema.methods.isAccepted = function() {
  return this.status === 'accepted';
};

// Method to check if request is declined
referralRequestSchema.methods.isDeclined = function() {
  return this.status === 'declined';
};

module.exports = mongoose.model('ReferralRequest', referralRequestSchema); 