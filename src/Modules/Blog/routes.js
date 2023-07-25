const express = require("express");
const router = express.Router();

const controller = require("./controller");

const authentication = require("../../Middlewares/Auth");
const upload = require("../../Middlewares/upload");

router.get("/", controller.showBlog);
router.get("/search-by-title", controller.searchBlog);

router.use(authentication.checkAuthentication);

router.post("/store", upload.single("postImage"), controller.addBlog);
router.put("/edit/:id", controller.editBlog);
router.delete("/delete/:id", controller.deleteBlog);

module.exports = router;
