const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: [true, 'Blog content is required']
    },
    excerpt: {
        type: String,
        maxlength: 500
    },
    coverImage: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    views: {
        type: Number,
        default: 0
    },
    readTime: {
        type: Number, // in minutes
        default: 1
    }
}, {
    timestamps: true
});

// Auto-generate slug from title
blogSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36);
    }
    // Auto-generate excerpt from content
    if (this.isModified('content') && !this.excerpt) {
        this.excerpt = this.content
            .replace(/<[^>]*>/g, '') // strip HTML
            .substring(0, 300)
            .trim() + '...';
    }
    // Calculate read time (~200 words per minute)
    if (this.isModified('content')) {
        const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    next();
});

// Index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
