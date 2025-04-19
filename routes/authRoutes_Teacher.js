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
    .get(roleMiddleware(["superadmin", "schooladmin"]), getAllStaff)
    .post(roleMiddleware(["superadmin", "schooladmin"]), createStaff);
router.put('/deactivate/:staffId', roleMiddleware(["superadmin", "admin"]), deactivateAccount);

router
    .route('/:id')
    .get(roleMiddleware(["superadmin", "schooladmin"]), getStaff)
    .put(roleMiddleware(["superadmin", "schooladmin"]), updateStaff)
    .delete(roleMiddleware(["superadmin", "schooladmin"]), deleteStaff);

router
    .route('/assign')
    .post(roleMiddleware(["superadmin"]), assignStaffToBranch);

module.exports = router;

