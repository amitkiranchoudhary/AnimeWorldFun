const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.post('/', commentController.submitComment);
router.get('/blog/:blogId', commentController.getBlogComments);

// Protected routes (admin/writer can moderate)
router.get('/pending', auth, roleCheck('admin', 'writer'), commentController.getPendingComments);
router.get('/all', auth, roleCheck('admin'), commentController.getAllComments);
router.put('/:id/approve', auth, roleCheck('admin'), commentController.approveComment);
router.put('/:id/reject', auth, roleCheck('admin'), commentController.rejectComment);
router.put('/:id/reply', auth, roleCheck('admin', 'writer'), commentController.replyToComment);
router.delete('/:id', auth, roleCheck('admin'), commentController.deleteComment);

module.exports = router;
