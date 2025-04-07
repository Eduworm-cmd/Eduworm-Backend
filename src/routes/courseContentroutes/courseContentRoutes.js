
const express = require("express");
const courseContentRouter = express.Router();
const coursecontentController = require("../../controllers/courseContentControllers/courseContentControllers");

courseContentRouter.post("/createCourseContent", coursecontentController.createCourseContent);
courseContentRouter.post("/uploadCourse_data", coursecontentController.uploadCourse_data);


module.exports = courseContentRouter;