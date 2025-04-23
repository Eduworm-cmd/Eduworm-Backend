const express = require('express');
const router = express.Router();
const levelController = require('../controllers/levelController');

router.post('/', levelController.createLevel);
router.get('/', levelController.getAllLevels);
router.get('/:id', levelController.getLevelById);
router.put('/:id', levelController.updateLevel);
router.delete('/:id', levelController.deleteLevel);

module.exports = router;
