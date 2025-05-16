const express = require('express');
const router = express.Router();
const unitController = require('../../../controllers/SchoolAdmin/ContentCreater/UnitController');



router.post('/createUnit', unitController.createUnit);



module.exports = router;