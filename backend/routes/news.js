const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { verifyToken, isModeratorOrAdmin, optionalAuth } = require('../middleware/auth');

// In-memory storage
let inMemoryNews = [
    {
        _id: 'news-1',
        title: 'DigiCon Hackathon Round 2',
        content: 'The second round of DigiCon Hackathon was successfully conducted with participation from over 100 students.',
        excerpt: 'Second round of DigiCon Hackathon conducted successfully.',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/11/ROUND-2-Digicon.jpg',
        category: 'event',
        source: 'KARE ACM SIGBED',
        author: 'Web Development Team',
        isPublished: true,
        isFeatured: true,
        views: 150,
        publishedAt: new Date('2025-10-27'),
        createdAt: new Date('2025-10-27')
    },
    {
        _id: 'news-2',
        title: 'Gandhi Jayanti 2025',
        content: 'KARE ACM SIGBED wishes everyone a Happy Gandhi Jayanti. Let us remember and follow the principles of truth and non-violence.',
        excerpt: 'Gandhi Jayanti wishes from KARE ACM SIGBED',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/10/Gandhi-jayanthi-2025.png',
        category: 'announcement',
        source: 'Web Development Division',
        isPublished: true,
        isFeatured: false,
        views: 89,
        publishedAt: new Date('2025-10-02'),
        createdAt: new Date('2025-10-02')
    },
    {
        _id: 'news-3',
        title: 'Treasure Hunt – Non Technical Event',
        content: 'A fun-filled treasure hunt event was organized for all students to encourage teamwork and problem-solving skills.',
        excerpt: 'Treasure hunt event for students',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/09/TREASURE-HUNT-PNG.png',
        category: 'event',
        source: 'Web Development Division',
        isPublished: true,
        views: 67,
        publishedAt: new Date('2025-09-15'),
        createdAt: new Date('2025-09-15')
    },
    {
        _id: 'news-4',
        title: 'Onam Wishes from KARE ACM SigBED',
        content: 'Wishing everyone a prosperous and joyful Onam! May this harvest festival bring happiness to all.',
        excerpt: 'Onam wishes from the chapter',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/09/KARE-Onam.png',
        category: 'announcement',
        source: 'Public Relations Team',
        isPublished: true,
        views: 45,
        publishedAt: new Date('2025-09-06'),
        createdAt: new Date('2025-09-06')
    },
    {
        _id: 'news-5',
        title: 'SiGBED KARE Student Chapter Inauguration',
        content: 'The official inauguration of KARE ACM SIGBED Student Chapter was held with great enthusiasm.',
        excerpt: 'Official inauguration of the student chapter',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/07/Inauguration-Poster.png',
        category: 'event',
        source: 'Nischal S Tumbeti',
        isPublished: true,
        isFeatured: true,
        views: 234,
        publishedAt: new Date('2025-07-14'),
        createdAt: new Date('2025-07-14')
    },
    {
        _id: 'news-6',
        title: 'Grand Inauguration of KARE ACM SIGBED',
        content: 'The grand inauguration ceremony marked the beginning of KARE ACM SIGBED Student Chapter.',
        excerpt: 'Grand inauguration ceremony',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/07/GI-Poster.png',
        category: 'event',
        source: 'Public Relations Team',
        isPublished: true,
        isFeatured: true,
        views: 312,
        publishedAt: new Date('2025-06-19'),
        createdAt: new Date('2025-06-19')
    }
];

// @route   GET /api/news
// @desc    Get all news
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { category, featured, published = 'true', page = 1, limit = 10 } = req.query;

        let news;
        let total;

        if (global.useInMemoryStorage) {
            let filtered = [...inMemoryNews];

            if (published === 'true') filtered = filtered.filter(n => n.isPublished);
            if (category) filtered = filtered.filter(n => n.category === category);
            if (featured === 'true') filtered = filtered.filter(n => n.isFeatured);

            total = filtered.length;
            const startIndex = (page - 1) * limit;
            news = filtered
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                .slice(startIndex, startIndex + parseInt(limit));
        } else {
            const query = {};
            if (published === 'true') query.isPublished = true;
            if (category) query.category = category;
            if (featured === 'true') query.isFeatured = true;

            total = await News.countDocuments(query);
            news = await News.find(query)
                .sort({ publishedAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));
        }

        res.json({
            success: true,
            data: {
                news,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalNews: total
                }
            }
        });

    } catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching news'
        });
    }
});

// @route   GET /api/news/featured
// @desc    Get featured news
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        let news;

        if (global.useInMemoryStorage) {
            news = inMemoryNews
                .filter(n => n.isPublished && n.isFeatured)
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                .slice(0, limit);
        } else {
            news = await News.find({ isPublished: true, isFeatured: true })
                .sort({ publishedAt: -1 })
                .limit(limit);
        }

        res.json({
            success: true,
            data: news
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching featured news'
        });
    }
});

// @route   GET /api/news/:id
// @desc    Get single news
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        let newsItem;

        if (global.useInMemoryStorage) {
            newsItem = inMemoryNews.find(n => n._id === req.params.id);
            if (newsItem) {
                newsItem.views += 1;
            }
        } else {
            newsItem = await News.findByIdAndUpdate(
                req.params.id,
                { $inc: { views: 1 } },
                { new: true }
            );
        }

        if (!newsItem) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        res.json({
            success: true,
            data: newsItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching news'
        });
    }
});

// @route   POST /api/news
// @desc    Create news
// @access  Private
router.post('/', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        let newsItem;

        if (global.useInMemoryStorage) {
            newsItem = {
                _id: 'news-' + Date.now(),
                ...req.body,
                views: 0,
                publishedAt: req.body.isPublished ? new Date() : null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryNews.unshift(newsItem);
        } else {
            newsItem = await News.create({
                ...req.body,
                publishedAt: req.body.isPublished ? new Date() : null
            });
        }

        res.status(201).json({
            success: true,
            message: 'News created successfully',
            data: newsItem
        });

    } catch (error) {
        console.error('Create news error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating news'
        });
    }
});

// @route   PUT /api/news/:id
// @desc    Update news
// @access  Private
router.put('/:id', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        let newsItem;

        if (global.useInMemoryStorage) {
            const index = inMemoryNews.findIndex(n => n._id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'News not found'
                });
            }

            inMemoryNews[index] = {
                ...inMemoryNews[index],
                ...req.body,
                updatedAt: new Date()
            };
            newsItem = inMemoryNews[index];
        } else {
            newsItem = await News.findByIdAndUpdate(
                req.params.id,
                { ...req.body, updatedAt: new Date() },
                { new: true }
            );

            if (!newsItem) {
                return res.status(404).json({
                    success: false,
                    message: 'News not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'News updated successfully',
            data: newsItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating news'
        });
    }
});

// @route   DELETE /api/news/:id
// @desc    Delete news
// @access  Private/Admin
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete news'
            });
        }

        if (global.useInMemoryStorage) {
            const index = inMemoryNews.findIndex(n => n._id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'News not found'
                });
            }

            inMemoryNews.splice(index, 1);
        } else {
            const newsItem = await News.findByIdAndDelete(req.params.id);

            if (!newsItem) {
                return res.status(404).json({
                    success: false,
                    message: 'News not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'News deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting news'
        });
    }
});

module.exports = router;
