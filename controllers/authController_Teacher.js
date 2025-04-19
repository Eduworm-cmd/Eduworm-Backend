const mongoose = require('mongoose');
const Staff = require('../models/authModel_Teacher');
const Branch = require('../models/branchModel');
const SchoolAdmin = require('../models/authModel_SchoolAdmin');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');


exports.createStaff = asyncHandler(async (req, res) => {
    const {
        firstName, lastName, dateOfBirth, phoneNumber, emailIDOfficial, gender,
        employeeRole, school, branch, employeeId, title, emailIDPersonal,
        bloodGroup, maritalStatus, marriageAnniversary, department, subDepartment,
        emergencyContact, nationality, religion, fatherName, bankDetails,
        currentAddress, permanentAddress
    } = req.body;

    // Extract user id and role from JWT token
    const userId = req.user.id;
    const userRole = req.user.role;

    // Handle file uploads
    let photoUrl = null;
    let aadhaarCardUrl = null;
    let panCardUrl = null;

    if (req.files) {
        // Upload photo if present
        if (req.files.photo) {
            const photoUpload = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
                folder: 'toondemy-staff-photos',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
            });
            photoUrl = photoUpload.secure_url;
        }

        // Upload Aadhaar card if present
        if (req.files.aadhaarCard) {
            const aadhaarUpload = await cloudinary.uploader.upload(req.files.aadhaarCard.tempFilePath, {
                folder: 'toondemy-staff-documents',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf']
            });
            aadhaarCardUrl = aadhaarUpload.secure_url;
        }

        // Upload PAN card if present  
        if (req.files.panCard) {
            const panUpload = await cloudinary.uploader.upload(req.files.panCard.tempFilePath, {
                folder: 'toondemy-staff-documents',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf']
            });
            panCardUrl = panUpload.secure_url;
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
        employeeId,
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
        bankDetails,
        currentAddress,
        permanentAddress,
        photoUrl,
        aadhaarCardUrl,
        panCardUrl,
        dateOfJoining: req.body.dateOfJoining || Date.now()
    };

    // If not superadmin, associate with schoolAdmin
    if (userRole !== 'superadmin') {
        staffData.branch = userId;
    }

    // Create staff record
    const staff = await Staff.create(staffData);
    await Branch.findByIdAndUpdate(branch, {
        $push: { branches: staff._id }
    });
    res.status(201).json({
        success: true,
        data: staff
    });
});

exports.getAllStaff = asyncHandler(async (req, res) => {
    let query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // For non-superadmin users, only show staff from their branches
    if (userRole !== 'superadmin') {
        // Find all branches associated with this school admin
        const schoolAdmin = await SchoolAdmin.findById(userId);
        if (!schoolAdmin) {
            return res.status(404).json({
                success: false,
                message: 'School admin not found'
            });
        }

        // Add schoolAdmin filter to query
        reqQuery.schoolAdmin = userId;
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Staff.find(JSON.parse(queryStr))
        .populate('branch', 'name displayName')

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Count documents with the same filters
    const total = await Staff.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const staff = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: staff.length,
        pagination,
        data: staff
    });
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

exports.updateStaff = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    let staff = await Staff.findById(req.params.id);

    if (!staff) {
        return res.status(404).json({
            success: false,
            message: `No staff found with id ${req.params.id}`
        });
    }

    // Check if user has permission to update this staff (superadmin can update all)
    if (userRole !== 'superadmin' && String(staff.schoolAdmin) !== String(userId)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this staff record'
        });
    }

    // Handle file uploads if present
    if (req.files) {
        // Upload photo if present
        if (req.files.photo) {
            const photoUpload = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
                folder: 'toondemy-staff-photos',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
            });
            req.body.photoUrl = photoUpload.secure_url;
        }

        // Upload Aadhaar card if present
        if (req.files.aadhaarCard) {
            const aadhaarUpload = await cloudinary.uploader.upload(req.files.aadhaarCard.tempFilePath, {
                folder: 'toondemy-staff-documents',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf']
            });
            req.body.aadhaarCardUrl = aadhaarUpload.secure_url;
        }

        // Upload PAN card if present  
        if (req.files.panCard) {
            const panUpload = await cloudinary.uploader.upload(req.files.panCard.tempFilePath, {
                folder: 'toondemy-staff-documents',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf']
            });
            req.body.panCardUrl = panUpload.secure_url;
        }
    }

    // Update timestamp
    req.body.updatedAt = Date.now();

    staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

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
  