const express = require('express');
const router = express.Router();
const animeTrackerController = require('../controllers/animeTrackerController');

// All public (session-based tracking)
router.get('/search', animeTrackerController.searchAnime);
router.get('/trending', animeTrackerController.getTrendingAnime);
router.post('/track', animeTrackerController.addToTracker);
router.get('/tracker', animeTrackerController.getTrackerList);
router.put('/tracker/:id', animeTrackerController.updateTrackerEntry);
router.delete('/tracker/:id', animeTrackerController.removeFromTracker);

module.exports = router;
