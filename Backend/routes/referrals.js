const express = require('express');
const router = express.Router();
const { protect, requireStudent, requireAlumni } = require('../middleware/auth');
const {
  createReferralRequest,
  getReferralRequests,
  getReferralRequest,
  updateReferralRequest,
  respondToReferralRequest,
  getReferralStats,
  followUpReferralRequest
} = require('../controllers/referralController');

// Referral request management
router.post('/', protect, requireStudent, createReferralRequest);
router.get('/', protect, getReferralRequests);
router.get('/:id', protect, getReferralRequest);
router.put('/:id', protect, updateReferralRequest);

// Alumni response
router.post('/:id/respond', protect, requireAlumni, respondToReferralRequest);

// Follow-up
router.post('/:id/follow-up', protect, requireStudent, followUpReferralRequest);

// Statistics
router.get('/stats/overview', protect, getReferralStats);

module.exports = router; 