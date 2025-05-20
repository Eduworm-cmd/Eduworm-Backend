const mongoose = require("mongoose");
const classModel = require("../../models/SuperAdmin/classModel");
const staffModel = require("../../models/SchoolAdmin/staffModal");
const teacherModel = require("../../models/SchoolAdmin/teacherModal");
const authSchoolBranchModel = require("../../models/SuperAdmin/authSchoolBranchModel");
const schoolModel = require("../../models/SuperAdmin/schoolModel");
const uploadToCloudinary = require("../../services/uploadToCloudinary");
const bcrypt = require('bcryptjs');

class StaffController {
    createStafff = async (req, res) => {
        try {
            const {
                schoolId, branchId, firstName, lastName, dateOfBirth, phoneNumber,
                emailId, password, gender, employeeRole, dateofJoining, bloodGroup,
                maritalStatus, marriageAnniversary, department, subDepartment,
                emergencyContact, nationality, religion, address, employeeBankDeatils,
                classId, teacherName,
                profile,           // base64 image
                aadharCard,        // base64 image
                panCard            // base64 image
            } = req.body;

            if (!schoolId || !branchId) {
                return res.status(400).json({ message: 'School and Branch are required.' });
            }

            if (!mongoose.Types.ObjectId.isValid(schoolId)) {
                return res.status(400).json({ message: 'Invalid school Id.' });
            }

            if (!mongoose.Types.ObjectId.isValid(branchId)) {
                return res.status(400).json({ message: 'Invalid branch Id.' });
            }

            const schoolBranch = await authSchoolBranchModel.findById(branchId);
            if (!schoolBranch) {
                return res.status(404).json({ message: 'School branch not found.' });
            }

            const school = await schoolModel.findById(schoolId);
            if (!school) {
                return res.status(404).json({ message: 'School not found.' });
            }

            const requiredFields = [firstName, lastName, dateOfBirth, phoneNumber, emailId,
                password, gender, employeeRole, dateofJoining, department, subDepartment,
                emergencyContact, nationality, religion];

            if (requiredFields.some(field => !field)) {
                return res.status(400).json({ message: 'Missing required fields.' });
            }

            const existingEmail = await staffModel.findOne({ emailId });
            if (existingEmail) return res.status(400).json({ message: 'Email already exists.' });

            const existingPhone = await staffModel.findOne({ phoneNumber });
            if (existingPhone) return res.status(400).json({ message: 'Phone number already exists.' });

            if (employeeRole === "teacher") {
                if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
                    return res.status(400).json({ message: 'Invalid or missing classId for teacher.' });
                }

                const classExists = await classModel.findById(classId);
                if (!classExists) return res.status(404).json({ message: 'Class not found.' });
            }

            let profileUrl = null;
            let aadharUrl = null;
            let panUrl = null;

            // Upload base64 images to Cloudinary if provided
            if (profile) {
                profileUrl = await uploadToCloudinary(profile, 'school/staff/profile');
            }
            if (aadharCard) {
                aadharUrl = await uploadToCloudinary(aadharCard, 'school/staff/documents');
            }
            if (panCard) {
                panUrl = await uploadToCloudinary(panCard, 'school/staff/documents');
            }

            const newStaff = new staffModel({
                firstName, lastName, dateOfBirth, phoneNumber, emailId, password, gender,
                employeeRole, dateofJoining, bloodGroup, maritalStatus, marriageAnniversary,
                department, subDepartment, emergencyContact, nationality, religion,
                address, employeeBankDeatils,
                profile: profileUrl,
                document: {
                    aadharCard: aadharUrl,
                    panCard: panUrl
                },
                school: schoolId,
                branch: branchId,
                class: employeeRole === "teacher" ? classId : undefined,
            });

            const savedStaff = await newStaff.save();

            await authSchoolBranchModel.findByIdAndUpdate(branchId, {
                $push: { total_Staff: savedStaff._id }
            });

            if (employeeRole === "teacher") {
                const newTeacher = new teacherModel({
                    assignClass: classId,
                    class: classId,
                    teacherName: teacherName || `${firstName} ${lastName}`
                });

                const savedTeacher = await newTeacher.save();
                savedStaff.teacher = savedTeacher._id;
                await savedStaff.save();

                await classModel.findByIdAndUpdate(classId, {
                    $push: { teacher: savedTeacher._id }
                });

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


    getAllStaff = async (req, res) => {
        try {
            const { branchId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;

            if (!branchId) {
                return res.status(400).json({ message: 'Branch ID is required.' });
            }
            if (!mongoose.Types.ObjectId.isValid(branchId)) {
                return res.status(400).json({ message: 'Invalid branch ID.' });
            }
            const branch = await authSchoolBranchModel.findById(branchId);

            if (!branch) {
                return res.status(404).json({ message: 'Branch not found.' });
            }
            const staff = await staffModel.find({ branch: branchId })
                .populate('class', 'className')
                .populate('teacher', 'teacherName')
                .select('-password -__v')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const totalStaff = await staffModel.countDocuments({ branch: branchId });

            const totalPages = Math.ceil(totalStaff / limit);

            // if (!staff || staff.length === 0) {
            //     return res.status(404).json({ message: 'No staff found for this branch.' });
            // }

            return res.status(200).json({
                success: true,
                totalPages,
                limit,
                currentPage: page,
                totalStaff,
                message: 'Staff fetched successfully',
                data: staff
            });
        } catch (error) {
            console.error("Error fetching all staff:", error);
            return res.status(500).json({ message: error.message });
        }
    }

    getStaffById = async (req, res) => {
        try {
            const { staffId } = req.params;

            if (!staffId) {
                return res.status(400).json({ message: 'Staff ID is required.' });
            }

            if (!mongoose.Types.ObjectId.isValid(staffId)) {
                return res.status(400).json({ message: 'Invalid staff ID.' });
            }
            const staff = await staffModel.findById(staffId)
                .populate('school','schoolName')
                .populate('branch','name')
                .populate('class', 'className')
                .populate('teacher', 'teacherName')
                .select('-password -__v');


            if (!staff) {
                return res.status(404).json({ message: 'Staff not found.' });
            }

            return res.status(201).json({
                success: true,
                message: 'Staff fetched successfully',
                data: staff
            });

        } catch (error) {
            console.error("Error fetching staff by ID:", error);
            return res.status(500).json({ message: error.message });
        }
    }

    updateStaff = async (req, res) => {
        try {
            const { staffId } = req.params;

            const { firstName, lastName, dateOfBirth, phoneNumber, emailId,
                gender, employeeRole, dateofJoining, bloodGroup, maritalStatus,
                marriageAnniversary, department, subDepartment, emergencyContact,
                nationality, religion, address, employeeBankDeatils, classId,
                teacherName, profile, aadharCard, panCard, password } = req.body;


            if (!staffId) {
                return res.status(400).json({ message: 'Staff ID is required.' });
            }
            if (!mongoose.Types.ObjectId.isValid(staffId)) {
                return res.status(400).json({ message: 'Invalid staff ID.' });
            }

            const existingStaff = await staffModel.findById(staffId);

            if (!existingStaff) {
                return res.status(404).json({ message: 'Staff not found.' });
            }
            if (emailId && emailId !== existingStaff.emailId) {
                const emailExists = await staffModel.findOne({ emailId });
                if (emailExists) {
                    return res.status(400).json({ message: 'Email already exists.' });
                }
            }

            if (phoneNumber && phoneNumber !== existingStaff.phoneNumber) {
                const phoneEixists = await staffModel.findOne({ phoneNumber });
                if (phoneEixists) {
                    return res.status(400).json({ message: 'Phone number already exists.' });
                }
            }

            let hashedPassword = existingStaff.password;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(password, salt);
            }

            let profileUrl = existingStaff.profile;
            let aadharUrl = existingStaff.document.aadharCard;
            let panUrl = existingStaff.document.panCard;
            if (profile) {
                profileUrl = await uploadToCloudinary(profile, 'school/staff/profile');
            }
            if (aadharCard) {
                aadharUrl = await uploadToCloudinary(aadharCard, 'school/staff/documents');
            }
            if (panCard) {
                panUrl = await uploadToCloudinary(panCard, 'school/staff/documents');
            }

            existingStaff.set({
                firstName, lastName, dateOfBirth, phoneNumber, emailId, password: hashedPassword, gender,
                employeeRole, dateofJoining, bloodGroup, maritalStatus, marriageAnniversary,
                department, subDepartment, emergencyContact, nationality, religion,
                address, employeeBankDeatils,
                profile: profileUrl,
                document: {
                    aadharCard: aadharUrl,
                    panCard: panUrl
                },
                class: employeeRole === "teacher" ? classId : undefined,
            })

            const updatedStaff = await existingStaff.save();

            if (employeeRole === "teacher") {
                let teacher = await teacherModel.findById(existingStaff.teacher);

                if (!teacher) {
                    teacher = new teacherModel({
                        assignClass: classId,
                        class: classId,
                        teacherName: teacherName || `${firstName} ${lastName}`
                    });
                }
                const savedTeacher = await teacher.save();
                existingStaff.teacher = savedTeacher._id;
                await existingStaff.save();

                await classModel.findByIdAndUpdate(classId, {
                    $addToSet: { teacher: savedTeacher._id }
                });

                await authSchoolBranchModel.findByIdAndUpdate(existingStaff.branch, {
                    $addToSet: { total_Teachers: savedTeacher._id }
                });

            } else if (existingStaff.teacher) {
                // 🔒 Only update if there's already a teacher record linked
                const teacher = await teacherModel.findById(existingStaff.teacher);
                if (teacher) {
                    teacher.teacherName = teacherName || `${firstName} ${lastName}`;
                    teacher.class = classId;
                    teacher.assignClass = classId;
                    await teacher.save();
                }
            }

            return res.status(200).json({
                success: true,
                message: "Staff updated successfully.",
                data: updatedStaff
            });
        } catch (error) {
            console.error("Error editing staff:", error);
            return res.status(500).json({ message: error.message });
        }
    }

    delteStaffById = async (req, res) => {
        try {
            const { staffId } = req.params;

            if (!staffId) {
                return res.status(400).json({ message: "Staff Id is required !" });
            }

            if (!mongoose.Types.ObjectId.isValid(staffId)) {
                return res.status(400).json({ message: "Invalid Staff Id !" })
            }

            const staff = await staffModel.findById(staffId);

            if (!staff) {
                return res.status(404).json({ message: "Staff No found !" });
            }

            const branchId = staff.branch;
            const classId = staff.class;
            const teacherId = staff.teacher;

            if (staff.employeeRole === "teacher" && teacherId) {
                await teacherModel.findByIdAndDelete(teacherId);

                if (classId) {
                    await classModel.findByIdAndUpdate(classId, {
                        $pull: { teacher: teacherId }
                    })
                }

                if (branchId) {
                    await authSchoolBranchModel.findByIdAndUpdate(branchId, {
                        $pull: { total_Teachers: teacherId }
                    });
                }
            }

            await staffModel.findByIdAndDelete(staffId);

            if (branchId) {
                await authSchoolBranchModel.findByIdAndUpdate(branchId, {
                    $pull: { total_Staff: staffId }
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Staff deleted successfully.'
            });

        } catch (error) {
            console.error("Error deleting staff:", error);
            return res.status(500).json({ message: error.message });
        }
    }

    getOverAllStaffs = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const allStaff = await staffModel.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .populate({
                    path: 'branch',
                    select: 'name location'
                })
                .select('-password');


            const totalStaff = await staffModel.countDocuments();

            return res.status(200).json({
                message: "Staff fetched successfully",
                data: allStaff,
                total: totalStaff,
                page,
                limit
            });
        } catch (error) {
            console.error("Error fetching staff:", error);
            return res.status(500).json({ message: error.message });
        }
    }

}

module.exports = new StaffController();
