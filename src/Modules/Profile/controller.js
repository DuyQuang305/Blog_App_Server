const User = require("../../Models/Users");

class Controller {
  async me(req, res, next) {
    try {
      const { _id } = req.user;

      if (!_id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await User.findOne({ _id: _id }).lean();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ message: "Get profile success", user });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async edit(req, res, next) {
    try {
      const { username, address, interest } = req.body;
      const { _id } = req.user;

      if (!_id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findOne({ _id: _id });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.username = username;
      user.address = address;
      user.interest = interest;

      if (req.file) {
        user.avatarImage = req.file.path;
      }
      try {
        await user.save();
      } catch {
        return res.status(500).json({ msg: "update failed" });
      }
      return res.status(201).json({ msg: "Edit profile successfully."});
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new Controller();
