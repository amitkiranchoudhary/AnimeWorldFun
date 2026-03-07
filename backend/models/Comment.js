const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    visitorName: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 100
    },
    visitorEmail: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminReply: {
        type: String,
        default: ''
    },
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    repliedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
commentSchema.index({ blog: 1, status: 1 });
commentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
