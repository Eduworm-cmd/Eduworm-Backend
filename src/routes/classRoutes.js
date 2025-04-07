const express = require('express');
const classControllers = require('../controllers/classControllers/classControllers');
const ClassRouter = express.Router();


ClassRouter.post('/add',classControllers.createClass);
ClassRouter.get('/all',classControllers.getAllClasses);
ClassRouter.get('/:className',classControllers.getAllClasses);

module.exports = ClassRouter;

