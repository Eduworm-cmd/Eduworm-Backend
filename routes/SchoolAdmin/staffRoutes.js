const express = require('express');
const StaffController = require('../../controllers/SchoolAdmin/StaffController');
const router = express();

router.post('/create',StaffController.createStafff)
router.get('/:branchId',StaffController.getAllStaff);
router.get('/getStaff/:staffId',StaffController.getStaffById);
router.put('/updateStaff/:staffId',StaffController.updateStaff);
router.delete('/delete/:staffId', StaffController.delteStaffById);



module.exports = router