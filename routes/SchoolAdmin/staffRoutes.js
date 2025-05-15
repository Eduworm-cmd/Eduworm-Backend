const express = require('express');
const StaffController = require('../../controllers/SchoolAdmin/StaffController');
const roruter = express();

roruter.post('/create',StaffController.createStafff)






module.exports = roruter