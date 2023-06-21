const User = require('../Model/Users')

class Profile {
    async me(req, res) {
        try {
            const {_id} = req.user;
            
            if (!_id) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const user = await User.findOne({ _id: _id }).lean();
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json({ message: 'Get profile success', user });
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new Profile();