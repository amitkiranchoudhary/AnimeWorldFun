const AnimeTracker = require('../models/AnimeTracker');
const logger = require('../utils/logger');

// GET /api/anime/search?q= — search anime via Jikan API
exports.searchAnime = async (req, res) => {
    try {
        const { q, page = 1 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters.'
            });
        }

        // Use dynamic import for node-fetch (or built-in fetch in Node 18+)
        const response = await fetch(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&page=${page}&limit=12&sfw=true`
        );

        if (!response.ok) {
            throw new Error(`Jikan API returned ${response.status}`);
        }

        const data = await response.json();

        const anime = data.data.map(a => ({
            malId: a.mal_id,
            title: a.title,
            titleJapanese: a.title_japanese || '',
            imageUrl: a.images?.jpg?.image_url || '',
            episodes: a.episodes || 0,
            status: a.status || '',
            score: a.score || 0,
            synopsis: a.synopsis || '',
            type: a.type || '',
            year: a.year || null,
            genres: (a.genres || []).map(g => g.name)
        }));

        res.json({
            success: true,
            data: {
                anime,
                pagination: data.pagination
            }
        });
    } catch (error) {
        logger.error(`searchAnime error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to search anime.' });
    }
};

// GET /api/anime/trending — get trending anime
exports.getTrendingAnime = async (req, res) => {
    try {
        const response = await fetch(
            'https://api.jikan.moe/v4/top/anime?filter=airing&limit=12&sfw=true'
        );

        if (!response.ok) {
            throw new Error(`Jikan API returned ${response.status}`);
        }

        const data = await response.json();

        const anime = data.data.map(a => ({
            malId: a.mal_id,
            title: a.title,
            titleJapanese: a.title_japanese || '',
            imageUrl: a.images?.jpg?.image_url || '',
            episodes: a.episodes || 0,
            status: a.status || '',
            score: a.score || 0,
            synopsis: a.synopsis || '',
            type: a.type || '',
            year: a.year || null,
            genres: (a.genres || []).map(g => g.name)
        }));

        res.json({ success: true, data: { anime } });
    } catch (error) {
        logger.error(`getTrendingAnime error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to fetch trending anime.' });
    }
};

// POST /api/anime/track — add anime to tracker
exports.addToTracker = async (req, res) => {
    try {
        const { animeId, title, titleJapanese, imageUrl, status, totalEpisodes } = req.body;
        const userId = req.query.sessionId || req.body.sessionId || 'anonymous';

        if (!animeId || !title) {
            return res.status(400).json({
                success: false,
                message: 'animeId and title are required.'
            });
        }

        // Check if already tracked
        const existing = await AnimeTracker.findOne({ userId, animeId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'This anime is already in your tracker.'
            });
        }

        const entry = await AnimeTracker.create({
            userId,
            animeId,
            title,
            titleJapanese: titleJapanese || '',
            imageUrl: imageUrl || '',
            status: status || 'plan_to_watch',
            totalEpisodes: totalEpisodes || 0
        });

        logger.info(`Anime tracked: "${title}" by user ${userId}`);

        res.status(201).json({
            success: true,
            message: 'Anime added to tracker',
            data: { entry }
        });
    } catch (error) {
        logger.error(`addToTracker error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/anime/tracker — get user's anime list
exports.getTrackerList = async (req, res) => {
    try {
        const userId = req.query.sessionId || 'anonymous';
        const { status } = req.query;

        let query = { userId };
        if (status) query.status = status;

        const entries = await AnimeTracker.find(query)
            .sort({ updatedAt: -1 })
            .lean();

        // Group by status
        const grouped = {
            watching: entries.filter(e => e.status === 'watching'),
            completed: entries.filter(e => e.status === 'completed'),
            plan_to_watch: entries.filter(e => e.status === 'plan_to_watch'),
            on_hold: entries.filter(e => e.status === 'on_hold'),
            dropped: entries.filter(e => e.status === 'dropped')
        };

        const stats = {
            total: entries.length,
            watching: grouped.watching.length,
            completed: grouped.completed.length,
            planToWatch: grouped.plan_to_watch.length,
            onHold: grouped.on_hold.length,
            dropped: grouped.dropped.length
        };

        res.json({
            success: true,
            data: { entries, grouped, stats }
        });
    } catch (error) {
        logger.error(`getTrackerList error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/anime/tracker/:id — update tracker entry
exports.updateTrackerEntry = async (req, res) => {
    try {
        const { status, currentEpisode, score, notes } = req.body;
        const updates = {};

        if (status) updates.status = status;
        if (currentEpisode !== undefined) updates.currentEpisode = currentEpisode;
        if (score !== undefined) updates.score = score;
        if (notes !== undefined) updates.notes = notes;

        const entry = await AnimeTracker.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Tracker entry not found.' });
        }

        logger.info(`Tracker updated: "${entry.title}" → ${entry.status} (Ep ${entry.currentEpisode}/${entry.totalEpisodes})`);

        res.json({
            success: true,
            message: 'Tracker updated',
            data: { entry }
        });
    } catch (error) {
        logger.error(`updateTrackerEntry error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// DELETE /api/anime/tracker/:id — remove from tracker
exports.removeFromTracker = async (req, res) => {
    try {
        const entry = await AnimeTracker.findByIdAndDelete(req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Tracker entry not found.' });
        }

        logger.info(`Anime removed from tracker: "${entry.title}"`);

        res.json({ success: true, message: 'Removed from tracker.' });
    } catch (error) {
        logger.error(`removeFromTracker error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
