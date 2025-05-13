const { default: mongoose } = require('mongoose');
const classModel = require('../../models/SuperAdmin/classModel');
const authSchoolBranchModel = require('../../models/SuperAdmin/authSchoolBranchModel');
class ClassController {

  //Create Class
  createClass = async (req, res) => {
    try {
      const { className, type } = req.body;

      if (!className || !type) {
        return res.status(400).json({ message: "ClassName & Type are required!" });
      }

      const validTypes = ['Special', 'General'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type!" });
      }


      const alreadyExits = await classModel.findOne({ className });

      if (alreadyExits) {
        return res.status(400).json({ message: `${className} already exists.` });
      }

      const newClass = await classModel.create({
        className,
        type
      });

      return res.status(201).json({ message: "Class created successfully", newClass });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  };

  // Get All Class
  getAllClass = async (req, res) => {
    try {
      const allClasses = await classModel.find()
        .populate('grades', '_id name')

      if (!allClasses || allClasses.length === 0) {
        return res.status(404).json({ message: "No class data found!" });
      }

      return res.status(200).json({
        message: "Classes fetched successfully!",
        data: allClasses
      });

    } catch (error) {
      console.error("Error fetching classes:", error);
      return res.status(500).json({ message: "Server error: " + error.message });
    }
  };

  // Class For Dropdown
  getClassForDropdown = async (req, res) => {
    try {
      const allClasses = await classModel.find().select('_id className');

      if (!allClasses || allClasses.length === 0) {
        return res.status(404).json({ message: "Class Not Found !" })
      }

      return res.status(201).json({ data: allClasses });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }

  // Get All Class By Branch Id
  getCLassesByBranchId = async (req, res) => {
    try {
      const { branchId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
          message: "Invalid Branch Id format"
        });
      }

      const branch = await authSchoolBranchModel.findById(branchId).populate({
        path: "classes",
        select: "className _id type",
      });

      if (!branch) {
        return res.status(404).json({
          message: "Branch not found"
        });
      }

      console.log(branch);


      return res.status(200).json({
        message: "Classes fetched successfully",
        data: branch.classes
      });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  // Get Class By Id
  classById = async (req, res) => {
    try {
      const { classId } = req.params;

      if (!classId) {
        return res.status(400).json({ message: "ClassId is required!" });
      }

      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Invalid Class Id!" });
      }

      const existetClass = await classModel.findById(classId);

      if (!existetClass) {
        return res.status(404).json({ message: "Class Not Found!" });
      }

      return res.status(200).json({ data: existetClass });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  };

  // Update Class By Id
  updateClass = async (req, res) => {
    try {
      const { id } = req.params;
      const { className, type } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid class ID." });
      }

      if (!className && !type) {
        return res.status(400).json({ message: "At least one of className or type must be provided." });
      }

      const validTypes = ['Special', 'General'];
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type!" });
      }

      const classToUpdate = await classModel.findById(id);
      if (!classToUpdate) {
        return res.status(404).json({ message: "Class not found." });
      }

      if (className && className !== classToUpdate.className) {
        const existing = await classModel.findOne({ className });
        if (existing) {
          return res.status(400).json({ message: `${className} already exists.` });
        }
        classToUpdate.className = className;
      }

      if (type) {
        classToUpdate.type = type;
      }

      await classToUpdate.save();

      return res.status(200).json({ message: "Class updated successfully", updatedClass: classToUpdate });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }

  // Delete Class By Id
  deleteClass = async (req, res) => {
    try {
      const { classId } = req.params;

      if (!classId) {
        return res.status(400).json({ message: "ClassId is required!" });
      }

      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Class Id is invalid!" });
      }

      const deletedClass = await classModel.findByIdAndDelete(classId);

      if (!deletedClass) {
        return res.status(404).json({ message: "Class not found!" });
      }

      return res.status(200).json({ message: "Class deleted successfully!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

}


module.exports = new ClassController();