const express = require('express');
const SchoolController = require('../../controllers/SuperAdmin/SchoolController');
const router = express.Router();


router.post('/create', SchoolController.createSchool);
router.get('/dropdown',SchoolController.getSchoolsForDropdown);
router.get('/all', SchoolController.getAllSchool);
router.get('/:schoolId',SchoolController.getSchoolById);


module.exports = router;