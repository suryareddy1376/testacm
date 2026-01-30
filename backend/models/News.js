const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'News title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'News content is required']
    },
    excerpt: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    category: {
        type: String,
        enum: ['announcement', 'achievement', 'event', 'general', 'update'],
        default: 'general'
    },
    source: {
        type: String,
        trim: true,
        default: 'KARE ACM SIGBED'
    },
    author: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublished: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date,
        default: Date.now
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
newsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('News', newsSchema);
