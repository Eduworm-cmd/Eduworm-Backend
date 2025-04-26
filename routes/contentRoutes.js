const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const roleMiddleware = require('../middleware/authMiddleware');

router.post('/', roleMiddleware(['superadmin']), contentController.createContent);
router.get('/', contentController.getAllContents);
router.get('/:id', roleMiddleware(['superadmin']), contentController.getContentById);
router.put('/:id', roleMiddleware(['superadmin']), contentController.updateContent);
router.delete('/:id', roleMiddleware(['superadmin']), contentController.deleteContent);
router.get('/grade/:gradeId', contentController.getContentByGrade);

module.exports = router;
