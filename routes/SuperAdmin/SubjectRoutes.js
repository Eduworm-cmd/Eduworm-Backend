const express = require('express');
const SubjectController = require('../../controllers/SuperAdmin/SubjectController');
const router = express.Router();

router.post('/create', SubjectController.createSubject);

module.exports = router;