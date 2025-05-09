const { default: mongoose } = require("mongoose");
const gradeModel = require("../../models/SuperAdmin/gradeModel");
const classModel = require("../../models/SuperAdmin/classModel");
const authSchoolBranchModel = require("../../models/SuperAdmin/authSchoolBranchModel");
const schoolModel = require("../../models/SuperAdmin/schoolModel");

// controllers/gradeController.js
// Create a new grade
// exports.createGrade = async (req, res) => {
//   try {
//     const { name, type, minAge, maxAge, school, level } = req.body;

//     const grade = new Grade({
//       name,
//       type,
//       minAge,
//       maxAge,
//       school,
//       level,
//       createdBy: req?.user?.id  // Current authenticated user
//     });

//     const savedGrade = await grade.save();

//     // Populate relevant fields for response
//     await savedGrade.populate([
//       { path: 'school', select: 'name' },
//       { path: 'level', select: 'name' },
//       { path: 'createdBy', select: 'name role' }
//     ]);

//     res.status(201).json({
//       success: true,
//       data: savedGrade
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get all grades
// exports.getAllGrades = async (req, res) => {
//   try {
//     let query = {};



//     const grades = await Grade.find()


//     res.status(200).json({
//       success: true,
//       count: grades.length,
//       data: grades
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get single grade
// exports.getGrade = async (req, res) => {
//   try {
//     const grade = await Grade.findById(req.params.id)


//     if (!grade) {
//       return res.status(404).json({
//         success: false,
//         message: 'Grade not found'
//       });
//     }

//     // Check if schooladmin has access to this grade
//     if (req.user.role === 'schooladmin' && grade.school._id.toString() !== req.user.schoolId.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to access this grade'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: grade
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Update grade
// exports.updateGrade = async (req, res) => {
//   try {
//     let grade = await Grade.findById(req.params.id);

//     if (!grade) {
//       return res.status(404).json({
//         success: false,
//         message: 'Grade not found'
//       });
//     }

//     // Check if schooladmin has access to this grade
//     console.log(req)
//     if (req?.user?.role === 'schooladmin' && grade.school.toString() !== req.user.schoolId.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to update this grade'
//       });
//     }

//     // If level is being updated, only superadmin can do this
//     if (req.body.level && req.user.role !== 'superadmin' && grade.level.toString() !== req.body.level) {
//       return res.status(403).json({
//         success: false,
//         message: 'Only superadmin can change the level of a grade'
//       });
//     }

//     // Update the grade and track who updated it
//     req.body.updatedBy = req.user.id;

//     grade = await Grade.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true
//       }
//     ).populate([
//       { path: 'school', select: 'name' },
//       { path: 'level', select: 'name' },
//       { path: 'createdBy', select: 'name role'},
//       { path: 'updatedBy', select: 'name role'}
//     ]);

//     res.status(200).json({
//       success: true,
//       data: grade
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Delete grade
// exports.deleteGrade = async (req, res) => {
//   try {
//     const grade = await Grade.findById(req.params.id);

//     if (!grade) {
//       return res.status(404).json({
//         success: false,
//         message: 'Grade not found'
//       });
//     }

//     // Check if schooladmin has access to this grade
//     if (req.user.role === 'schooladmin' && grade.school.toString() !== req.user.schoolId.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to delete this grade'
//       });
//     }

//     await grade.remove();

//     res.status(200).json({
//       success: true,
//       data: {}
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



class GradeController {

  createGrade = async (req, res) => {
    try {
      const { name, schoolId, branchId, classId, userId } = req.body;

      if (!name || !schoolId || !branchId || !classId || !userId) {
        return res.status(400).json({ message: "All fields are required!" });
      }

      if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: "School ID is invalid!" });
      }

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({ message: "Branch ID is invalid!" });
      }

      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Class ID is invalid!" });
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "User ID is invalid!" });
      }

      const school = await schoolModel.findById(schoolId);
      if (!school) {
        return res.status(404).json({ message: "School not found!" });
      }

      const branch = await authSchoolBranchModel.findById(branchId);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found!" });
      }

      const classInfo = await classModel.findById(classId);
      if (!classInfo) {
        return res.status(404).json({ message: "Class not found!" });
      }

      const newGrade = new gradeModel({
        name,
        school: schoolId,
        branch: branchId,
        class: classId,
        createdBy: userId,
        updatedBy: userId,
      });

      const savedGrade = await newGrade.save();

      await classModel.findByIdAndUpdate(classId, {
        $push: { grades: savedGrade._id },
      });

      return res.status(201).json(savedGrade);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };


  //Featch Grade By Class Id
  gradesByClassId = async (req, res) => {
    try {
      const { classId } = req.params;

      if (!classId) {
        return res.status(400).json({ message: "Class Id is required !" });
      }

      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: "Invalid class ID format!" });
      }

      const grades = await gradeModel.find({ class: classId }).select('_id name')

      if (grades.length === 0) {
        return res.status(404).json({ message: "No grades found for this class!" });
      }

      return res.status(200).json(grades);

    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }



  getAllGrades = async (req, res) => {
    try {
      const grades = await gradeModel.find()
        .populate("class", "name")
        .populate("school", "schoolName")
        .populate("branch", "displayName")
        .sort({ createdAt: -1 });
  
      if (!grades || grades.length === 0) {
        return res.status(404).json({ message: "No grades found" });
      }
  
      return res.status(200).json({
        message: "Grades fetched successfully",
        total: grades.length,
        data: grades,
      });
    } catch (error) {
      console.error("Error fetching grades:", error.message);
      res.status(500).json({ error: error.message });
    }
  };

}

module.exports = new GradeController();
