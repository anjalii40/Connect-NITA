const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['rsvp', 'attending', 'declined', 'maybe'],
    default: 'rsvp'
  },
  rsvpAt: {
    type: Date,
    default: Date.now
  },
  attended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Resource title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [300, 'Resource description cannot exceed 300 characters']
  },
  file: {
    public_id: String,
    url: String,
    fileName: String,
    fileSize: Number
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Event description cannot exceed 2000 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: ['webinar', 'guest_lecture', 'alumni_meet', 'workshop', 'conference', 'networking'],
    required: true
  },
  domain: {
    type: String,
    enum: ['technology', 'banking', 'consulting', 'startups', 'government', 'design', 'research', 'general'],
    default: 'general'
  },
  
  // Event Details
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    onlinePlatform: {
      name: String,
      link: String,
      meetingId: String,
      password: String
    }
  },
  
  // Capacity and Registration
  maxAttendees: {
    type: Number,
    min: 1
  },
  isRegistrationRequired: {
    type: Boolean,
    default: true
  },
  registrationDeadline: Date,
  
  // Event Status
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Attendees
  attendees: [attendeeSchema],
  
  // Resources
  resources: [resourceSchema],
  
  // Event Features
  isPublic: {
    type: Boolean,
    default: true
  },
  targetAudience: {
    colleges: [String],
    domains: [String],
    userTypes: [{
      type: String,
      enum: ['student', 'alumni']
    }]
  },
  
  // Social Features
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Analytics
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms']
    },
    sendAt: Date,
    isSent: {
      type: Boolean,
      default: false
    }
  }],
  
  // Calendar Integration
  calendarEventId: String,
  calendarLink: String
}, {
  timestamps: true
});

// Index for search functionality
eventSchema.index({ 
  title: 'text', 
  description: 'text',
  tags: 'text',
  hashtags: 'text'
});

// Index for filtering
eventSchema.index({ eventType: 1, domain: 1, status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ organizer: 1 });

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.length;
});

// Virtual for days until event
eventSchema.virtual('daysUntilEvent').get(function() {
  const now = new Date();
  const eventDate = new Date(this.startDate);
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for registration status
eventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.isRegistrationRequired) return true;
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
});

// Ensure virtuals are serialized
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// Method to check if event is ongoing
eventSchema.methods.isOngoing = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Method to check if event is upcoming
eventSchema.methods.isUpcoming = function() {
  return new Date() < this.startDate;
};

// Method to check if event is past
eventSchema.methods.isPast = function() {
  return new Date() > this.endDate;
};

// Method to check if user is attending
eventSchema.methods.isUserAttending = function(userId) {
  return this.attendees.some(attendee => 
    attendee.user.toString() === userId.toString() && 
    ['rsvp', 'attending'].includes(attendee.status)
  );
};

module.exports = mongoose.model('Event', eventSchema); 