const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const roleMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
// router.use(roleMiddleware(["superadmin", "schooladmin"]));

// Create a new student - now accepting base64 in request body
router.post('/', studentController.createStudent);

// Get all students with filtering and pagination
router.get('/', studentController.getAllStudents);

// Get a single student by ID
router.get('/:id', studentController.getStudent);

// Update an existing student - now accepting base64 in request body
router.put('/:id', studentController.updateStudent);

// Delete a student
router.delete('/:id', studentController.deleteStudent);

// Toggle student active status (activate/deactivate)
router.patch('/:id/status', studentController.toggleStudentStatus);

// Bulk activate/deactivate students - admin only
router.patch('/bulk-status', studentController.bulkToggleStatus);

// Get student statistics by branch
router.get('/stats/branch', studentController.getStudentStats);

module.exports = router;