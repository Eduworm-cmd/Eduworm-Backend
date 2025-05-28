const express = require('express');

const router = express.Router();
const SubjectPageContentController = require('../../../controllers/SuperAdmin/BooksContent/SubjectPageContentController');

router.post('/create', SubjectPageContentController.createSubjectPageContent);
router.get('/:pageId', SubjectPageContentController.getContentByPageId)
router.get('/getcontent/:lessonId', SubjectPageContentController.getContentByLessonId);
router.put('/update/:contentId', SubjectPageContentController.updateSubjectPageContent);
router.get('/byId/:id', SubjectPageContentController.getContentById);
module.exports = router;