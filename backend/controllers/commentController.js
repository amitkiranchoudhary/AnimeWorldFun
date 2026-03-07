const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const logger = require('../utils/logger');

// POST /api/comments — submit comment (public, goes to pending)
exports.submitComment = async (req, res) => {
    try {
        const { blogId, visitorName, visitorEmail, content } = req.body;

        if (!blogId || !visitorName || !visitorEmail || !content) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required (blogId, visitorName, visitorEmail, content).'
            });
        }

        // Verify blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found.' });
        }

        const comment = await Comment.create({
            blog: blogId,
            visitorName,
            visitorEmail,
            content,
            status: 'pending'
        });

        logger.info(`New comment submitted on "${blog.title}" by ${visitorName}`);

        res.status(201).json({
            success: true,
            message: 'Comment submitted. It will appear after review.'
        });
    } catch (error) {
        logger.error(`submitComment error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/comments/blog/:blogId — get approved comments for a blog (public)
exports.getBlogComments = async (req, res) => {
    try {
        const comments = await Comment.find({
            blog: req.params.blogId,
            status: 'approved'
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, data: { comments } });
    } catch (error) {
        logger.error(`getBlogComments error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/comments/pending — get pending comments (admin/writer)
exports.getPendingComments = async (req, res) => {
    try {
        const comments = await Comment.find({ status: 'pending' })
            .populate({ path: 'blog', select: 'title slug' })
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, data: { comments } });
    } catch (error) {
        logger.error(`getPendingComments error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/comments/all — get all comments (admin)
exports.getAllComments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { status } = req.query;

        let query = {};
        if (status) query.status = status;

        const [comments, total] = await Promise.all([
            Comment.find(query)
                .populate({ path: 'blog', select: 'title slug' })
                .populate({ path: 'repliedBy', select: 'name' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Comment.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                comments,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            }
        });
    } catch (error) {
        logger.error(`getAllComments error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/comments/:id/approve — approve comment (admin)
exports.approveComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found.' });
        }

        logger.info(`Comment approved: ${comment._id} by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Comment approved.',
            data: { comment }
        });
    } catch (error) {
        logger.error(`approveComment error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/comments/:id/reject — reject comment (admin)
exports.rejectComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found.' });
        }

        logger.info(`Comment rejected: ${comment._id} by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Comment rejected.',
            data: { comment }
        });
    } catch (error) {
        logger.error(`rejectComment error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/comments/:id/reply — reply to comment (admin/writer)
exports.replyToComment = async (req, res) => {
    try {
        const { reply } = req.body;

        if (!reply) {
            return res.status(400).json({ success: false, message: 'Reply content is required.' });
        }

        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            {
                adminReply: reply,
                repliedBy: req.user._id,
                repliedAt: new Date(),
                status: 'approved' // auto-approve when replying
            },
            { new: true }
        ).populate('repliedBy', 'name');

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found.' });
        }

        logger.info(`Comment replied: ${comment._id} by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Reply added.',
            data: { comment }
        });
    } catch (error) {
        logger.error(`replyToComment error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// DELETE /api/comments/:id — delete comment (admin)
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found.' });
        }

        logger.info(`Comment deleted: ${comment._id} by ${req.user.email}`);

        res.json({ success: true, message: 'Comment deleted.' });
    } catch (error) {
        logger.error(`deleteComment error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
