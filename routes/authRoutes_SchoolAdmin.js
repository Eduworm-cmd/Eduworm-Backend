const express = require("express");
const upload = require("../middleware/multermiddleware");

const {
  registerUser,
  verifyOtp,
  loginUser,
  createSchoolAdminBySuperAdmin,
  loginWithEmailPassword,
  getAllSchools,
  getFullSchools,
  getSchoolById,
} = require("../controllers/authController_SchoolAdmin");

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getAllSchools);
router.get("/all",getFullSchools);
router.post("/verify", verifyOtp);
router.post("/login", loginUser);
router.post("/create-by-superadmin",createSchoolAdminBySuperAdmin);
router.post("/login-email", loginWithEmailPassword); 
router.get("/:schoolId",getSchoolById);

module.exports = router;
