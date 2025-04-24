const mongoose = require('mongoose');
const Staff = require('../models/authModel_Teacher');
const Branch = require('../models/branchModel');
const SchoolAdmin = require('../models/authModel_SchoolAdmin');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');




exports.createStaff = asyncHandler(async (req, res) => {

    const {
        firstName, lastName, dateOfBirth, phoneNumber, emailIDOfficial, gender,
        employeeRole, school, branch, title, emailIDPersonal,
        bloodGroup, maritalStatus, marriageAnniversary, department, subDepartment,
        emergencyContact, nationality, religion, fatherName, bankDetails,
        currentAddress, permanentAddress, photoBase64, aadhaarCardBase64, panCardBase64
    } = req.body;

    // Extract user id and role from JWT token
    // const userId = req.user.id;
    // const userRole = req.user.role;

    // Handle base64 file uploads
    let photoUrl = null;
    let aadhaarCardUrl = null;
    let panCardUrl = null;

    // Generate a unique employee ID (you can customize this logic)
    const employeeId = `EMP${Date.now().toString().slice(-6)}`;

    // Upload photo if present in base64 format
    if (photoBase64) {
        try {
            const photoUpload = await cloudinary.uploader.upload(photoBase64, {
                folder: 'toondemy-staff-photos',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
            });
            photoUrl = photoUpload.secure_url;
        } catch (error) {
            console.error("Error uploading photo:", error);
        }
    }

    // Upload Aadhaar card if present in base64 format
    if (aadhaarCardBase64) {
        try {
            const aadhaarUpload = await cloudinary.uploader.upload(aadhaarCardBase64, {
                folder: 'toondemy-staff-documents',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf']
            });
            aadhaarCardUrl = aadhaarUpload.secure_url;
        } catch (error) {
            console.error("Error uploading Aadhaar card:", error);
        }
    }

    // Upload PAN card if present in base64 format
    if (panCardBase64) {
        try {
            const panUpload = await cloudinary.uploader.upload(panCardBase64, {
                folder: 'toondemy-staff-documents',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf']
            });
            panCardUrl = panUpload.secure_url;
        } catch (error) {
            console.error("Error uploading PAN card:", error);
        }
    }

    // Check if branch exists
    if (branch) {
        const branchExists = await Branch.findById(branch);
        if (!branchExists) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found'
            });
        }
    }

    // Parse bankDetails if it's a string
    let parsedBankDetails = bankDetails;
    if (typeof bankDetails === 'string') {
        try {
            parsedBankDetails = JSON.parse(bankDetails);
        } catch (error) {
            console.error("Error parsing bank details:", error);
        }
    }

    // Prepare staff data
    const staffData = {
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        emailIDOfficial,
        gender,
        employeeRole,
        school,
        branch,
        employeeId, // Auto-generated
        title,
        emailIDPersonal,
        bloodGroup,
        maritalStatus,
        marriageAnniversary,
        department,
        subDepartment,
        emergencyContact,
        nationality,
        religion,
        fatherName,
        bankDetails: parsedBankDetails,
        currentAddress,
        permanentAddress,
        photoUrl,
        aadhaarCardUrl,
        panCardUrl,
        dateOfJoining: req.body.dateOfJoining || Date.now()
    };

    // If not superadmin, associate with schoolAdmin
    // if (userRole !== 'superadmin') {
    //     staffData.branch = userId;
    // }

    // Create staff record
    try {
        const staff = await Staff.create(staffData);

        if (branch) {
            await Branch.findByIdAndUpdate(branch, {
                $push: { branches: staff._id }
            });
        }

        res.status(201).json({
            success: true,
            data: staff
        });
    } catch (error) {
        console.error("Error creating staff:", error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error creating staff record'
        });
    }
});

