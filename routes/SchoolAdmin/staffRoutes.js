const express = require('express');
const StaffController = require('../../controllers/SchoolAdmin/StaffController');
const roruter = express();

roruter.post('/create',StaffController.createStafff)
roruter.get('/:branchId',StaffController.getAllStaff);
roruter.get('/getStaff/:staffId',StaffController.getStaffById);
roruter.get('/updateStaff/:staffId',StaffController.updateStaff);




module.exports = roruter