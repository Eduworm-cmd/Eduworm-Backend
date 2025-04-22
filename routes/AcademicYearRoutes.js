const express = require("express");
const router = express.Router();
const academicYearController = require("../controllers/AcademicYearController");
const roleMiddleware = require("../middleware/authMiddleware");

// Apply authentication to all routes

// Main routes
router.route("/")
  .get(academicYearController.getAllAcademicYears)
  .post(academicYearController.createAcademicYear);

// Single academic year routes
router.route("/:id")
  .get(academicYearController.getAcademicYear)
  .patch(academicYearController.updateAcademicYear)
  .delete(academicYearController.deleteAcademicYear);

// Toggle status route
router.patch("/:id/toggle-status", academicYearController.toggleStatus);

module.exports = router;