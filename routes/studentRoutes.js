const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const roleMiddleware = require('../middleware/authMiddleware');

// Create a new student - roleMiddleware applied for superadmin and schooladmin
router.post(
    '/createStudent',
    roleMiddleware(["superadmin", "schooladmin"]),  // Role middleware applied here
    studentController.createStudent
);

// Test role - Example route to check if middleware is working
router.get(
    "/test-role",
    roleMiddleware(["superadmin", "schooladmin"]),
    (req, res) => {
        // Checking the role of the user
        if (req.user.role === "superadmin") {
            res.json({ message: "You are a Superadmin!" });
        } else if (req.user.role === "schooladmin") {
            res.json({ message: "You are a Schooladmin!" });
        } else {
            res.json({ message: "Unknown role" });
        }
    }
);

// Other routes for students
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.patch('/:id/status', studentController.toggleStudentStatus);
router.patch('/bulk-status', studentController.bulkToggleStatus);
router.get('/stats/branch', studentController.getStudentStats);

module.exports = router;
