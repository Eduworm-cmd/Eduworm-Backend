const express = require('express');
const router = express.Router();
const unitController = require('../../../controllers/SchoolAdmin/ContentCreater/UnitController');



router.post('/createUnit', unitController.createUnit);
router.get('/UnitByClass/:classId', unitController.GetVisibleUnitsByClassId);
router.get('/dropdown/:classId', unitController.unitByClassId);



module.exports = router;