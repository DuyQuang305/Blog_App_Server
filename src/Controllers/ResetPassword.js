const users = require('../Model/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class ResetPasswordController {
    async ResetPassword(req,res,next) {
        const {password} = req.body;
        const token = req.params.token;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const userId = decoded.userId;

            const user = await users.findById({_id: userId})

            if (!user) {
                return res.status(404).json({message: 'User does not exist in the system'})
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user.password = hashedPassword;

            await user.save();

            return res.status(200).json({ message: 'Password reset successfully' });
        } catch(error){
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
}

module.exports = new ResetPasswordController();