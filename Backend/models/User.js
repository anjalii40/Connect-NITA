const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  // User Type and Verification
  userType: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    required: [true, 'User type is required']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // College Information (required only for students and alumni)
  college: {
    name: {
      type: String,
      required: function() {
        return this.userType !== 'admin';
      }
    },
    tier: {
      type: String,
      enum: ['Tier 1', 'Tier 2'],
      required: function() {
        return this.userType !== 'admin';
      }
    }
  },
  branch: {
    type: String,
    required: function() {
      return this.userType !== 'admin';
    }
  },
  batchYear: {
    type: Number,
    required: function() {
      return this.userType !== 'admin';
    },
    min: [1950, 'Invalid batch year'],
    max: [new Date().getFullYear() + 5, 'Invalid batch year']
  },
  
  // Professional Information (required only for students and alumni)
  domain: {
    type: String,
    enum: ['technology', 'banking', 'consulting', 'startups', 'government', 'design', 'research', 'other'],
    required: function() {
      return this.userType !== 'admin';
    }
  },
  currentRole: {
    type: String,
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  currentCompany: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  
  // Profile Information
  profileImage: {
    public_id: String,
    url: {
      type: String,
      default: 'https://res.cloudinary.com/your-cloud/image/upload/v1/default-avatar.png'
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  
  // Portfolio and Links
  portfolio: {
    resume: {
      public_id: String,
      url: String
    },
    linkedin: String,
    github: String,
    personalWebsite: String,
    leetcode: String,
    codeforces: String,
    codechef: String
  },
  
  // Achievements
  achievements: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Achievement title cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [300, 'Achievement description cannot exceed 300 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Social Features
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  
  // Timestamps
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ 
  'college.name': 'text', 
  'branch': 'text', 
  'currentRole': 'text', 
  'currentCompany': 'text',
  'skills': 'text',
  'location.city': 'text',
  'location.state': 'text'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to check if user is alumni
userSchema.methods.isAlumni = function() {
  return this.userType === 'alumni';
};

// Method to check if user is student
userSchema.methods.isStudent = function() {
  return this.userType === 'student';
};

module.exports = mongoose.model('User', userSchema); 