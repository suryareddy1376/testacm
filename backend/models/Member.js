const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Member name is required'],
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    rollNo: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    year: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        trim: true
    },
    team: {
        type: String,
        enum: ['core', 'web-development', 'public-relations', 'technical', 'event-management', 'content', 'faculty'],
        default: 'core'
    },
    bio: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    socialLinks: {
        linkedin: String,
        instagram: String,
        github: String,
        twitter: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    order: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Member', memberSchema);
