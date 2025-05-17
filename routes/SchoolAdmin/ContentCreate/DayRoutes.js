const express = require('express');
const DayController = require('../../../controllers/SchoolAdmin/ContentCreater/DayController');
const router = express.Router();


router.get('/getDayByUnitId/:unitId', DayController.getDayByUnitId);



module.exports = router;