const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('../utils/emailService');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('connections', 'name email profileImage college');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, skills, experience, education, socialLinks } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (skills) user.skills = skills;
    if (experience) user.experience = experience;
    if (education) user.education = education;
    if (socialLinks) user.socialLinks = socialLinks;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile-images',
      width: 300,
      crop: 'scale'
    });

    const user = await User.findById(req.user.id);
    user.profileImage = result.secure_url;
    await user.save();

    res.json({ message: 'Profile image uploaded successfully', imageUrl: result.secure_url });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'resumes',
      resource_type: 'raw'
    });

    const user = await User.findById(req.user.id);
    user.resume = result.secure_url;
    await user.save();

    res.json({ message: 'Resume uploaded successfully', resumeUrl: result.secure_url });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q, college, branch, year, skills } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } }
      ];
    }

    if (college) query.college = college;
    if (branch) query.branch = branch;
    if (year) query.graduationYear = year;
    if (skills) {
      query.skills = { $regex: skills, $options: 'i' };
    }

    const users = await User.find(query)
      .select('name email profileImage college branch graduationYear skills')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get alumni directory
const getAlumniDirectory = async (req, res) => {
  try {
    const { college, branch, year, page = 1, limit = 20 } = req.query;
    
    let query = { userType: 'alumni' };
    
    if (college) query.college = college;
    if (branch) query.branch = branch;
    if (year) query.graduationYear = year;

    const alumni = await User.find(query)
      .select('name email profileImage college branch graduationYear skills location')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ name: 1 });

    const total = await User.countDocuments(query);

    res.json({
      alumni,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting alumni directory:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Follow user
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const currentUser = await User.findById(req.user.id);
    
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unfollow user
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id);

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get connections (mutual followers)
const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('connections', 'name email profileImage college');
    res.json(user.connections);
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get followers
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name email profileImage college')
      .select('followers');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    console.error('Error getting followers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get following
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name email profileImage college')
      .select('following');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    console.error('Error getting following:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Block user
const blockUser = async (req, res) => {
  try {
    const userToBlock = await User.findById(req.params.id);
    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const currentUser = await User.findById(req.user.id);
    
    if (currentUser.blockedUsers.includes(req.params.id)) {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    currentUser.blockedUsers.push(req.params.id);

    // Remove from following/followers if exists
    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    userToBlock.followers = userToBlock.followers.filter(id => id.toString() !== req.user.id);

    await currentUser.save();
    await userToBlock.save();

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    const userToUnblock = await User.findById(req.params.id);
    if (!userToUnblock) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser.blockedUsers.includes(req.params.id)) {
      return res.status(400).json({ message: 'User is not blocked' });
    }

    currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== req.params.id);
    await currentUser.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Report user
const reportUser = async (req, res) => {
  try {
    const { reason, description } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Please provide a reason for reporting' });
    }

    const userToReport = await User.findById(req.params.id);
    if (!userToReport) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    // Here you would typically save the report to a separate collection
    // For now, we'll just send an email notification
    const reportData = {
      reportedUser: userToReport.name,
      reportedUserId: req.params.id,
      reportedBy: req.user.name,
      reportedById: req.user.id,
      reason,
      description,
      timestamp: new Date()
    };

    // Send email to admin (you can implement this later)
    console.log('User report:', reportData);

    res.json({ message: 'User reported successfully' });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadResume,
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
}; 