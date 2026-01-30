const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory users for when database is not available
const inMemoryUsers = [
    {
        _id: '1',
        name: 'Admin',
        email: 'admin@karesgbd.acm.org',
        password: '$2a$10$example', // This won't work for actual login
        role: 'admin',
        isActive: true
    }
];

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.session?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kare-acm-sigbed-jwt-secret');
        
        // Try to find user in database
        let user;
        if (global.useInMemoryStorage) {
            user = inMemoryUsers.find(u => u._id === decoded.id);
        } else {
            user = await User.findById(decoded.id).select('-password');
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error verifying token.'
        });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Check if user is admin or moderator
const isModeratorOrAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Moderator or Admin privileges required.'
        });
    }
    next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.session?.token;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kare-acm-sigbed-jwt-secret');
            
            let user;
            if (global.useInMemoryStorage) {
                user = inMemoryUsers.find(u => u._id === decoded.id);
            } else {
                user = await User.findById(decoded.id).select('-password');
            }
            
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        next();
    }
};

module.exports = { verifyToken, isAdmin, isModeratorOrAdmin, optionalAuth };
