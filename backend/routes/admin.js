const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All admin routes require admin role
router.use(auth, roleCheck('admin'));

router.get('/stats', adminController.getStats);
router.get('/blogs', adminController.getAllBlogs);
router.get('/writers', adminController.getWriters);
router.post('/writers', adminController.createWriter);
router.put('/writers/:id/assign', adminController.assignTopics);
router.put('/writers/:id/toggle', adminController.toggleWriter);
router.delete('/writers/:id', adminController.deleteWriter);

module.exports = router;
