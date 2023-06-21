const express = require('express');
const router = express.Router();
const Validator = require('../Middlewares/Validator');
const loginController = require('../Controllers/LoginController');
// const middlewarePassport = require('../Middlewares/Passport')

router.post('/login', Validator.checkLogin, Validator.validate,  
                loginController.checkUser);

router.post('/google', loginController.loginGoogle) 

module.exports = router; 