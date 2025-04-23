const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branchController");
const roleMiddleware = require("../middleware/authMiddleware");

// Apply authMiddleware to all branch routes
router.post("/", branchController.createBranch);
router.get("/", branchController.getBranches);
router.get("/forschool", branchController.getBranchesforschool);
router.get('/branches', branchController.getBranches);
router.put('/assign-schooladmin', branchController.assignSchoolAdminToBranch);
router.put("/:id", branchController.updateBranch);
router.delete("/:id", branchController.deleteBranch);
router.put('/toggle-status/:id', branchController.toggleBranchStatus);

module.exports = router;
