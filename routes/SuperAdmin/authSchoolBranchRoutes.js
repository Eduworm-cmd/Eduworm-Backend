const express = require("express");

const {
  verifyOtp,
  loginUser,
  loginBranch,
  createSchoolBranch,
  // createSchoolAdminBySuperAdmin,
  loginWithEmailPassword,
  getBranchesBySchoolId
} = require("../../controllers/SuperAdmin/authSchoolBranchController");

const router = express.Router();




router.post("/verify", verifyOtp);
router.post("/login-branch", loginBranch);
router.post("/create_SchoolBranch", createSchoolBranch);
router.post("/login", loginUser);
router.get("/:schoolId",getBranchesBySchoolId)
// router.post("/create-by-superadmin",createSchoolAdminBySuperAdmin);
router.post("/login-email", loginWithEmailPassword); 


module.exports = router;
