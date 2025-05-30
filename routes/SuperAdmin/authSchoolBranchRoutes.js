const express = require("express");
const {
  verifyOtp,
  loginUser,
  createSchoolBranch,
  loginWithEmailPassword,
  getBranchesById,
  getBranchesBySchoolId,
  getallBranches,
  searchBySchoolName,
  updateBranch,
  DeleteBranch,
  updateBranchContentSettings,
  getBranchContent
} = require("../../controllers/SuperAdmin/authSchoolBranchController");


const router = express.Router();

router.get("/search", searchBySchoolName); 

// ✅ Functional routes
router.post("/verify", verifyOtp);
router.post("/create_SchoolBranch", createSchoolBranch);
router.post("/login", loginUser);
router.post("/login-email", loginWithEmailPassword); 
router.get("/allBranches", getallBranches);
router.get("/branches/:branchId", getBranchesById);
router.put("/UpdateBranch/:branchId", updateBranch);
router.get("/:schoolId", getBranchesBySchoolId);
// Branch content routes
router.put('/branch/:branchId/content-settings', updateBranchContentSettings);
router.get('/branch/:branchId/content', getBranchContent);
router.delete("/DeleteBranch/:branchId", DeleteBranch);






module.exports = router;
