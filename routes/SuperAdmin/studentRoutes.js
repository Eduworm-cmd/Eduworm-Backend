const express = require('express');
const studentController = require('../../controllers/SuperAdmin/studentController');
const router = express();

router.post('/create',studentController.createStudent);
router.get('/all',studentController.getAllStudent);
router.get('/branch/:branchId',studentController.getAllStudentByBrachId);
router.put('/:id',studentController.updateStudent);





module.exports = router;