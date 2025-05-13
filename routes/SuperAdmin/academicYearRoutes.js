const express = require('express');
const AcademicYearController = require('../../controllers/SuperAdmin/AcademicYearController');
const router = express.Router();


router.post('/createAcademicYear', AcademicYearController.createAcademicYear);
router.get('/dropdown', AcademicYearController.getAcademicYearDropdown);
router.get('/AllAcademicYear', AcademicYearController.getAllAcademicYear);
router.get('/:id', AcademicYearController.academicYearById);
router.put('/:id',AcademicYearController.updateAcademicYear);
router.delete('/:id',AcademicYearController.deleteAcademicYear);


module.exports = router;