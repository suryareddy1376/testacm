const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// In-memory storage for when database is not available
let inMemoryUsers = [];

// Initialize default admin
const initDefaultAdmin = async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@karesgbd.acm.org';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (global.useInMemoryStorage) {
        const existingAdmin = inMemoryUsers.find(u => u.email === adminEmail);
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);
            inMemoryUsers.push({
                _id: 'admin-' + Date.now(),
                name: 'Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                createdAt: new Date()
            });
            console.log('✅ Default admin created (in-memory)');
        }
    } else {
        try {
            const existingAdmin = await User.findOne({ email: adminEmail });
            if (!existingAdmin) {
                await User.create({
                    name: 'Administrator',
                    email: adminEmail,
                    password: adminPassword,
                    role: 'admin'
                });
                console.log('✅ Default admin created in database');
            }
        } catch (error) {
            console.log('Admin initialization skipped:', error.message);
        }
    }
};

// Initialize admin on module load
setTimeout(initDefaultAdmin, 2000);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        let user;
        if (global.useInMemoryStorage) {
            user = inMemoryUsers.find(u => u.email === email.toLowerCase());
        } else {
            user = await User.findOne({ email: email.toLowerCase() });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Update last login
        if (!global.useInMemoryStorage) {
            user.lastLogin = new Date();
            await user.save();
        } else {
            user.lastLogin = new Date();
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'kare-acm-sigbed-jwt-secret',
            { expiresIn: '24h' }
        );

        // Store in session
        req.session.token = token;
        req.session.userId = user._id;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    position: user.position
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   POST /api/auth/register
// @desc    Register new user (admin only)
// @access  Private/Admin
router.post('/register', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can register new users'
            });
        }

        const { name, email, password, role, position, department } = req.body;

        // Check if user exists
        let existingUser;
        if (global.useInMemoryStorage) {
            existingUser = inMemoryUsers.find(u => u.email === email.toLowerCase());
        } else {
            existingUser = await User.findOne({ email: email.toLowerCase() });
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        let user;
        if (global.useInMemoryStorage) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = {
                _id: 'user-' + Date.now(),
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role || 'member',
                position,
                department,
                isActive: true,
                createdAt: new Date()
            };
            inMemoryUsers.push(user);
        } else {
            user = await User.create({
                name,
                email,
                password,
                role: role || 'member',
                position,
                department
            });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                position: req.user.position,
                department: req.user.department
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error logging out'
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        let user;
        if (global.useInMemoryStorage) {
            user = inMemoryUsers.find(u => u._id === req.user._id);
        } else {
            user = await User.findById(req.user._id);
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        if (global.useInMemoryStorage) {
            user.password = hashedPassword;
        } else {
            user.password = hashedPassword;
            await user.save();
        }

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