// Update staff controller - similar modifications
exports.updateStaff = asyncHandler(async (req, res) => {
    const staffId = req.params.id;

    const {
        firstName, lastName, dateOfBirth, phoneNumber, emailIDOfficial, gender,
        employeeRole, school, branch, title, emailIDPersonal,
        bloodGroup, maritalStatus, marriageAnniversary, department, subDepartment,
        emergencyContact, nationality, religion, fatherName, bankDetails,
        currentAddress, permanentAddress, photoBase64, aadhaarCardBase64, panCardBase64
    } = req.body;

    // Find existing staff record
    const existingStaff = await Staff.findById(staffId);
    if (!existingStaff) {
        return res.status(404).json({
            success: false,
            message: 'Staff not found'
        });
    }

    // Handle base64 file uploads
    let photoUrl = existingStaff.photoUrl;
    let aadhaarCardUrl = existingStaff.aadhaarCardUrl;
    let panCardUrl = existingStaff.panCardUrl;

    // Upload photo if present in base64 format
    if (photoBase64 && photoBase64.startsWith('data:')) {
        try {
            const photoUpload = await cloudinary.uploader.upload(photoBase64, {
                folder: 'toondemy-staff-photos',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
            });
            photoUrl = photoUpload.secure_url;
        } catch (error) {
            console.error("Error uploading photo:", error);
        }
    }

    // Upload Aadhaar card if present in base64 format
    if (aadhaarCardBase64 && aadhaarCardBase64.startsWith('data:')) {
        try {
            const aadhaarUpload = await cloudinary.uploader.upload(aadhaarCardBase64, {
                folder: 'toondemy-staff-documents',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf']
            });
            aadhaarCardUrl = aadhaarUpload.secure_url;
        } catch (error) {
            console.error("Error uploading Aadhaar card:", error);
        }
    }

    // Upload PAN card if present in base64 format
    if (panCardBase64 && panCardBase64.startsWith('data:')) {
        try {
            const panUpload = await cloudinary.uploader.upload(panCardBase64, {
                folder: 'toondemy-staff-documents',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf']
            });
            panCardUrl = panUpload.secure_url;
        } catch (error) {
            console.error("Error uploading PAN card:", error);
        }
    }

    // Parse bankDetails if it's a string
    let parsedBankDetails = bankDetails;
    if (typeof bankDetails === 'string') {
        try {
            parsedBankDetails = JSON.parse(bankDetails);
        } catch (error) {
            console.error("Error parsing bank details:", error);
        }
    }

    // Prepare staff data for update
    const staffData = {
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        emailIDOfficial,
        gender,
        employeeRole,
        school,
        branch,
        title,
        emailIDPersonal,
        bloodGroup,
        maritalStatus,
        marriageAnniversary,
        department,
        subDepartment,
        emergencyContact,
        nationality,
        religion,
        fatherName,
        bankDetails: parsedBankDetails,
        currentAddress,
        permanentAddress,
        photoUrl,
        aadhaarCardUrl,
        panCardUrl,
        updatedAt: Date.now()
    };

    // Update staff record
    try {
        const updatedStaff = await Staff.findByIdAndUpdate(staffId, staffData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: updatedStaff
        });
    } catch (error) {
        console.error("Error updating staff:", error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error updating staff record'
        });
    }
});
exports.getAllStaff = asyncHandler(async (req, res) => {
    try {
        // Await the query to execute and get the results
        const staff = await Staff.find();

        // Send the staff data as a response
        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (err) {
        console.log(err);
        // Send error response
        res.status(500).json({
            success: false,
            message: "Error retrieving staff data",
            error: err.message
        });
    }
});

exports.getStaff = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    const staff = await Staff.findById(req.params.id)
        .populate('branch', 'name displayName')

    if (!staff) {
        return res.status(404).json({
            success: false,
            message: `No staff found with id ${req.params.id}`
        });
    }

    // Check if user has permission to view this staff (superadmin can view all)
    if (userRole !== 'superadmin' && String(staff.schoolAdmin) !== String(userId)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this staff record'
        });
    }

    res.status(200).json({
        success: true,
        data: staff
    });
});



exports.deleteStaff = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    const staff = await Staff.findById(req.params.id);

    if (!staff) {
        return res.status(404).json({
            success: false,
            message: `No staff found with id ${req.params.id}`
        });
    }

    // Check if user has permission to delete this staff (superadmin can delete all)
    if (userRole !== 'superadmin' && String(staff.schoolAdmin) !== String(userId)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this staff record'
        });
    }

    // Remove the staff reference from the branch (assuming staff.branch holds the branch ID)
    if (staff.branch) {
        await Branch.findByIdAndUpdate(staff.branch, {
            $pull: { branches: staff._id }
        });
    }

    // Delete the staff
    await staff.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

exports.assignStaffToBranch = asyncHandler(async (req, res) => {
    const { staffId, branchId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate ObjectIds
    if (!staffId || !branchId) {
        return res.status(400).json({
            success: false,
            message: "staffId and branchId are required"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(staffId) || !mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid staffId or branchId format"
        });
    }

    // Find staff and branch
    const staff = await Staff.findById(staffId);
    if (!staff) {
        return res.status(404).json({
            success: false,
            message: "Staff not found"
        });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
        return res.status(404).json({
            success: false,
            message: "Branch not found"
        });
    }

    // Check permissions (superadmin can assign any staff to any branch)
    if (userRole !== 'superadmin') {
        if (String(staff.schoolAdmin) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to assign this staff'
            });
        }

        const schoolAdmin = await SchoolAdmin.findById(userId);
        if (!schoolAdmin.branches.includes(branchId)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to assign to this branch'
            });
        }
    }

    const previousBranchId = staff.branch;

    // Update staff's branch
    staff.branch = branchId;
    await staff.save();

    // Optionally remove staff from the previous branch if it exists
    if (previousBranchId && previousBranchId !== branchId) {
        await Branch.findByIdAndUpdate(previousBranchId, {
            $pull: { branches: staff._id }
        });
    }

    // Add staff to the new branch (if not already present)
    await Branch.findByIdAndUpdate(branchId, {
        $addToSet: { branches: staff._id }
    });

    res.status(200).json({
        success: true,
        message: `Staff has been ${previousBranchId ? "reassigned" : "assigned"} to the new branch successfully.`,
        data: staff
    });
});
exports.deactivateAccount = asyncHandler(async (req, res) => {
    const { staffId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid staffId format",
        });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
        return res.status(404).json({
            success: false,
            message: "Staff not found",
        });
    }

    // Toggle the isActive status
    staff.isActive = !staff.isActive;
    await staff.save();

    res.status(200).json({
        success: true,
        message: `Staff account has been ${staff.isActive ? "activated" : "deactivated"} successfully.`,
        data: staff,
    });
});
