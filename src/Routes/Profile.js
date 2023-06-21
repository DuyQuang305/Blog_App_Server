const express = require('express');

const router = express.Router();

const controller = require('../Controllers/ProfileController');
const authentication = require('../Middlewares/Auth');

router.get('/',authentication.checkAuthentication,controller.me);

module.exports = router; 