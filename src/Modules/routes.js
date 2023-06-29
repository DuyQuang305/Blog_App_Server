const Auth = require("./Auth/routes");
const Blog = require("./Blog/routes");
const Comment = require("./Comment/routes");
const Profile = require("./Profile/routes");
require("dotenv").config();

function router(app) {
  app.use("/auth", Auth);
  app.use("/blog", Blog);
  app.use("/comment", Comment);
  app.use("/profile", Profile);
}

module.exports = router;
