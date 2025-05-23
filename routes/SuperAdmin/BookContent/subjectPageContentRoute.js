const express = require('express');

const router = express.Router();
const SubjectPageContentController = require('../../../controllers/SuperAdmin/BooksContent/SubjectPageContentController');

router.post('/create', SubjectPageContentController.createSubjectPageContent);

module.exports = router;