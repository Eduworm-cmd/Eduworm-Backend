const express = require('express');
const LessonController = require('../../../controllers/SchoolAdmin/ContentCreater/LessonController');
const router = express.Router();



router.post('/createLesson', LessonController.LessonCreate);
router.get('/getLessonsByDay/:dayId', LessonController.GetLessonsByDay);
router.get('/getLessonsAll', LessonController.getLessonsAll);
router.get('/getLessonsBydaysrange', LessonController.GetLessonsByDaysRange);

module.exports = router;