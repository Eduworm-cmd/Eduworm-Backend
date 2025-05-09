// routes/gradeRoutes.js
const express = require('express');
const router = express.Router();
const roleMiddleware = require('../../middleware/authMiddleware');
const gradeController = require('../../controllers/SuperAdmin/gradeController');


router.post('/create',gradeController.createGrade);
router.get('/allGrades',gradeController.getAllGrades);
router.get('/:classId',gradeController.gradesByClassId);
// // Get all grades - accessible by both superadmin and schooladmin
// router.get(
//   '/',roleMiddleware(['superadmin','schooladmin']),
//   gradeController.getAllGrades
// );

// // Get single grade - accessible by both superadmin and schooladmin
// router.get(
//   '/:id',roleMiddleware(['superadmin','schooladmin']),
//   gradeController.getGrade
// );

// // Update grade - accessible by both superadmin and schooladmin
// // (but level can only be changed by superadmin - logic in controller)
// router.put(
//   '/:id',roleMiddleware(['superadmin','schooladmin']),
//   gradeController.updateGrade
// );

// // Delete grade - accessible by both superadmin and schooladmin
// router.delete(
//   '/:id',roleMiddleware(['superadmin','schooladmin']),
//   gradeController.deleteGrade
// );

module.exports = router;