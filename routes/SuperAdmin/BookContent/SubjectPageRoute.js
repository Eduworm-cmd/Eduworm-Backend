const express = require('express');
const SubjectPageController = require('../../../controllers/SuperAdmin/BooksContent/SubjectPagesController');
const router = express.Router();




router.post('/create', SubjectPageController.createSubjectPages);





module.exports = router;