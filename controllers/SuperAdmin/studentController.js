const mongoose = require("mongoose");
const authSchoolBranchModel = require("../../models/SuperAdmin/authSchoolBranchModel");
const classModel = require("../../models/SuperAdmin/classModel");
const schoolModel = require("../../models/SuperAdmin/schoolModel");
const studentModal = require("../../models/SuperAdmin/studentModal");

class StudentController {


    fixTotalStudentsArray = async (branchId) => {
        try {
            const branch = await authSchoolBranchModel.findById(branchId);
            if (branch) {
                if (!Array.isArray(branch.total_Students)) {
                    await authSchoolBranchModel.findByIdAndUpdate(branchId, {
                        $set: { total_Students: [] }
                    });
                }
            }
        } catch (error) {
            console.error("Error fixing total_Students field:", error);
        }
    };

    createStudent = async (req, res) => {
        try {
            const { schoolId, branchId, classId } = req.body;

            // Validation for required fields
            if (!schoolId || !branchId || !classId) {
                return res.status(400).json({ message: "schoolId, branchId, classId are required!" });
            }

            // Fetch School details
            const school = await schoolModel.findById(schoolId);
            if (!school) {
                return res.status(400).json({ success: false, message: "Invalid school ID" });
            }

            // Fetch Branch details
            const branch = await authSchoolBranchModel.findById(branchId);
            if (!branch) {
                return res.status(400).json({ success: false, message: "Invalid branch ID" });
            }

            // Fetch Class details
            const classData = await classModel.findById(classId);
            if (!classData) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }

            // Ensure total_Students is an array before proceeding
            await this.fixTotalStudentsArray(branchId); // Use 'this' here

            // Create new Student
            const student = await studentModal.create({
                ...req.body, // Rest of the student data from request body
                school: schoolId,
                schoolBranch: branchId,
                class: classId,
                isActive: true // Ensure the student is active by default
            });

            // Update Branch: Add student ID to total_Students array
            await authSchoolBranchModel.findByIdAndUpdate(branchId, {
                $push: { total_Students: student._id }
            });

            // Update Class: Add student ID to class's students array
            await classModel.findByIdAndUpdate(classId, {
                $push: { students: student._id }
            });

            res.status(201).json({ success: true, message: "Student Added Successfully", student });

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
                success: true,
                message: "Student updated successfully",
                student: updatedStudent
            });
        } catch (error) {
            console.error("Error updating student:", error);
            res.status(500).json({ message: "Failed to update student", error });
        }
    };

    getStudentById =async (req, res) => {
        try {
            const studentId = req.params.studentId;
            const student = await studentModal.findById(studentId).populate({ path: "class", select: "className" }).populate({ path: "school", select: "schoolName" }).populate({ path: "schoolBranch", select: "name" });

            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.status(200).json({ message: "Student fetched successfully", student });
        } catch (error) {
            console.error("Error fetching student:", error);
            res.status(500).json({ message: "Failed to fetch student", error });
        }
    }


    DeleteStudentById = async (req, res) => {
        try {
            const { studentId } = req.params;

            // Step 1: Delete the student
            const student = await studentModal.findByIdAndDelete(studentId);

            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }

            // Step 2: Remove the student's ID from all SchoolAdmin.total_Students arrays
            await SchoolAdmin.updateMany(
                { total_Students: studentId },
                { $pull: { total_Students: studentId } }
            );

            res.status(200).json({ message: "Student deleted successfully and removed from SchoolAdmin records" });
        } catch (error) {
            console.error("Error deleting student:", error);
            res.status(500).json({ message: "Failed to delete student", error });
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