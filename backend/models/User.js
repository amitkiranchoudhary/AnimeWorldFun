const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false // Don't return password by default
    },
    role: {
        type: String,
        enum: ['admin', 'writer', 'visitor'],
        default: 'visitor'
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    assignedTopics: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual: loyalty badge based on account age
userSchema.virtual('loyaltyBadge').get(function () {
    if (!this.createdAt) return { tier: 'Genin', label: 'Beginner', emoji: '🌱' };
    const now = new Date();
    const created = new Date(this.createdAt);
    const daysDiff = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 365) return { tier: 'Hokage', label: 'Legendary', emoji: '🏆' };
    if (daysDiff >= 180) return { tier: 'Kage', label: 'Extreme Loyal', emoji: '👑' };
    if (daysDiff >= 90) return { tier: 'ANBU', label: 'Super Loyal', emoji: '🗡️' };
    if (daysDiff >= 30) return { tier: 'Jonin', label: 'Loyal', emoji: '🔥' };
    if (daysDiff >= 7) return { tier: 'Chunin', label: 'Intermediate', emoji: '⚡' };
    return { tier: 'Genin', label: 'Beginner', emoji: '🌱' };
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
