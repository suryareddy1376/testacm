const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
    try {
        // This would normally fetch from database
        // For now, we'll return mock statistics

        const stats = {
            applications: {
                total: 45,
                pending: 12,
                shortlisted: 8,
                accepted: 20,
                rejected: 5
            },
            events: {
                total: 15,
                upcoming: 5,
                completed: 10
            },
            members: {
                total: 35,
                active: 30
            },
            news: {
                total: 25,
                published: 22
            },
            contacts: {
                total: 50,
                unread: 5
            },
            visitors: {
                today: 150,
                thisWeek: 850,
                thisMonth: 3200
            }
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
});

// @route   GET /api/admin/activity
// @desc    Get recent activity log
// @access  Private/Admin
router.get('/activity', verifyToken, isAdmin, async (req, res) => {
    try {
        const activities = [
            {
                id: 1,
                type: 'application',
                message: 'New application received from John Doe',
                timestamp: new Date(Date.now() - 3600000)
            },
            {
                id: 2,
                type: 'event',
                message: 'DigiCon 3.0 registration opened',
                timestamp: new Date(Date.now() - 7200000)
            },
            {
                id: 3,
                type: 'member',
                message: 'New member added: Jane Smith',
                timestamp: new Date(Date.now() - 86400000)
            },
            {
                id: 4,
                type: 'contact',
                message: 'New contact message from visitor',
                timestamp: new Date(Date.now() - 172800000)
            }
        ];

        res.json({
            success: true,
            data: activities
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching activity log'
        });
    }
});

// @route   GET /api/admin/settings
// @desc    Get site settings
// @access  Private/Admin
router.get('/settings', verifyToken, isAdmin, async (req, res) => {
    try {
        const settings = {
            siteName: 'KARE ACM SIGBED',
            siteTagline: 'Empowering Embedded Systems Research',
            contactEmail: 'contact@karesgbd.acm.org',
            socialLinks: {
                linkedin: 'https://linkedin.com/company/kare-acm-sigbed',
                instagram: 'https://instagram.com/kare_acm_sigbed',
                youtube: 'https://youtube.com',
                github: 'https://github.com'
            },
            recruitmentOpen: true,
            maintenanceMode: false
        };

        res.json({
            success: true,
            data: settings
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching settings'
        });
    }
});

// @route   PUT /api/admin/settings
// @desc    Update site settings
// @access  Private/Admin
router.put('/settings', verifyToken, isAdmin, async (req, res) => {
    try {
        // In a real app, this would save to database
        res.json({
            success: true,
            message: 'Settings updated successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating settings'
        });
    }
});

module.exports = router;
