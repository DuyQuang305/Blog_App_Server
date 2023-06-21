const express = require('express');
const router = express.Router();
const blogController = require('../Controllers/BlogController');
const authentication = require('../Middlewares/Auth');


router.get('/', blogController.showBlog);
router.get('/searchBlog',  blogController.searchBlog);

router.use(authentication.checkAuthentication);

router.post('/addBlog', blogController.addBlog);
router.put('/editBlog/:id',blogController.editBlog);
router.delete('/deleteBlog/:id',  blogController.deleteBlog);

module.exports = router; 