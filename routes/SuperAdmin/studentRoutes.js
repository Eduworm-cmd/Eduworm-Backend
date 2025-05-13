const express = require('express');
const studentController = require('../../controllers/SuperAdmin/studentController');
const router = express();

router.post('/create',studentController.createStudent);
router.get('/all',studentController.getAllStudent);
router.get('/branch/:branchId',studentController.getAllStudentByBrachId);
router.put('/:studentId',studentController.updateStudent);
router.get('/ById/:studentId',studentController.getStudentById);
router.delete("/:studentId",studentController.DeleteStudentById);





module.exports = router;