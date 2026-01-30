const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { verifyToken, isModeratorOrAdmin, optionalAuth } = require('../middleware/auth');

// In-memory storage
let inMemoryEvents = [
    {
        _id: 'event-1',
        title: 'DigiCon 3.0 Hackathon',
        description: 'Annual hackathon competition for innovative solutions in embedded systems and IoT.',
        shortDescription: 'Annual hackathon for embedded systems innovation',
        eventType: 'hackathon',
        date: new Date('2026-02-15'),
        endDate: new Date('2026-02-16'),
        time: '9:00 AM - 6:00 PM',
        venue: 'Main Auditorium, KARE',
        isOnline: false,
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/12/DigiCon3.0.jpg',
        maxParticipants: 200,
        currentParticipants: 45,
        status: 'upcoming',
        isFeatured: true,
        tags: ['hackathon', 'embedded-systems', 'iot'],
        createdAt: new Date()
    },
    {
        _id: 'event-2',
        title: 'Workshop on Embedded Systems',
        description: 'Hands-on workshop covering fundamentals of embedded systems programming.',
        shortDescription: 'Learn embedded systems programming basics',
        eventType: 'workshop',
        date: new Date('2026-02-20'),
        time: '10:00 AM - 4:00 PM',
        venue: 'Lab 301, ECE Department',
        isOnline: false,
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/07/Inauguration-Poster.png',
        maxParticipants: 50,
        currentParticipants: 12,
        status: 'upcoming',
        isFeatured: false,
        tags: ['workshop', 'embedded-systems', 'programming'],
        createdAt: new Date()
    }
];

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { status, type, featured, upcoming, page = 1, limit = 10 } = req.query;

        let events;
        let total;

        if (global.useInMemoryStorage) {
            let filtered = [...inMemoryEvents];

            if (status) filtered = filtered.filter(e => e.status === status);
            if (type) filtered = filtered.filter(e => e.eventType === type);
            if (featured === 'true') filtered = filtered.filter(e => e.isFeatured);
            if (upcoming === 'true') {
                filtered = filtered.filter(e => new Date(e.date) >= new Date());
            }

            total = filtered.length;
            const startIndex = (page - 1) * limit;
            events = filtered
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(startIndex, startIndex + parseInt(limit));
        } else {
            const query = {};
            if (status) query.status = status;
            if (type) query.eventType = type;
            if (featured === 'true') query.isFeatured = true;
            if (upcoming === 'true') query.date = { $gte: new Date() };

            total = await Event.countDocuments(query);
            events = await Event.find(query)
                .sort({ date: 1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));
        }

        res.json({
            success: true,
            data: {
                events,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalEvents: total
                }
            }
        });

    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events'
        });
    }
});

// @route   GET /api/events/upcoming
// @desc    Get upcoming events
// @access  Public
router.get('/upcoming', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        let events;

        if (global.useInMemoryStorage) {
            events = inMemoryEvents
                .filter(e => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, limit);
        } else {
            events = await Event.find({ date: { $gte: new Date() } })
                .sort({ date: 1 })
                .limit(limit);
        }

        res.json({
            success: true,
            data: events
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming events'
        });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        let event;

        if (global.useInMemoryStorage) {
            event = inMemoryEvents.find(e => e._id === req.params.id);
        } else {
            event = await Event.findById(req.params.id);
        }

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching event'
        });
    }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            createdBy: req.user._id
        };

        let event;

        if (global.useInMemoryStorage) {
            event = {
                _id: 'event-' + Date.now(),
                ...eventData,
                currentParticipants: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryEvents.push(event);
        } else {
            event = await Event.create(eventData);
        }

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });

    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event'
        });
    }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        let event;

        if (global.useInMemoryStorage) {
            const index = inMemoryEvents.findIndex(e => e._id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            inMemoryEvents[index] = {
                ...inMemoryEvents[index],
                ...req.body,
                updatedAt: new Date()
            };
            event = inMemoryEvents[index];
        } else {
            event = await Event.findByIdAndUpdate(
                req.params.id,
                { ...req.body, updatedAt: new Date() },
                { new: true }
            );

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating event'
        });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private/Admin
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete events'
            });
        }

        if (global.useInMemoryStorage) {
            const index = inMemoryEvents.findIndex(e => e._id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            inMemoryEvents.splice(index, 1);
        } else {
            const event = await Event.findByIdAndDelete(req.params.id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting event'
        });
    }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Public
router.post('/:id/register', async (req, res) => {
    try {
        const { name, email, phone, rollNo, department } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        let event;

        if (global.useInMemoryStorage) {
            const index = inMemoryEvents.findIndex(e => e._id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            event = inMemoryEvents[index];

            if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
                return res.status(400).json({
                    success: false,
                    message: 'Event is full'
                });
            }

            inMemoryEvents[index].currentParticipants += 1;
        } else {
            event = await Event.findById(req.params.id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
                return res.status(400).json({
                    success: false,
                    message: 'Event is full'
                });
            }

            event.currentParticipants += 1;
            await event.save();
        }

        res.json({
            success: true,
            message: 'Registered successfully for the event'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering for event'
        });
    }
});

module.exports = router;
