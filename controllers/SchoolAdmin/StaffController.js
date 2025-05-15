const mongoose = require("mongoose");
const classModel = require("../../models/SuperAdmin/classModel");
const staffModel = require("../../models/SchoolAdmin/staffModal");
const teacherModel = require("../../models/SchoolAdmin/teacherModal");
const authSchoolBranchModel = require("../../models/SuperAdmin/authSchoolBranchModel");

class StaffController {
    createStafff = async (req, res) => {
        try {
            const {
                schoolId,
                branchId,
                firstName,
                lastName,
                dateOfBirth,
                phoneNumber,
                emailId,
                password,
                gender,
                employeeRole,
                dateofJoining,
                bloodGroup,
                maritalStatus,
                marriageAnniversary,
                department,
                subDepartment,
                emergencyContact,
                nationality,
                religion,
                address,
                employeeBankDeatils,
                document,
                classId,
            } = req.body;

            // Validate required fields
            if (!schoolId || !branchId) {
                return res.status(400).json({ message: 'School and Branch are required.' });
            }

            if (
                !firstName || !lastName || !dateOfBirth || !phoneNumber || !emailId ||
                !password || !gender || !employeeRole || !dateofJoining ||
                !department || !subDepartment || !emergencyContact ||
                !nationality || !religion
            ) {
                return res.status(400).json({ message: 'Please provide all required fields.' });
            }

            // Check for duplicate email or phone
            const existingEmail = await staffModel.findOne({ emailId });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists.' });
            }

            const existingPhone = await staffModel.findOne({ phoneNumber });
            if (existingPhone) {
                return res.status(400).json({ message: 'Phone number already exists.' });
            }

            // Validate class if employeeRole is teacher
            if (employeeRole === "teacher") {
                if (!classId) {
                    return res.status(400).json({ message: "Class Id is required for teacher!" });
                }

                if (!mongoose.Types.ObjectId.isValid(classId)) {
                    return res.status(400).json({ message: "Invalid Class Id!" });
                }

                const existsClass = await classModel.findById(classId);
                if (!existsClass) {
                    return res.status(404).json({ message: "Class not found!" });
                }
            }

            // Create new staff
            const newStaff = new staffModel({
                firstName,
                lastName,
                dateOfBirth,
                phoneNumber,
                emailId,
                password,
                gender,
                employeeRole,
                dateofJoining,
                bloodGroup,
                maritalStatus,
                marriageAnniversary,
                department,
                subDepartment,
                emergencyContact,
                nationality,
                religion,
                address,
                employeeBankDeatils,
                document,
                school: schoolId,
                branch: branchId,
                class: employeeRole === "teacher" ? classId : undefined,
            });

            const savedStaff = await newStaff.save();

            await authSchoolBranchModel.findByIdAndUpdate(branchId, {
                $push: { total_Staff: savedStaff._id }
            });

            // If staff is a teacher, create teacher entry and link
            if (employeeRole === "teacher") {
                const newTeacher = new teacherModel({
                    assignClass: classId,
                    class: classId
                });

                const savedTeacher = await newTeacher.save();

                // Link teacher to staff
                savedStaff.teacher = savedTeacher._id;
                await savedStaff.save();

                // Push teacher ID to class
                await classModel.findByIdAndUpdate(classId, {
                    $push: { teacher: savedTeacher._id }
                });

                // Push teacher ID to branch's total_Teachers array
                await authSchoolBranchModel.findByIdAndUpdate(branchId, {
                    $push: { total_Teachers: savedTeacher._id }
                });
            }

            return res.status(201).json({
                success: true,
                message: 'Staff created successfully',
                data: savedStaff
            });

        } catch (error) {
            console.error("Error creating staff:", error);
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new StaffController();
