const express = require('express');
const {
    createStaff,
    getAllStaff,
    getStaff,
    updateStaff,
    deleteStaff,
    assignStaffToBranch,
    deactivateAccount
} = require('../controllers/authController_Teacher');

const router = express.Router();

// Protect middleware - assuming you have auth middleware
const roleMiddleware = require("../middleware/authMiddleware");

router
    .route('/')
    .get(getAllStaff)
    .post(createStaff);
router.put('/deactivate/:staffId', roleMiddleware(["superadmin", "admin"]), deactivateAccount);

router
    .route('/:id')
    .get(getStaff)
    .put(updateStaff)
    .delete(deleteStaff);

router
    .route('/assign')
    .post(roleMiddleware(["superadmin"]), assignStaffToBranch);

module.exports = router;

