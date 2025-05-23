const express = require('express');
const SubjectPageController = require('../../controllers/SuperAdmin/SubjectPagesController');
const router = express.Router();




router.post('/create', SubjectPageController.createSubjectPages);





module.exports = router;