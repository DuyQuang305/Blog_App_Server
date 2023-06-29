const express = require("express");
const router = express.Router();

const controller = require("./controller");

const authentication = require("../../Middlewares/Auth");
const upload = require("../../Middlewares/upload");

router.get("/", controller.showBlog);
router.get("/searchBlog", controller.searchBlog);

router.use(authentication.checkAuthentication);

router.post("/addBlog", upload.single("postImage"), controller.addBlog);
router.put("/editBlog/:id", controller.editBlog);
router.delete("/deleteBlog/:id", controller.deleteBlog);

module.exports = router;
