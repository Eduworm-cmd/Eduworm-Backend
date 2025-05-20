const express = require('express');
const BookPageController = require('../../controllers/SuperAdmin/bookPagesController');
const router = express.Router();




router.post('/create', BookPageController.createBookPages);





module.exports = router;