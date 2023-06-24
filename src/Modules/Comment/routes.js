const express = require('express');
const router = express.Router();
const controller = require('./controller');
const authentication = require('../../Middlewares/Auth');



router.get('/', controller.showComment);

router.use(authentication.checkAuthentication);

router.post('/addComment', controller.addComment);

router.put('/:id', controller.editComment);

router.delete('/:id', controller.deleteComment);


module.exports = router; 