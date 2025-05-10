const express = require("express");
const {
  verifyOtp,
  loginUser,
  loginBranch,
  createSchoolBranch,
  loginWithEmailPassword,
  getBranchesById,
  getBranchesBySchoolId,
  getallBranches,
  searchBySchoolName
} = require("../../controllers/SuperAdmin/authSchoolBranchController");

const router = express.Router();

router.get("/search", searchBySchoolName); 

// ✅ Functional routes
router.post("/verify", verifyOtp);
router.post("/login-branch", loginBranch);
router.post("/create_SchoolBranch", createSchoolBranch);
router.post("/login", loginUser);
router.post("/login-email", loginWithEmailPassword); 
router.get("/allBranches", getallBranches);

router.get("/:schoolId", getBranchesBySchoolId);

module.exports = router;
