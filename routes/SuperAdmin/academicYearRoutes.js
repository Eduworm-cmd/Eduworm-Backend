const express = require('express');
const AcademicYearController = require('../../controllers/SuperAdmin/AcademicYearController');
const router = express.Router();


router.post('/createAcademicYear', AcademicYearController.createAcademicYear);
router.get('/academicYear', AcademicYearController.getAcademicYearDropdown);
router.get('/AllAcademicYear', AcademicYearController.getAllAcademicYear);

module.exports = router;