const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { verifyToken, isModeratorOrAdmin } = require('../middleware/auth');

// In-memory storage
let inMemoryApplications = [];

// @route   POST /api/applications
// @desc    Submit a new application
// @access  Public
router.post('/', async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            rollNo,
            department,
            year,
            position,
            skills,
            motivation,
            linkedin,
            github
        } = req.body;

        // Validation
        if (!fullName || !email || !phone || !rollNo || !department || !year || !position || !motivation) {
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

        // Phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit phone number'
            });
        }

        // Check for duplicate application
        let existingApplication;
        if (global.useInMemoryStorage) {
            existingApplication = inMemoryApplications.find(
                a => a.email === email.toLowerCase() || a.rollNo === rollNo
            );
        } else {
            existingApplication = await Application.findOne({
                $or: [
                    { email: email.toLowerCase() },
                    { rollNo: rollNo }
                ]
            });
        }

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'An application with this email or roll number already exists'
            });
        }

        // Generate application ID
        const year_val = new Date().getFullYear();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const applicationId = `KARE-${year_val}-${random}`;

        let application;
        if (global.useInMemoryStorage) {
            application = {
                _id: 'app-' + Date.now(),
                applicationId,
                fullName,
                email: email.toLowerCase(),
                phone: phone.replace(/\D/g, ''),
                rollNo,
                department,
                year,
                position,
                skills,
                motivation,
                linkedin,
                github,
                status: 'pending',
                submittedAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryApplications.push(application);
        } else {
            application = await Application.create({
                applicationId,
                fullName,
                email: email.toLowerCase(),
                phone: phone.replace(/\D/g, ''),
                rollNo,
                department,
                year,
                position,
                skills,
                motivation,
                linkedin,
                github
            });
        }

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully!',
            data: {
                applicationId: application.applicationId,
                name: application.fullName,
                position: application.position,
                submittedAt: application.submittedAt
            }
        });

    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application. Please try again.'
        });
    }
});

// @route   GET /api/applications
// @desc    Get all applications (admin/moderator only)
// @access  Private
router.get('/', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        const { status, position, department, search, page = 1, limit = 10 } = req.query;

        let applications;
        let total;

        if (global.useInMemoryStorage) {
            let filtered = [...inMemoryApplications];

            if (status) filtered = filtered.filter(a => a.status === status);
            if (position) filtered = filtered.filter(a => a.position === position);
            if (department) filtered = filtered.filter(a => a.department === department);
            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter(a => 
                    a.fullName.toLowerCase().includes(searchLower) ||
                    a.email.toLowerCase().includes(searchLower) ||
                    a.rollNo.toLowerCase().includes(searchLower)
                );
            }

            total = filtered.length;
            const startIndex = (page - 1) * limit;
            applications = filtered
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                .slice(startIndex, startIndex + parseInt(limit));
        } else {
            const query = {};
            if (status) query.status = status;
            if (position) query.position = position;
            if (department) query.department = department;
            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { rollNo: { $regex: search, $options: 'i' } }
                ];
            }

            total = await Application.countDocuments(query);
            applications = await Application.find(query)
                .sort({ submittedAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));
        }

        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalApplications: total,
                    hasMore: page * limit < total
                }
            }
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications'
        });
    }
});

// @route   GET /api/applications/stats
// @desc    Get application statistics
// @access  Private
router.get('/stats', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        let stats;

        if (global.useInMemoryStorage) {
            const apps = inMemoryApplications;
            stats = {
                total: apps.length,
                pending: apps.filter(a => a.status === 'pending').length,
                reviewing: apps.filter(a => a.status === 'reviewing').length,
                shortlisted: apps.filter(a => a.status === 'shortlisted').length,
                accepted: apps.filter(a => a.status === 'accepted').length,
                rejected: apps.filter(a => a.status === 'rejected').length,
                byPosition: {
                    'web-dev': apps.filter(a => a.position === 'web-dev').length,
                    'pr': apps.filter(a => a.position === 'pr').length,
                    'technical': apps.filter(a => a.position === 'technical').length,
                    'event': apps.filter(a => a.position === 'event').length,
                    'content': apps.filter(a => a.position === 'content').length
                }
            };
        } else {
            const [statusStats, positionStats] = await Promise.all([
                Application.aggregate([
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ]),
                Application.aggregate([
                    { $group: { _id: '$position', count: { $sum: 1 } } }
                ])
            ]);

            const total = await Application.countDocuments();

            stats = {
                total,
                pending: 0,
                reviewing: 0,
                shortlisted: 0,
                accepted: 0,
                rejected: 0,
                byPosition: {}
            };

            statusStats.forEach(s => {
                stats[s._id] = s.count;
            });

            positionStats.forEach(p => {
                stats.byPosition[p._id] = p.count;
            });
        }

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        let application;

        if (global.useInMemoryStorage) {
            application = inMemoryApplications.find(
                a => a._id === req.params.id || a.applicationId === req.params.id
            );
        } else {
            application = await Application.findOne({
                $or: [
                    { _id: req.params.id },
                    { applicationId: req.params.id }
                ]
            });
        }

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: application
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching application'
        });
    }
});

// @route   PUT /api/applications/:id
// @desc    Update application status
// @access  Private
router.put('/:id', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        const { status, notes, interviewDate } = req.body;

        let application;

        if (global.useInMemoryStorage) {
            const index = inMemoryApplications.findIndex(
                a => a._id === req.params.id || a.applicationId === req.params.id
            );
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            inMemoryApplications[index] = {
                ...inMemoryApplications[index],
                status: status || inMemoryApplications[index].status,
                notes: notes !== undefined ? notes : inMemoryApplications[index].notes,
                interviewDate: interviewDate || inMemoryApplications[index].interviewDate,
                updatedAt: new Date()
            };
            application = inMemoryApplications[index];
        } else {
            application = await Application.findOneAndUpdate(
                {
                    $or: [
                        { _id: req.params.id },
                        { applicationId: req.params.id }
                    ]
                },
                {
                    status,
                    notes,
                    interviewDate,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'Application updated successfully',
            data: application
        });

    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating application'
        });
    }
});

// @route   DELETE /api/applications/:id
// @desc    Delete application
// @access  Private/Admin
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete applications'
            });
        }

        let application;

        if (global.useInMemoryStorage) {
            const index = inMemoryApplications.findIndex(
                a => a._id === req.params.id || a.applicationId === req.params.id
            );
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            application = inMemoryApplications.splice(index, 1)[0];
        } else {
            application = await Application.findOneAndDelete({
                $or: [
                    { _id: req.params.id },
                    { applicationId: req.params.id }
                ]
            });

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });

    } catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting application'
        });
    }
});

// @route   GET /api/applications/check/:email
// @desc    Check if application exists (public - for form validation)
// @access  Public
router.get('/check/:email', async (req, res) => {
    try {
        let exists;

        if (global.useInMemoryStorage) {
            exists = inMemoryApplications.some(
                a => a.email === req.params.email.toLowerCase()
            );
        } else {
            const application = await Application.findOne({ 
                email: req.params.email.toLowerCase() 
            });
            exists = !!application;
        }

        res.json({
            success: true,
            exists
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking application'
        });
    }
});

module.exports = router;
