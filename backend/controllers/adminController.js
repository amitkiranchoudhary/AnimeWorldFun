const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// GET /api/admin/stats — dashboard statistics
exports.getStats = async (req, res) => {
    try {
        const [
            totalBlogs,
            publishedBlogs,
            draftBlogs,
            totalComments,
            pendingComments,
            totalWriters,
            activeWriters
        ] = await Promise.all([
            Blog.countDocuments(),
            Blog.countDocuments({ status: 'published' }),
            Blog.countDocuments({ status: 'draft' }),
            Comment.countDocuments(),
            Comment.countDocuments({ status: 'pending' }),
            User.countDocuments({ role: 'writer' }),
            User.countDocuments({ role: 'writer', isActive: true })
        ]);

        const totalViews = await Blog.aggregate([
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);

        // Recent activity
        const recentBlogs = await Blog.find()
            .populate('author', 'name')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const recentComments = await Comment.find()
            .populate({ path: 'blog', select: 'title' })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.json({
            success: true,
            data: {
                stats: {
                    totalBlogs,
                    publishedBlogs,
                    draftBlogs,
                    totalComments,
                    pendingComments,
                    totalWriters,
                    activeWriters,
                    totalViews: totalViews[0]?.total || 0
                },
                recentBlogs,
                recentComments
            }
        });
    } catch (error) {
        logger.error(`getStats error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/admin/writers — list all writers
exports.getWriters = async (req, res) => {
    try {
        const writers = await User.find({ role: 'writer' })
            .sort({ createdAt: -1 })
            .lean();

        // Add blog count for each writer
        const writersWithStats = await Promise.all(
            writers.map(async (writer) => {
                const blogCount = await Blog.countDocuments({ author: writer._id });
                return { ...writer, blogCount };
            })
        );

        res.json({ success: true, data: { writers: writersWithStats } });
    } catch (error) {
        logger.error(`getWriters error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/admin/writers — create a writer account
exports.createWriter = async (req, res) => {
    try {
        const { name, email, password, assignedTopics } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.'
            });
        }

        // Check if user already exists
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists.'
            });
        }

        const writer = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: 'writer',
            assignedTopics: assignedTopics || []
        });

        // Generate a token for the writer
        const token = jwt.sign(
            { id: writer._id, email: writer.email, role: writer.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        logger.info(`Writer created: ${writer.email} by admin ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Writer account created successfully',
            data: {
                writer: {
                    id: writer._id,
                    name: writer.name,
                    email: writer.email,
                    role: writer.role,
                    assignedTopics: writer.assignedTopics
                },
                writerToken: token
            }
        });
    } catch (error) {
        logger.error(`createWriter error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/admin/writers/:id/assign — assign topics to writer
exports.assignTopics = async (req, res) => {
    try {
        const { topics } = req.body;

        if (!topics || !Array.isArray(topics)) {
            return res.status(400).json({
                success: false,
                message: 'Topics array is required.'
            });
        }

        const writer = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'writer' },
            { assignedTopics: topics },
            { new: true }
        );

        if (!writer) {
            return res.status(404).json({ success: false, message: 'Writer not found.' });
        }

        logger.info(`Topics assigned to ${writer.email}: ${topics.join(', ')}`);

        res.json({
            success: true,
            message: 'Topics assigned successfully',
            data: { writer }
        });
    } catch (error) {
        logger.error(`assignTopics error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/admin/writers/:id/toggle — toggle writer active status
exports.toggleWriter = async (req, res) => {
    try {
        const writer = await User.findOne({ _id: req.params.id, role: 'writer' });

        if (!writer) {
            return res.status(404).json({ success: false, message: 'Writer not found.' });
        }

        writer.isActive = !writer.isActive;
        await writer.save();

        logger.info(`Writer ${writer.isActive ? 'activated' : 'deactivated'}: ${writer.email} by ${req.user.email}`);

        res.json({
            success: true,
            message: `Writer ${writer.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { writer }
        });
    } catch (error) {
        logger.error(`toggleWriter error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// DELETE /api/admin/writers/:id — remove writer
exports.deleteWriter = async (req, res) => {
    try {
        const writer = await User.findOneAndDelete({ _id: req.params.id, role: 'writer' });

        if (!writer) {
            return res.status(404).json({ success: false, message: 'Writer not found.' });
        }

        logger.info(`Writer deleted: ${writer.email} by admin ${req.user.email}`);

        res.json({
            success: true,
            message: 'Writer removed successfully'
        });
    } catch (error) {
        logger.error(`deleteWriter error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/admin/blogs — get all blogs (any status)
exports.getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            Blog.find()
                .populate('author', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Blog.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                blogs,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            }
        });
    } catch (error) {
        logger.error(`getAllBlogs error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
