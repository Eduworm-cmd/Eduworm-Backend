const { default: mongoose } = require("mongoose");
const { Class } = require("../../../models/classSchema/classSchema");
const sendResponse = require("../../../utils/sendResponse");

class classController {

    // Create a new class
    async createClass(req, res) {
        try {
            const { className } = req.body;
    
            if (!className) {
                return sendResponse(res, 400, false, null, "ClassName is required.");
            }

            const alreadyClassName = Class.find(className);

            if (alreadyClassName) {
                return sendResponse(res, 400, false, null, "Class name already exists.");
            }
    
            const newClass = new Class({
                className,
            });
    
            await newClass.save();
            sendResponse(res, 201, true, newClass, "Class created successfully.");
        } catch (error) {
            sendResponse(res, 500, false, null, error.message);
        }
    }
    
    // Get all classes
    async getAllClasses(req, res) {
        try {
            const classes = await Class.find();
            sendResponse(res, 200, true, classes, "Classes fetched successfully.");
        } catch (error) {
            sendResponse(res, 500, false, null, error.message);
        }
    }

    // Get a single class by className
    async getSingleClass(req, res) {
        try {
            const { className } = req.params;
            
            if (!className) {
                return sendResponse(res, 400, false, null, "ClassName parameter is required.");
            }

            const classData = await Class.findOne({ className });

            if (!classData) {
                return sendResponse(res, 404, false, null, "Class not found.");
            }

            sendResponse(res, 200, true, classData, "Class fetched successfully.");
        } catch (error) {
            sendResponse(res, 500, false, null, error.message);
        }
    }
}

module.exports = new classController();
