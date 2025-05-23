const express = require('express');
const SubjectController = require('../../../controllers/SuperAdmin/BooksContent/SubjectController');
const router = express.Router();

router.post('/create', SubjectController.createSubject);
router.get('/:classId', SubjectController.getSubjectsByClassId);

module.exports = router;