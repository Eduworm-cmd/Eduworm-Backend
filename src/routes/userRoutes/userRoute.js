const userRouter = require("express").Router();
const userControllers = require("../../controllers/userControllers/userControllers");
const { authenticateToken } = require("../../middlewares/validateJWTToken");

userRouter.post("/register", userControllers.register);
userRouter.get("/getUserData", authenticateToken ,userControllers.getUserData);

module.exports = userRouter;