const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

// Import routes
const authRoutes = require('./backend/routes/auth');
const applicationRoutes = require('./backend/routes/applications');
const eventRoutes = require('./backend/routes/events');
const newsRoutes = require('./backend/routes/news');
const memberRoutes = require('./backend/routes/members');
const contactRoutes = require('./backend/routes/contact');
const adminRoutes = require('./backend/routes/admin');

// Database connection
const connectDB = require('./backend/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'kare-acm-sigbed-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '/')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// API Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'KARE ACM SIGBED API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/recruitment', (req, res) => {
    res.sendFile(path.join(__dirname, 'recruitment.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'events.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.get('/members', (req, res) => {
    res.sendFile(path.join(__dirname, 'members.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 KARE ACM SIGBED Server running on http://localhost:${PORT}`);
        console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
    });
}

// Export for Vercel
module.exports = app;
