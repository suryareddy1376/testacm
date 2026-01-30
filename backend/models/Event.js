const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    shortDescription: {
        type: String,
        trim: true
    },
    eventType: {
        type: String,
        enum: ['workshop', 'hackathon', 'seminar', 'competition', 'webinar', 'meetup', 'other'],
        default: 'other'
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    endDate: {
        type: Date
    },
    time: {
        type: String,
        trim: true
    },
    venue: {
        type: String,
        trim: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    meetingLink: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    registrationLink: {
        type: String,
        trim: true
    },
    maxParticipants: {
        type: Number
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    speakers: [{
        name: String,
        designation: String,
        organization: String,
        image: String
    }],
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp before saving
eventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Event', eventSchema);
