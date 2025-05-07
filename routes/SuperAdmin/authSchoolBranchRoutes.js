const express = require("express");

const {
  verifyOtp,
  loginUser,
  loginBranch,
  createSchoolBranch,
  // createSchoolAdminBySuperAdmin,
  loginWithEmailPassword,
  getBranchesById,
  getBranchesBySchoolId,
  getallBranches
} = require("../../controllers/SuperAdmin/authSchoolBranchController");

const router = express.Router();




router.post("/verify", verifyOtp);
router.post("/login-branch", loginBranch);
router.post("/create_SchoolBranch", createSchoolBranch);
router.post("/login", loginUser);
router.get("/allBranches", getallBranches)
router.get("/:schoolId",getBranchesBySchoolId)
router.post("/login-email", loginWithEmailPassword); 
router.get("/branches/:branchId", getBranchesById);

module.exports = router;
