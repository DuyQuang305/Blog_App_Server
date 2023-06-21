const express = require('express');

const router = express.Router();

const Validator = require('../Middlewares/Validator');

const registerController = require('../Controllers/RegisterController');

router.post('/addUser',Validator.checkRegister, Validator.validate, 
                        registerController.createUser);
router.get('/verify/:token', registerController.verifyUser);


module.exports = router; 