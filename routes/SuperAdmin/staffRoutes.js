const express = require('express');
const router = express.Router();
const StaffController = require('../../controllers/SuperAdmin/StaffController');

router.post('/staffCreate',StaffController.createStaff)
router.get('/all',StaffController.GetAllStaff)


module.exports = router;