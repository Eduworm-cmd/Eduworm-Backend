const authSchoolBranchModel = require("../../models/SuperAdmin/authSchoolBranchModel");
const classModel = require("../../models/SuperAdmin/classModel");
const studentModel = require("../../models/SuperAdmin/schoolModel");

class StudentController {
    createStudent = async (req, res) => {
        try {
            const { schoolId, branchId, classId } = req.body;
    
            const {
                firstName,
                lastName,
                dateOfBirth,
                gender,
                rollNo,
                admissionNumber,
                dateOfJoining,
                bloodGroup,
                enrollmentStatus,
                uniqueId,
                photo,
                documents,
                emergencyContact,
                parents
            } = req.body;
    
            const classData = await classModel.findById(classId);
            if (!classData) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }
    
            const student = await studentModel.create({
                firstName,
                lastName,
                dateOfBirth,
                gender,
                rollNo,
                admissionNumber,
                dateOfJoining,
                bloodGroup,
                enrollmentStatus,
                uniqueId,
                photo,
                documents,
                emergencyContact,
                parents,
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
    
            res.status(201).json({ success: true, student });
        } catch (error) {
            console.error("Error creating student:", error);
            res.status(500).json({ success: false, message:error.message });
        }
    };
}

module.exports = new StudentController();