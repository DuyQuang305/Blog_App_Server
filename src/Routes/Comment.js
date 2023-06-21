const express = require('express');
const router = express.Router();
const commentController = require('../Controllers/CommentController');
const authentication = require('../Middlewares/Auth');


router.get('/', commentController.showComment);

router.use(authentication.checkAuthentication);

router.post('/addComment', commentController.addComment);

router.put('/:id', commentController.editComment);

router.delete('/:id', commentController.deleteComment);


module.exports = router; 