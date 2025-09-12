const express = require('express');
const router = express.Router();
const { protect, optionalAuth, requireAlumni } = require('../middleware/auth');
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations,
  searchEvents,
  getUpcomingEvents,
  getPastEvents,
  getEventsByOrganizer
} = require('../controllers/eventController');

// Event CRUD
router.post('/', protect, requireAlumni, createEvent);
router.get('/', optionalAuth, getEvents);
router.get('/upcoming', optionalAuth, getUpcomingEvents);
router.get('/past', optionalAuth, getPastEvents);
router.get('/search', optionalAuth, searchEvents);
router.get('/organizer/:organizerId', optionalAuth, getEventsByOrganizer);
router.get('/:id', optionalAuth, getEvent);
router.put('/:id', protect, requireAlumni, updateEvent);
router.delete('/:id', protect, requireAlumni, deleteEvent);

// Event registration
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, unregisterFromEvent);
router.get('/:id/registrations', protect, requireAlumni, getEventRegistrations);

module.exports = router; 