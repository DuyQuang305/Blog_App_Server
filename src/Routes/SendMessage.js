const express = require('express');

const router = express.Router();

const Validator = require('../Middlewares/Validator');

const SendMessageController = require('../Controllers/SendMessageController');

router.post('/', Validator.checkSendMessage, Validator.validate, 
                SendMessageController.sendMessage);

module.exports = router; 