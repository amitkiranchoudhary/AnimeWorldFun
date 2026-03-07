const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Protected routes (must come BEFORE /:slug wildcard)
router.get('/my/posts', auth, roleCheck('writer', 'admin'), blogController.getMyBlogs);
router.get('/id/:id', auth, roleCheck('writer', 'admin'), blogController.getBlogById);
router.post('/', auth, roleCheck('writer', 'admin'), blogController.createBlog);
router.put('/:id', auth, roleCheck('writer', 'admin'), blogController.updateBlog);
router.delete('/:id', auth, roleCheck('writer', 'admin'), blogController.deleteBlog);

// Public routes (wildcard /:slug must be last)
router.get('/', blogController.getBlogs);
router.get('/:slug', blogController.getBlogBySlug);

module.exports = router;
