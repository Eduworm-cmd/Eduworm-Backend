const authSchoolBranchModel = require("../../models/SuperAdmin/authSchoolBranchModel");
const classModel = require("../../models/SuperAdmin/classModel");
const schoolModel = require("../../models/SuperAdmin/schoolModel");
const studentModal = require("../../models/SuperAdmin/studentModal");

class StudentController {
    createStudent = async (req, res) => {
        try {
            const { schoolId, branchId, classId } = req.body;

            if (!schoolId || !branchId || !classId) {
                return res.status(400).json({ message: "schoolId, bracnchId, classId is required !" })
            }
            const school = await schoolModel.findById(schoolId);
            if (!school) {
                return res.status(400).json({ success: false, message: "Invalid school ID" });
            }

            const branch = await authSchoolBranchModel.findById(branchId);
            if (!branch) {
                return res.status(400).json({ success: false, message: "Invalid branch ID" });
            }

            const classData = await classModel.findById(classId);
            if (!classData) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }

            const student = await studentModal.create({
                ...req.body,
                school: schoolId,
                schoolBranch: branchId,
                class: classId,
                isActive: true
            });

            await authSchoolBranchModel.findByIdAndUpdate(branchId, {
                $push: { total_Students: student._id }
            });

            await classModel.findByIdAndUpdate(classId, {
                $push: { students: student._id }
            });

            res.status(201).json({ message: "Student Added Successfully ", student });

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

}

module.exports = new StudentController();