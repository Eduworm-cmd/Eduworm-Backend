const express = require("express");
const authRouter = express.Router();
const authController = require("../../controllers/authController/authController");

authRouter.post("/userLogin", authController.userLogin);
authRouter.post("/userLogout", authController.userLogout);
authRouter.post("/refreshAccessToken", authController.refreshAccessToken);

module.exports = authRouter;