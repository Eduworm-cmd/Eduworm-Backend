const express = require('express');
const studentController = require('../../controllers/SuperAdmin/studentController');
const router = express();

router.post('/create',studentController.createStudent);





module.exports = router;