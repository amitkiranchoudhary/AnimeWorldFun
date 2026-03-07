const Blog = require('../models/Blog');
const logger = require('../utils/logger');

// GET /api/blogs — public, get all published blogs
exports.getBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const { category, tag, search } = req.query;

        let query = { status: 'published' };

        if (category) query.category = category;
        if (tag) query.tags = { $in: [tag.toLowerCase()] };
        if (search) query.$text = { $search: search };

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .populate('author', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Blog.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                blogs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        logger.error(`getBlogs error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/blogs/:slug — public, get single blog by slug
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
            .populate('author', 'name avatar bio');

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found.' });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        res.json({ success: true, data: { blog } });
    } catch (error) {
        logger.error(`getBlogBySlug error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/blogs/id/:id — get by ID (for editing)
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'name avatar');

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found.' });
        }

        // Writers can only view their own
        if (req.user.role === 'writer' && blog.author._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        res.json({ success: true, data: { blog } });
    } catch (error) {
        logger.error(`getBlogById error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/blogs — create blog (writer/admin)
exports.createBlog = async (req, res) => {
    try {
        const { title, content, coverImage, tags, category, status } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required.'
            });
        }

        const blog = await Blog.create({
            title,
            content,
            coverImage: coverImage || '',
            tags: tags || [],
            category: category || 'General',
            status: status || 'draft',
            author: req.user._id
        });

        await blog.populate('author', 'name avatar');

        logger.info(`Blog created: "${blog.title}" by ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: { blog }
        });
    } catch (error) {
        logger.error(`createBlog error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/blogs/:id — update blog (own or admin)
exports.updateBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found.' });
        }

        // Writers can only edit their own blogs
        if (req.user.role === 'writer' && blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const { title, content, coverImage, tags, category, status } = req.body;

        if (title) blog.title = title;
        if (content) blog.content = content;
        if (coverImage !== undefined) blog.coverImage = coverImage;
        if (tags) blog.tags = tags;
        if (category) blog.category = category;
        if (status) blog.status = status;

        await blog.save();
        await blog.populate('author', 'name avatar');

        logger.info(`Blog updated: "${blog.title}" by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Blog updated successfully',
            data: { blog }
        });
    } catch (error) {
        logger.error(`updateBlog error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// DELETE /api/blogs/:id — delete blog (own or admin)
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found.' });
        }

        // Writers can only delete their own blogs
        if (req.user.role === 'writer' && blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        await Blog.findByIdAndDelete(req.params.id);

        logger.info(`Blog deleted: "${blog.title}" by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        logger.error(`deleteBlog error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/blogs/my/posts — get current user's blogs (writer/admin)
exports.getMyBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            Blog.find({ author: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Blog.countDocuments({ author: req.user._id })
        ]);

        res.json({
            success: true,
            data: {
                blogs,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            }
        });
    } catch (error) {
        logger.error(`getMyBlogs error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
