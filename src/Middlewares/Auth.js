const jwt = require('jsonwebtoken')

class Auth {
    async checkAuthentication(req,res, next) {
        let accessToken = req.headers.authorization;

        if (!accessToken) {
            return res.status(401).json({
                message: 'Unauthorization',
            })
        }
       try {

        accessToken = accessToken.split(' ')[1];

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        req.user = { _id: decoded.userId };

        next();
        
       } catch (error) {
        return res.status(401).json({ message: 'Unauthorization'});
       }
    }
}

module.exports = new Auth;