const express = require('express');
const router = express.Router();
const { protect, optionalAuth, requireAlumni } = require('../middleware/auth');
const {
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
} = require('../controllers/jobController');

// Job CRUD
router.post('/', protect, requireAlumni, createJob);
router.get('/', optionalAuth, getJobs);
router.get('/search', optionalAuth, searchJobs);
router.get('/company/:company', optionalAuth, getJobsByCompany);
router.get('/recommended', protect, getRecommendedJobs);
router.get('/:id', optionalAuth, getJob);
router.put('/:id', protect, requireAlumni, updateJob);
router.delete('/:id', protect, requireAlumni, deleteJob);

// Job applications
router.post('/:id/apply', protect, applyForJob);
router.delete('/:id/apply', protect, withdrawApplication);
router.get('/:id/applications', protect, requireAlumni, getJobApplications);
router.put('/:id/applications/:applicationId', protect, requireAlumni, updateApplicationStatus);

module.exports = router; 