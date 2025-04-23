// routes/gradeRoutes.js
const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const roleMiddleware = require('../middleware/authMiddleware');

// Create grade - accessible by both superadmin and schooladmin
router.post(
  '/',
  gradeController.createGrade
);

// Get all grades - accessible by both superadmin and schooladmin
router.get(
  '/',
  gradeController.getAllGrades
);

// Get single grade - accessible by both superadmin and schooladmin
router.get(
  '/:id',
  gradeController.getGrade
);

// Update grade - accessible by both superadmin and schooladmin
// (but level can only be changed by superadmin - logic in controller)
router.put(
  '/:id',
  gradeController.updateGrade
);

// Delete grade - accessible by both superadmin and schooladmin
router.delete(
  '/:id',
  gradeController.deleteGrade
);

module.exports = router;