const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { verifyToken, isModeratorOrAdmin } = require('../middleware/auth');

// In-memory storage with default members
let inMemoryMembers = [
    {
        _id: 'member-1',
        name: 'Dr. Muneeswaran V',
        position: 'Faculty Sponsor',
        department: 'Electronics & Communication Engineering',
        team: 'faculty',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/07/Dr.Munneswaran.V.jpg',
        socialLinks: {
            linkedin: 'https://www.linkedin.com/in/drmunneeswaran'
        },
        isActive: true,
        order: 1
    },
    {
        _id: 'member-2',
        name: 'Dr. P Manikandan',
        position: 'Faculty Coordinator',
        department: 'Electronics & Communication Engineering',
        team: 'faculty',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/07/Dr.PKM-ECE-FCACM-SiGBED.jpg',
        isActive: true,
        order: 2
    },
    {
        _id: 'member-3',
        name: 'Sai Siddardha Davuluri',
        position: 'Chairperson',
        department: 'Computer Science',
        team: 'core',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/07/Chaiperson-SS.jpg',
        socialLinks: {
            linkedin: 'https://www.linkedin.com/in/sai-siddardha',
            instagram: 'https://instagram.com/sai.siddardha',
            github: 'https://github.com/saisiddardha'
        },
        bio: 'Leading the KARE ACM SIGBED Student Chapter with passion for embedded systems.',
        isActive: true,
        order: 3
    },
    {
        _id: 'member-4',
        name: 'Selva Jotheha C A',
        position: 'Secretary',
        department: 'Electronics & Communications',
        team: 'core',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/09/SJCA.jpg',
        bio: "I've learned a lot while helping organize events that brought students together to explore and grow in embedded systems.",
        isActive: true,
        order: 4
    },
    {
        _id: 'member-5',
        name: 'Nischal S Tumbeti',
        position: 'Web Information Manager',
        department: 'Computer Science',
        team: 'web-development',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/09/Nischal-WiM.png',
        bio: 'Proud to lead the digital presence. Bridging technology and community through dynamic, user focused platforms.',
        isActive: true,
        order: 5
    },
    {
        _id: 'member-6',
        name: 'Neelakanteswar Reddy B',
        position: 'Public Relations Team',
        department: 'Electronics & Communication',
        team: 'public-relations',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/07/BNR-PR-Team.png',
        bio: 'Being part of the PR team helped me build confidence and contribute meaningfully to the chapter.',
        isActive: true,
        order: 6
    },
    {
        _id: 'member-7',
        name: 'Varshitha Mallela',
        position: 'Web Development Team',
        department: 'Electronics & Communication',
        team: 'web-development',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/10/M-Varshitha.jpg',
        bio: 'As a member of the Web Development Team, I turn ideas into interactive experiences.',
        isActive: true,
        order: 7
    },
    {
        _id: 'member-8',
        name: 'Harshitha Guduri',
        position: 'PR & Outreach Team',
        department: 'Electronics & Communication',
        team: 'public-relations',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/07/GH-PRTeam.jpg',
        bio: 'Joining the PR Team gave me the chance to work on something impactful right from the start.',
        isActive: true,
        order: 8
    },
    {
        _id: 'member-9',
        name: 'Santosh Kumar G',
        position: 'Web Development Team',
        department: 'Computer Science',
        team: 'web-development',
        image: 'https://karesgbd.acm.org/wp-content/uploads/2025/07/Santosh.jpg',
        bio: 'It gave me the opportunity to organize events that mattered.',
        isActive: true,
        order: 9
    }
];

// @route   GET /api/members
// @desc    Get all members
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { team, active = 'true' } = req.query;

        let members;

        if (global.useInMemoryStorage) {
            let filtered = [...inMemoryMembers];

            if (active === 'true') filtered = filtered.filter(m => m.isActive);
            if (team) filtered = filtered.filter(m => m.team === team);

            members = filtered.sort((a, b) => a.order - b.order);
        } else {
            const query = {};
            if (active === 'true') query.isActive = true;
            if (team) query.team = team;

            members = await Member.find(query).sort({ order: 1 });
        }

        res.json({
            success: true,
            data: members
        });

    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching members'
        });
    }
});

// @route   GET /api/members/teams
// @desc    Get members grouped by team
// @access  Public
router.get('/teams', async (req, res) => {
    try {
        let members;

        if (global.useInMemoryStorage) {
            members = inMemoryMembers.filter(m => m.isActive);
        } else {
            members = await Member.find({ isActive: true }).sort({ order: 1 });
        }

        const teams = {
            faculty: members.filter(m => m.team === 'faculty'),
            core: members.filter(m => m.team === 'core'),
            'web-development': members.filter(m => m.team === 'web-development'),
            'public-relations': members.filter(m => m.team === 'public-relations'),
            technical: members.filter(m => m.team === 'technical'),
            'event-management': members.filter(m => m.team === 'event-management'),
            content: members.filter(m => m.team === 'content')
        };

        res.json({
            success: true,
            data: teams
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching teams'
        });
    }
});

// @route   GET /api/members/:id
// @desc    Get single member
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        let member;

        if (global.useInMemoryStorage) {
            member = inMemoryMembers.find(m => m._id === req.params.id);
        } else {
            member = await Member.findById(req.params.id);
        }

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.json({
            success: true,
            data: member
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching member'
        });
    }
});

// @route   POST /api/members
// @desc    Add new member
// @access  Private
router.post('/', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        let member;

        if (global.useInMemoryStorage) {
            const maxOrder = Math.max(...inMemoryMembers.map(m => m.order), 0);
            member = {
                _id: 'member-' + Date.now(),
                ...req.body,
                order: req.body.order || maxOrder + 1,
                isActive: true,
                joinedAt: new Date()
            };
            inMemoryMembers.push(member);
        } else {
            member = await Member.create(req.body);
        }

        res.status(201).json({
            success: true,
            message: 'Member added successfully',
            data: member
        });

    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding member'
        });
    }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put('/:id', verifyToken, isModeratorOrAdmin, async (req, res) => {
    try {
        let member;

        if (global.useInMemoryStorage) {
            const index = inMemoryMembers.findIndex(m => m._id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            inMemoryMembers[index] = {
                ...inMemoryMembers[index],
                ...req.body
            };
            member = inMemoryMembers[index];
        } else {
            member = await Member.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'Member updated successfully',
            data: member
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating member'
        });
    }
});

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private/Admin
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete members'
            });
        }

        if (global.useInMemoryStorage) {
            const index = inMemoryMembers.findIndex(m => m._id === req.params.id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            inMemoryMembers.splice(index, 1);
        } else {
            const member = await Member.findByIdAndDelete(req.params.id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }
        }

        res.json({
            success: true,
            message: 'Member deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting member'
        });
    }
});

module.exports = router;
