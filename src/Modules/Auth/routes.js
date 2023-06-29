const express = require("express");
const router = express.Router();
const Validator = require("../../Middlewares/Validator");
const controller = require("./controller");

router.post(
  "/login",
  Validator.checkLogin,
  Validator.validate,
  controller.login
);
router.post("/google", controller.loginGoogle);

router.post(
  "/register",
  Validator.checkRegister,
  Validator.validate,
  controller.register
);
router.get("/verify/:token", controller.verifyUser);

router.post(
  "/sendMessage",
  Validator.checkSendMessage,
  Validator.validate,
  controller.sendMessage
);

router.post(
  "/resetPassword/:token",
  Validator.checkResetPassword,
  Validator.validate,
  controller.ResetPassword
);

module.exports = router;
