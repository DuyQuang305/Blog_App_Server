const express = require("express");

const router = express.Router();

const controller = require("./controller");
const authentication = require("../../Middlewares/Auth");
const upload = require("../../Middlewares/upload");

router.use(authentication.checkAuthentication);

router.get("/", controller.me);
router.patch("/edit", upload.single("avatarImage"), controller.edit);

module.exports = router;
