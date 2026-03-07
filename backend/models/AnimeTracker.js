const mongoose = require('mongoose');

const animeTrackerSchema = new mongoose.Schema({
    userId: {
        type: String, // Can be a user ObjectId or a session ID for anonymous users
        required: true,
        index: true
    },
    animeId: {
        type: Number, // MAL ID from Jikan API
        required: true
    },
    title: {
        type: String,
        required: true
    },
    titleJapanese: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'],
        default: 'plan_to_watch'
    },
    currentEpisode: {
        type: Number,
        default: 0,
        min: 0
    },
    totalEpisodes: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    notes: {
        type: String,
        maxlength: 1000,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure one entry per anime per user
animeTrackerSchema.index({ userId: 1, animeId: 1 }, { unique: true });

module.exports = mongoose.model('AnimeTracker', animeTrackerSchema);
