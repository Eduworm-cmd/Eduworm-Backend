const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Get menu for a specific role - public route (or protected by your role middleware)
router.get('/:role', menuController.getMenuItems);

// Protected routes - only for superadmin
router.get('/items/all', menuController.getAllMenuItems);
router.post('/item', menuController.createMenuItem);
router.patch('/item/:id/toggle', menuController.toggleMenuItem);
router.put('/item/:id', menuController.updateMenuItem);

module.exports = router;