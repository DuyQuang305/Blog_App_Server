const { body, validationResult } = require('express-validator');

module.exports = {
    checkLogin: [
        body('username')
        .trim(),
        body('password')
        .trim()
        .isLength({min: 6})
            .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/)
            .withMessage('Password must contain at least one letter and one number')
    ],  

    checkRegister: [
        body('username')
        .trim()
        .not().isEmpty()
            .withMessage('username is required!'),
        
        body('email')
        .trim()
        .not().isEmpty()
            .withMessage('email is required!')
        .isEmail()
            .withMessage('Please provide a valid email address'),

        body('password')
        .trim()
        .not().isEmpty()
            .withMessage('password is required!')
        .isLength({min: 6})
            .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/)
            .withMessage('Password must contain at least one letter and one number')
    ], 
    
    checkSendMessage: [
        body('email')
        .trim()
        .not().isEmpty()
            .withMessage('email is required!')
        .isEmail()
            .withMessage('Please provide a valid email address'),
    ], 

    checkResetPassword: [
        body('password')
        .trim()
        .not().isEmpty()
            .withMessage('password is required!')
        .isLength({min: 6})
            .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/)
            .withMessage('Password must contain at least one letter and one number'),

        body('confirmPassword')
        .trim()
        .not().isEmpty()
            .withMessage('confirmPassword is required!')
        .isLength({min: 6})
            .withMessage('confirmPassword must be at least 6 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/)
            .withMessage('confirmPassword must contain at least one letter and one number')
        .custom((value, { req }) => {
            return value === req.body.password;
        })
    ], 

    validate: async (req,res, next) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
          return next();
        }

       return res.status(400).json({ 
        message: 'validate errors',
        payload: result.array({ onlyFirstError: true})
     });
    }
};