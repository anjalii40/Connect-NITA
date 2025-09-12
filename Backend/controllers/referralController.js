const ReferralRequest = require('../models/ReferralRequest');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Create referral request
const createReferralRequest = async (req, res) => {
  try {
    const {
      company,
      position,
      jobDescription,
      requirements,
      deadline,
      additionalNotes
    } = req.body;

    if (!company || !position) {
      return res.status(400).json({ message: 'Company and position are required' });
    }

    const referralRequest = new ReferralRequest({
      student: req.user.id,
      company,
      position,
      jobDescription,
      requirements,
      deadline: deadline ? new Date(deadline) : null,
      additionalNotes,
      status: 'pending'
    });

    await referralRequest.save();
    await referralRequest.populate('student', 'name email college branch');

    res.status(201).json(referralRequest);
  } catch (error) {
    console.error('Error creating referral request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get referral requests
const getReferralRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Students see their own requests
    if (req.user.userType === 'student') {
      query.student = req.user.id;
    }
    
    // Alumni see requests they can help with
    if (req.user.userType === 'alumni') {
      query.status = { $in: ['pending', 'in_progress'] };
    }

    if (status) {
      query.status = status;
    }

    const requests = await ReferralRequest.find(query)
      .populate('student', 'name email college branch')
      .populate('alumni', 'name email company position')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ReferralRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting referral requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single referral request
const getReferralRequest = async (req, res) => {
  try {
    const request = await ReferralRequest.findById(req.params.id)
      .populate('student', 'name email college branch profileImage')
      .populate('alumni', 'name email company position profileImage')
      .populate('messages.author', 'name email profileImage');

    if (!request) {
      return res.status(404).json({ message: 'Referral request not found' });
    }

    // Check authorization
    if (req.user.userType === 'student' && request.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error getting referral request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update referral request
const updateReferralRequest = async (req, res) => {
  try {
    const {
      company,
      position,
      jobDescription,
      requirements,
      deadline,
      additionalNotes
    } = req.body;

    const request = await ReferralRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Referral request not found' });
    }

    if (request.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update request that is already in progress' });
    }

    if (company) request.company = company;
    if (position) request.position = position;
    if (jobDescription) request.jobDescription = jobDescription;
    if (requirements) request.requirements = requirements;
    if (deadline) request.deadline = new Date(deadline);
    if (additionalNotes) request.additionalNotes = additionalNotes;

    await request.save();
    await request.populate('student', 'name email college branch');

    res.json(request);
  } catch (error) {
    console.error('Error updating referral request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to referral request
const respondToReferralRequest = async (req, res) => {
  try {
    const { response, message } = req.body;
    
    if (!response || !['accept', 'decline'].includes(response)) {
      return res.status(400).json({ message: 'Valid response (accept/decline) is required' });
    }

    const request = await ReferralRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Referral request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer pending' });
    }

    request.status = response === 'accept' ? 'in_progress' : 'declined';
    request.alumni = req.user.id;
    request.alumniResponse = response;
    request.alumniMessage = message;
    request.respondedAt = new Date();

    if (response === 'accept') {
      // Add message to conversation
      request.messages.push({
        author: req.user.id,
        content: message || 'I\'ll help you with this referral request.',
        timestamp: new Date()
      });
    }

    await request.save();
    await request.populate('student', 'name email');
    await request.populate('alumni', 'name email');

    // Send email notification
    if (request.student.email) {
      const subject = response === 'accept' 
        ? 'Your referral request has been accepted!' 
        : 'Update on your referral request';
      
      const emailContent = response === 'accept'
        ? `Great news! An alumni has accepted your referral request for ${request.position} at ${request.company}. Check your dashboard for more details.`
        : `An alumni has declined your referral request for ${request.position} at ${request.company}. Don't worry, you can still reach out to other alumni.`;

      await sendEmail(request.student.email, subject, emailContent);
    }

    res.json(request);
  } catch (error) {
    console.error('Error responding to referral request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get referral stats
const getReferralStats = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.userType === 'student') {
      query.student = req.user.id;
    } else if (req.user.userType === 'alumni') {
      query.alumni = req.user.id;
    }

    const stats = await ReferralRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRequests = await ReferralRequest.countDocuments(query);
    const pendingRequests = await ReferralRequest.countDocuments({ ...query, status: 'pending' });
    const completedRequests = await ReferralRequest.countDocuments({ ...query, status: 'completed' });

    res.json({
      total: totalRequests,
      pending: pendingRequests,
      completed: completedRequests,
      breakdown: stats
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Follow up referral request
const followUpReferralRequest = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const request = await ReferralRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Referral request not found' });
    }

    if (request.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status === 'pending') {
      return res.status(400).json({ message: 'Cannot follow up on pending request' });
    }

    // Add message to conversation
    request.messages.push({
      author: req.user.id,
      content: message,
      timestamp: new Date()
    });

    await request.save();
    await request.populate('messages.author', 'name email profileImage');

    res.json(request);
  } catch (error) {
    console.error('Error following up referral request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReferralRequest,
  getReferralRequests,
  getReferralRequest,
  updateReferralRequest,
  respondToReferralRequest,
  getReferralStats,
  followUpReferralRequest
}; 