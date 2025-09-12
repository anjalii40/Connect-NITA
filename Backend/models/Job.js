const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeUrl: {
    type: String
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    required: true
  },
  codingProfiles: {
    leetcode: String,
    hackerrank: String,
    codechef: String,
    github: String
  },
  achievements: {
    type: String,
    maxlength: [1000, 'Achievements cannot exceed 1000 characters']
  },
  referralMessage: {
    type: String,
    maxlength: [2000, 'Referral message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const jobSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: String,
    isRemote: {
      type: Boolean,
      default: false
    }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance'],
    required: true
  },
  domain: {
    type: String,
    enum: ['technology', 'banking', 'consulting', 'startups', 'government', 'design', 'research', 'other'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    isNegotiable: {
      type: Boolean,
      default: true
    }
  },
  benefits: [{
    type: String,
    trim: true
  }],
  applicationDeadline: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applications: [applicationSchema],
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
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  contactEmail: {
    type: String,
    required: true
  },
  applicationLink: String,
  isReferralRequired: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text',
  skills: 'text',
  tags: 'text'
});

// Index for filtering
jobSchema.index({ domain: 1, jobType: 1, isActive: 1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ createdAt: -1 });

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

// Virtual for view count
jobSchema.virtual('viewCount').get(function() {
  return this.views.length;
});

// Virtual for days until deadline
jobSchema.virtual('daysUntilDeadline').get(function() {
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtuals are serialized
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

// Method to check if job is expired
jobSchema.methods.isExpired = function() {
  return new Date() > this.applicationDeadline;
};

// Method to check if user has applied
jobSchema.methods.hasUserApplied = function(userId) {
  return this.applications.some(app => app.applicant.toString() === userId.toString());
};

module.exports = mongoose.model('Job', jobSchema); 