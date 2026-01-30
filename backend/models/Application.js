const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicationId: {
        type: String,
        unique: true,
        required: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
    },
    rollNo: {
        type: String,
        required: [true, 'Roll number is required'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'OTHER']
    },
    year: {
        type: String,
        required: [true, 'Year of study is required'],
        enum: ['1', '2', '3', '4']
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        enum: ['web-dev', 'pr', 'technical', 'event', 'content']
    },
    skills: {
        type: String,
        trim: true
    },
    motivation: {
        type: String,
        required: [true, 'Motivation is required'],
        trim: true
    },
    linkedin: {
        type: String,
        trim: true
    },
    github: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'],
        default: 'pending'
    },
    notes: {
        type: String,
        trim: true
    },
    interviewDate: {
        type: Date
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to update timestamp
applicationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate application ID before saving
applicationSchema.pre('validate', function(next) {
    if (!this.applicationId) {
        const year = new Date().getFullYear();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.applicationId = `KARE-${year}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Application', applicationSchema);
