const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branchController");
const roleMiddleware = require("../middleware/authMiddleware");

// Apply authMiddleware to all branch routes
router.post("/", roleMiddleware(["superadmin", "schooladmin"]), branchController.createBranch);
router.get("/", roleMiddleware(["superadmin", "schooladmin"]), branchController.getBranches);
router.put('/assign-schooladmin', roleMiddleware(["superadmin"]), branchController.assignSchoolAdminToBranch);
router.put("/:id", roleMiddleware(["superadmin", "schooladmin"]), branchController.updateBranch);
router.delete("/:id", roleMiddleware(["superadmin", "schooladmin"]), branchController.deleteBranch);
router.put('/toggle-status/:id', roleMiddleware(["superadmin", "schooladmin"]), branchController.toggleBranchStatus);

module.exports = router;
