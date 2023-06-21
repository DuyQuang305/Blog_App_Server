const RegisterRouter = require('./Register');
const LoginRouter = require('./Login');
const SendMessageRouter  = require('./SendMessage');
const ResetPasswordRouter  = require('./ResetPassword');
const BlogRouter  = require('./Blog');
const CommentRouter  = require('./Comment');
require('dotenv').config();

const auth = require("../Middlewares/Auth");

const profileRouter  = require('./Profile');

function router(app) {

    app.use('/register', RegisterRouter);
    app.use('/auth', LoginRouter);
    app.use('/sendMessage', SendMessageRouter);
    app.use('/resetPassword', ResetPasswordRouter);
    app.use('/blog',BlogRouter);
    app.use('/comment',CommentRouter);

    app.use('/api/profile', auth.checkAuthentication, profileRouter)

}

module.exports = router;