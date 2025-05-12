const mongoose = require("mongoose");
const authSchoolBranchModel = require("../../models/SuperAdmin/authSchoolBranchModel");
const classModel = require("../../models/SuperAdmin/classModel");
const schoolModel = require("../../models/SuperAdmin/schoolModel");
const studentModal = require("../../models/SuperAdmin/studentModal");

class StudentController {
     createStudent = async (req, res) => {
        try {
            const { schoolId, branchId, classId } = req.body;

            if (!schoolId || !branchId || !classId) {
                return res.status(400).json({ message: "schoolId, branchId, classId are required!" });
            }

            // Find School
            const school = await schoolModel.findById(schoolId);
            if (!school) {
                return res.status(400).json({ success: false, message: "Invalid school ID" });
            }

            // Find Branch
            const branch = await authSchoolBranchModel.findById(branchId);
            if (!branch) {
                return res.status(400).json({ success: false, message: "Invalid branch ID" });
            }

            // Find Class
            const classData = await classModel.findById(classId);
            if (!classData) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }

            // Create Student
            const student = await studentModal.create({
                ...req.body,
                school: schoolId,
                schoolBranch: branchId,
                class: classId,
                isActive: true
            });

            // Update authSchoolBranchModel: Add student ID to total_Students array
            await authSchoolBranchModel.findByIdAndUpdate(branchId, {
                $push: { total_Students: student._id }  // Adding ObjectId to total_Students
            });

            // Update classModel: Add student ID to students array
            await classModel.findByIdAndUpdate(classId, {
                $push: { students: student._id }
            });

            res.status(201).json({ message: "Student Added Successfully", student });

        } catch (error) {
            console.error("Error creating student:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    };



    getAllStudent = async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;

            const allStudent = await studentModal
                .find()
                .sort({ createdAt: -1 })
                .skip(Number(skip))
                .limit(Number(limit))
                .populate({ path: "class", select: "className" })
                .populate({ path: "school", select: "schoolName" })
                .populate({ path: "schoolBranch", select: "name" });

            if (!allStudent || allStudent.length === 0) {
                return res.status(404).json({ message: "No Student Found!" });
            }

            const totalStudentCount = await studentModal.countDocuments();

            return res.status(200).json({
                success: true,
                message: "Student data fetched successfully",
                page: Number(page),
                limit: Number(limit),
                totalStudentCount,
                totalPage: Math.ceil(totalStudentCount / limit),
                data: allStudent,
            });
        } catch (error) {
            console.error("Error fetching students:", error);
            return res.status(500).json({ message: error.message });
        }
    };

    updateStudent = async (req, res) => {
        try {
            const studentId = req.params.studentId; 
            const updateData = req.body;


            console.log(studentId, updateData);

            const updatedStudent = await studentModal.findByIdAndUpdate(studentId, updateData, {
                new: true,
                runValidators: true
            });

            if (!updatedStudent) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.status(200).json({
                message: "Student updated successfully",
                student: updatedStudent
            });
        } catch (error) {
            console.error("Error updating student:", error);
            res.status(500).json({ message: "Failed to update student", error });
        }
    };



    getAllStudentByBrachId = async (req, res) => {
        try {
            const { branchId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            if (!branchId) {
                return res.status(400).json({ message: "Branch Id is required!" });
            }

            if (!mongoose.Types.ObjectId.isValid(branchId)) {
                return res.status(400).json({ message: "Invalid Branch Id" });
            }

            const allStudents = await studentModal
                .find({ schoolBranch: branchId })
                .sort({ createdAt: -1 }) // fix typo 'createAt'
                .skip(skip)
                .limit(limit)
                .populate('class','className')
                .populate('schoolBranch', 'name')

            const studentCount = await studentModal.countDocuments({ schoolBranch: branchId });

            if (!allStudents || allStudents.length === 0) {
                return res.status(404).json({ message: "No students found!" });
            }

            res.status(200).json({
                message: "Student data fetched successfully",
                page,
                limit,
                studentCount,
                totalPage: Math.ceil(studentCount / limit),
                data: allStudents,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    };


}

module.exports = new StudentController();