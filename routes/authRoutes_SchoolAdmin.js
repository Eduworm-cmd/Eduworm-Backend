const express = require("express");
const {
  registerUser,
  verifyOtp,
  loginUser,
  createSchoolAdminBySuperAdmin,
  loginWithEmailPassword
} = require("../controllers/authController_SchoolAdmin");
const roleMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyOtp);
router.post("/login", loginUser);
router.post("/create-by-superadmin", roleMiddleware(["superadmin"]), createSchoolAdminBySuperAdmin);
router.post("/login-email", loginWithEmailPassword); // Email-password login

module.exports = router;
