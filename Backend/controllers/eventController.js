const Event = require('../models/Event');
const User = require('../models/User');

// Create event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      type,
      maxAttendees,
      registrationDeadline,
      contactEmail,
      contactPhone,
      isPublic,
      tags
    } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ message: 'Title, description, and date are required' });
    }

    const event = new Event({
      organizer: req.user.id,
      title,
      description,
      date: new Date(date),
      time,
      location,
      type,
      maxAttendees,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      contactEmail,
      contactPhone,
      isPublic: isPublic !== false,
      tags: tags || [],
      status: 'upcoming'
    });

    await event.save();
    await event.populate('organizer', 'name email company position');

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get events
const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('organizer', 'name email company position')
      .populate('registrations.user', 'name email college')
      .sort({ date: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email company position profileImage')
      .populate('registrations.user', 'name email college profileImage');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      type,
      maxAttendees,
      registrationDeadline,
      contactEmail,
      contactPhone,
      isPublic,
      tags,
      status
    } = req.body;

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (time) event.time = time;
    if (location) event.location = location;
    if (type) event.type = type;
    if (maxAttendees) event.maxAttendees = maxAttendees;
    if (registrationDeadline) event.registrationDeadline = new Date(registrationDeadline);
    if (contactEmail) event.contactEmail = contactEmail;
    if (contactPhone) event.contactPhone = contactPhone;
    if (isPublic !== undefined) event.isPublic = isPublic;
    if (tags) event.tags = tags;
    if (status) event.status = status;

    await event.save();
    await event.populate('organizer', 'name email company position');

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Registration is not open for this event' });
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if already registered
    const alreadyRegistered = event.registrations.some(
      reg => reg.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check if event is full
    if (event.maxAttendees && event.registrations.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const registration = {
      user: req.user.id,
      registeredAt: new Date(),
      status: 'confirmed'
    };

    event.registrations.push(registration);
    await event.save();

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unregister from event
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrationIndex = event.registrations.findIndex(
      reg => reg.user.toString() === req.user.id
    );

    if (registrationIndex === -1) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    event.registrations.splice(registrationIndex, 1);
    await event.save();

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get event registrations
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations.user', 'name email college profileImage');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(event.registrations);
  } catch (error) {
    console.error('Error getting event registrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search events
const searchEvents = async (req, res) => {
  try {
    const { q, type, location, date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (date) {
      const searchDate = new Date(date);
      query.date = {
        $gte: new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate()),
        $lt: new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1)
      };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email company position')
      .sort({ date: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const events = await Event.find({
      isPublic: true,
      date: { $gte: new Date() },
      status: 'upcoming'
    })
      .populate('organizer', 'name email company position')
      .sort({ date: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Event.countDocuments({
      isPublic: true,
      date: { $gte: new Date() },
      status: 'upcoming'
    });

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get past events
const getPastEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const events = await Event.find({
      isPublic: true,
      date: { $lt: new Date() }
    })
      .populate('organizer', 'name email company position')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Event.countDocuments({
      isPublic: true,
      date: { $lt: new Date() }
    });

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting past events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get events by organizer
const getEventsByOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const events = await Event.find({
      organizer: organizerId,
      isPublic: true
    })
      .populate('organizer', 'name email company position')
      .sort({ date: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Event.countDocuments({
      organizer: organizerId,
      isPublic: true
    });

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting events by organizer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
}; 