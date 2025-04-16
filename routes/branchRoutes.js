const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branchController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply authMiddleware to all branch routes
router.post("/", authMiddleware, branchController.createBranch);
router.get("/", authMiddleware, branchController.getBranches);
router.put("/:id", authMiddleware, branchController.updateBranch);
router.delete("/:id", authMiddleware, branchController.deleteBranch);
router.put('/toggle-status/:id', branchController.toggleBranchStatus);

module.exports = router;
