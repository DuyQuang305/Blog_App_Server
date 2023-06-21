const users = require('../Model/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require("axios");
require('dotenv').config();

class LoginController {
    // [Post] / api/auth/Login
    async checkUser(req, res, next) {
        try {
            const { username, password } = req.body;
    
            // Tìm người dùng trong cơ sở dữ liệu
            const user = await users.findOne({ username });
    
            if (!user) {
                return res.json({ msg: "Incorrect username or password", status: false });
            }
    
            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
    
            if (!isMatch) {
                return res.json({ msg: "Incorrect username or password", status: false });
            } else if (!user.isVerified) {
                return res.json({ msg: "Please verify your email address before logging in", status: false });
            }
            
            const accessToken = jwt.sign({ userId: user._id, fullname: user.username, avt: user.avatarImage}, process.env.ACCESS_TOKEN_SECRET);
            // Tạo token và gửi về cho người dùng
            return res.status(201).json({ accessToken });
        } catch (err) {
            next(err)
        }
    }

    async loginGoogle(req,res, next) {
        const googleToken = req.body.access_token

        const headers = {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          };

        try {   
            const {data} = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, { headers })
            
            const user = await users.findOne({ email: data.email });

            if(user) {
                if (!user.authGoogleId) {
                    user.authGoogleId = data.authGoogleId;
                    await user.save();
                }

                const accessToken = jwt.sign({userId: user._id, fullname: user.username, avatar: user.avatarImage}, process.env.ACCESS_TOKEN_SECRET);
                return res.status(201).json({accessToken});
            }

            const newUser = new users({
                                    username: data.name,
                                    authType: 'google',
                                    authGoogleId: data.sub,
                                    email: data.email,
                                    avatarImage: data.picture,
                                    isVerified: true,
                                });
            
            newUser.save();

            const accessToken = jwt.sign({userId: newUser._id, fullname: newUser.username, avt: newUser.avatarImage}, process.env.ACCESS_TOKEN_SECRET)
            return res.status(201).json({ accessToken});

        } catch(error) {
            return res.status(500).json({msg: 'server '})
        }
    }
}

module.exports = new LoginController;