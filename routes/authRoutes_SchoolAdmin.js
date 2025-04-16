const express = require("express");
const {
  registerUser,
  verifyOtp,
  loginUser,
} = require("../controllers/authController_SchoolAdmin");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyOtp);
router.post("/login", loginUser);

module.exports = router;
