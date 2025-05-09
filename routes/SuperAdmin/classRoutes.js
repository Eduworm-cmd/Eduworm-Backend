const express = require('express');
const classController = require('../../controllers/SuperAdmin/classController');
const router = express.Router();





router.post('/create', classController.createClass);
router.get('/all', classController.getAllClass);
router.get('/dropdown', classController.getClassForDropdown);


// router.put('/:id', classController.updateClass);


// router.delete('/:id', classController.deleteClass);


// router.patch('/:id/toggle-status', classController.toggleClassStatus);

module.exports = router;