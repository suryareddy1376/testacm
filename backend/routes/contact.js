const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { verifyToken, isModeratorOrAdmin } = require('../middleware/auth');

// In-memory storage
let inMemoryContacts = [];

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message, category } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Email validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        let contact;

        if (global.useInMemoryStorage) {
            contact = {
                _id: 'contact-' + Date.now(),
                name,
                email: email.toLowerCase(),
                subject,
                message,
                category: category || 'general',
                status: 'new',
                createdAt: new Date()
            };
            inMemoryContacts.push(contact);
        } else {
            contact = await Contact.create({
                name,
                email: email.toLowerCase(),
                subject,
                message,
                category: category || 'general'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting contact form'
        });
    }
});

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private
router.get('/', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;

        let contacts;
        let total;

        if (global.useInMemoryStorage) {
            let filtered = [...inMemoryContacts];

            if (status) filtered = filtered.filter(c => c.status === status);
            if (category) filtered = filtered.filter(c => c.category === category);

            total = filtered.length;
            const startIndex = (page - 1) * limit;
            contacts = filtered
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(startIndex, startIndex + parseInt(limit));
        } else {
            const query = {};
            if (status) query.status = status;
            if (category) query.category = category;

            total = await Contact.countDocuments(query);
            contacts = await Contact.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));
        }

        res.json({
            success: true,
            data: {
                contacts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalMessages: total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts'
        });
    }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message
// @access  Private
router.get('/:id', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        let contact;

        if (global.useInMemoryStorage) {
            contact = inMemoryContacts.find(c => c._id === req.params.id);
            if (contact && contact.status === 'new') {
                contact.status = 'read';
            }
        } else {
            contact = await Contact.findByIdAndUpdate(
                req.params.id,
                { status: 'read' },
                { new: true }
            );
        }

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contact'
        });
    }
});

// @route   PUT /api/contact/:id
// @desc    Update contact status/reply
// @access  Private
router.put('/:id', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        const { status, reply } = req.body;

        let contact;

        if (global.useInMemoryStorage) {
            const index = inMemoryContacts.findIndex(c => c._id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            }

            inMemoryContacts[index] = {
                ...inMemoryContacts[index],
                status: status || inMemoryContacts[index].status,
                reply: reply || inMemoryContacts[index].reply,
                repliedAt: reply ? new Date() : inMemoryContacts[index].repliedAt
            };
            contact = inMemoryContacts[index];
        } else {
            const updateData = { status };
            if (reply) {
                updateData.reply = reply;
                updateData.repliedAt = new Date();
                updateData.status = 'replied';
            }

            contact = await Contact.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'Contact updated successfully',
            data: contact
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating contact'
        });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message
// @access  Private/Admin
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete contacts'
            });
        }

        if (global.useInMemoryStorage) {
            const index = inMemoryContacts.findIndex(c => c._id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            }

            inMemoryContacts.splice(index, 1);
        } else {
            const contact = await Contact.findByIdAndDelete(req.params.id);

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting contact'
        });
    }
});

module.exports = router;
