const express = require('express');
const SubjectPageController = require('../../../controllers/SuperAdmin/BooksContent/SubjectPagesController');
const router = express.Router();




router.post('/create', SubjectPageController.createSubjectPages);
router.get('/:SubjectId', SubjectPageController.getSubjectPagesBySubjectId);
router.get('/allPages/:subjectId', SubjectPageController.getAllPagesBySubjectId);





module.exports = router;