const express = require('express');

const router = express.Router();

const Validator = require('../Middlewares/Validator');

const ResetPasswordController = require('../Controllers/ResetPassword');

router.post('/:token', Validator.checkResetPassword, Validator.validate,
                        ResetPasswordController.ResetPassword);

module.exports = router; 