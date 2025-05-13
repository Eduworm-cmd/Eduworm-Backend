const express = require('express');
const router = express.Router();
const StaffController = require('../../controllers/SuperAdmin/StaffController');
const roleMiddleware = require('../../middleware/authMiddleware');
const { staffLogin } = require('../../controllers/Auth/authStaffController');

//Login Staff User
router.post('/staff_login',staffLogin);

router.post('/staffCreate',StaffController.createStaff);
router.get('/all',StaffController.GetAllStaff);
router.get('/:staffId',StaffController.getStaffById);
router.put('/:id', StaffController.updateStaff);
router.delete('/:id', StaffController.deleteStaff);

module.exports = router;