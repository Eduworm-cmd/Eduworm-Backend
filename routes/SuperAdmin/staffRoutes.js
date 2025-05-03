const express = require('express');
const router = express.Router();
const StaffController = require('../../controllers/SuperAdmin/StaffController');
const roleMiddleware = require('../../middleware/authMiddleware');
const { staffLogin } = require('../../controllers/Auth/authStaffController');

//Login Staff User
router.post('/staff_login',staffLogin);

router.post('/staffCreate',roleMiddleware(['superadmin']),StaffController.createStaff);
router.get('/all',roleMiddleware(['superadmin']),StaffController.GetAllStaff);
router.get('/staffId',roleMiddleware(['superadmin']),StaffController.getStaffById);


module.exports = router;