const Job = require('../models/Job');
const User = require('../models/User');

// Create job
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      description,
      requirements,
      salary,
      benefits,
      applicationDeadline,
      contactEmail,
      contactPhone
    } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({ message: 'Title, company, and description are required' });
    }

    const job = new Job({
      postedBy: req.user.id,
      title,
      company,
      location,
      type,
      description,
      requirements,
      salary,
      benefits,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      contactEmail,
      contactPhone,
      status: 'active'
    });

    await job.save();
    await job.populate('postedBy', 'name email company position');

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get jobs
const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, location, company } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'active' };
    
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (company) query.company = { $regex: company, $options: 'i' };

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email company position')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single job
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email company position profileImage')
      .populate('applications.applicant', 'name email college branch profileImage');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      description,
      requirements,
      salary,
      benefits,
      applicationDeadline,
      contactEmail,
      contactPhone,
      status
    } = req.body;

    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    if (title) job.title = title;
    if (company) job.company = company;
    if (location) job.location = location;
    if (type) job.type = type;
    if (description) job.description = description;
    if (requirements) job.requirements = requirements;
    if (salary) job.salary = salary;
    if (benefits) job.benefits = benefits;
    if (applicationDeadline) job.applicationDeadline = new Date(applicationDeadline);
    if (contactEmail) job.contactEmail = contactEmail;
    if (contactPhone) job.contactPhone = contactPhone;
    if (status) job.status = status;

    await job.save();
    await job.populate('postedBy', 'name email company position');

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await job.remove();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply for job
const applyForJob = async (req, res) => {
  try {
    const { 
      coverLetter, 
      resumeUrl, 
      leetcodeProfile, 
      hackerrankProfile, 
      codechefProfile, 
      githubProfile, 
      achievements, 
      referralMessage 
    } = req.body;
    
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.some(
      app => app.applicant.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Prepare coding profiles
    const codingProfiles = {};
    if (leetcodeProfile) codingProfiles.leetcode = leetcodeProfile;
    if (hackerrankProfile) codingProfiles.hackerrank = hackerrankProfile;
    if (codechefProfile) codingProfiles.codechef = codechefProfile;
    if (githubProfile) codingProfiles.github = githubProfile;

    const application = {
      applicant: req.user.id,
      coverLetter,
      resumeUrl,
      codingProfiles,
      achievements,
      referralMessage,
      appliedAt: new Date(),
      status: 'pending'
    };

    job.applications.push(application);
    await job.save();

    // If referral message is provided, send notification to job poster
    if (referralMessage && job.postedBy) {
      try {
        const jobPoster = await User.findById(job.postedBy);
        if (jobPoster && jobPoster.email) {
          // Here you would send an email notification to the job poster
          console.log('Referral request sent to:', jobPoster.email);
          console.log('Message:', referralMessage);
        }
      } catch (error) {
        console.error('Error sending referral notification:', error);
      }
    }

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Withdraw application
const withdrawApplication = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applicationIndex = job.applications.findIndex(
      app => app.applicant.toString() === req.user.id
    );

    if (applicationIndex === -1) {
      return res.status(400).json({ message: 'You have not applied for this job' });
    }

    job.applications.splice(applicationIndex, 1);
    await job.save();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get job applications
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applications.applicant', 'name email college branch profileImage');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(job.applications);
  } catch (error) {
    console.error('Error getting job applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    if (!['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const application = job.applications.id(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    if (feedback) application.feedback = feedback;
    application.updatedAt = new Date();

    await job.save();
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search jobs
const searchJobs = async (req, res) => {
  try {
    const { q, type, location, company, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'active' };
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { requirements: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (company) query.company = { $regex: company, $options: 'i' };

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email company position')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get jobs by company
const getJobsByCompany = async (req, res) => {
  try {
    const { company } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({
      company: { $regex: company, $options: 'i' },
      status: 'active'
    })
      .populate('postedBy', 'name email company position')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Job.countDocuments({
      company: { $regex: company, $options: 'i' },
      status: 'active'
    });

    res.json({
      jobs,
      company,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting jobs by company:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recommended jobs
const getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Simple recommendation based on user's skills and branch
    let query = { status: 'active' };
    
    if (user.skills && user.skills.length > 0) {
      query.$or = [
        { requirements: { $regex: user.skills.join('|'), $options: 'i' } },
        { description: { $regex: user.skills.join('|'), $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email company position')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting recommended jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  applyForJob,
  withdrawApplication,
  getJobApplications,
  updateApplicationStatus,
  searchJobs,
  getJobsByCompany,
  getRecommendedJobs
}; 