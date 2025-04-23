const express = require("express");
const upload = require("../middleware/multermiddleware");

const {
  registerUser,
  verifyOtp,
  loginUser,
  createSchoolAdminBySuperAdmin,
  loginWithEmailPassword,
  getAllSchools
} = require("../controllers/authController_SchoolAdmin");

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getAllSchools);
router.post("/verify", verifyOtp);
router.post("/login", loginUser);
router.post(
  "/create-by-superadmin",
  createSchoolAdminBySuperAdmin
);
router.post("/login-email", loginWithEmailPassword); // Email-password login

module.exports = router;
