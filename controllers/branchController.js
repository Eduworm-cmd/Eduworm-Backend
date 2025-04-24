const Branch = require("../models/branchModel");
const SchoolAdmin = require("../models/authModel_SchoolAdmin");
const cloudinary = require("../config/cloudinary");
const { default: mongoose } = require("mongoose");

exports.createBranch = async (req, res) => {
    try {
      // Destructure the request body
      const { name, displayName, phoneNumber, email, country, state, city, pinCode, address, branchLogo } = req.body;
  
      // Extract the user id and role from the JWT token
      const schoolAdminId = req.user.id; 
      const role = req.user.role;
      
      // Variable for storing the branch logo URL
      let logoUrl = "";
  
      // If there's a branch logo, upload it to Cloudinary
      if (branchLogo) {
        const uploadedImage = await cloudinary.uploader.upload(branchLogo, {
          folder: "school-admin-branch-logos",
          allowed_formats: ["jpg", "png", "jpeg", "webp"],
        });
        logoUrl = uploadedImage.secure_url; // Store the Cloudinary URL
      }
  
      // Prepare the branch data
      const branchData = {
        name,
        displayName,
        phoneNumber,
        email,
        country,
        state,
        city,
        pinCode,
        address,
        branchLogo: logoUrl,
      };
  
      // If the role is not superadmin, set the schoolAdmin field
      if (role !== "superadmin") {
        branchData.schoolAdmin = schoolAdminId; // Set the current school admin's ID
      }
  
      // Create the new branch with the prepared data
      const newBranch = new Branch(branchData);
  
      // Save the branch to the database
      const savedBranch = await newBranch.save();
  
      // If the user is not a superadmin, associate this branch with the school admin
      if (role !== "superadmin") {
        await SchoolAdmin.findByIdAndUpdate(schoolAdminId, {
          $push: { branches: savedBranch._id }, // Add this branch to the school admin's branches
        });
      }
  
      // Return the created branch in the response
      res.status(201).json(savedBranch);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error creating branch", error: err.message });
    }
  };
  

exports.updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, displayName, phoneNumber, email, country, state, city, pinCode, address, branchLogo } = req.body;

        let updates = {
            name,
            displayName,
            phoneNumber,
            email,
            country,
            state,
            city,
            pinCode,
            address,
        };

        if (branchLogo) {
            const uploadedImage = await cloudinary.uploader.upload(branchLogo, {
                folder: "school-admin-branch-logos",
                allowed_formats: ["jpg", "png", "jpeg", "webp"],
            });
            updates.branchLogo = uploadedImage.secure_url;
        }

        const updatedBranch = await Branch.findByIdAndUpdate(id, updates, { new: true });
        res.json(updatedBranch);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating branch" });
    }
};

exports.getBranches = async (req, res) => {
    try {
        const schoolAdminId = req.user.id;
        const branches = await Branch.find({ schoolAdmin: schoolAdminId });
        res.json(branches);
    } catch (err) {
        res.status(500).json({ message: "Error fetching branches" });
    }
};

exports.deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        await Branch.findByIdAndDelete(id);
        res.json({ message: "Branch deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting branch" });
    }
};
exports.toggleBranchStatus = async (req, res) => {
    try {
        const branchId = req.params.id;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({
                success: false,
                message: "isActive status is required"
            });
        }

        const updatedBranch = await Branch.findByIdAndUpdate(
            branchId,
            { isActive: Boolean(isActive) },
            { new: true }
        );

        if (!updatedBranch) {
            return res.status(404).json({ success: false, message: "Branch not found" });
        }

        const statusMessage = updatedBranch.isActive ? "activated" : "deactivated";

        res.status(200).json({
            success: true,
            message: `Branch ${statusMessage} successfully`,
            data: updatedBranch
        });
    } catch (error) {
        console.error("Error toggling branch status:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.assignSchoolAdminToBranch = async (req, res) => {
    try {
        const { branchId, schoolAdminId } = req.body;

        // ✅ Validate ObjectIds
        if (!branchId || !schoolAdminId) {
            return res.status(400).json({ message: "branchId and schoolAdminId are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(branchId) || !mongoose.Types.ObjectId.isValid(schoolAdminId)) {
            return res.status(400).json({ message: "Invalid branchId or schoolAdminId format" });
        }

        const schoolAdmin = await SchoolAdmin.findById(schoolAdminId);
        if (!schoolAdmin) {
            return res.status(404).json({ message: "SchoolAdmin not found" });
        }

        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({ message: "Branch not found" });
        }

        if (branch.schoolAdmin && String(branch.schoolAdmin) === String(schoolAdminId)) {
            return res.status(400).json({ message: "This branch is already assigned to the specified SchoolAdmin" });
        }

        const updatedBranch = await Branch.findByIdAndUpdate(
            branchId,
            { schoolAdmin: schoolAdminId },
            { new: true }
        );

        await SchoolAdmin.findByIdAndUpdate(schoolAdminId, {
            $addToSet: { branches: updatedBranch._id },
        });

        res.status(200).json({
            success: true,
            message: "SchoolAdmin assigned to branch successfully",
            branch: updatedBranch,
        });
    } catch (error) {
        console.error("Error assigning SchoolAdmin to branch:", error);
        res.status(500).json({ message: "Error assigning SchoolAdmin to branch" });
    }
};
// BranchController.js
exports.getBranches = async (req, res) => {
    try {
      const { schoolId } = req.query;
      
      // Filter branches by schoolId if provided
      const filter = {};
      if (schoolId) filter.schoolId = schoolId;
      
      const branches = await Branch.find(filter, 'name');
      
      res.status(200).json({
        status: "success",
        data: branches
      });
    } catch (error) {
      res.status(400).json({
        status: "fail",
        message: error.message
      });
    }
  };
exports.getAllAcademicYears = async (req, res) => {
  try {
    const { schoolId, branchId } = req.query;
        
    const filter = {};
    if (schoolId) filter.schoolId = schoolId;
    if (branchId) filter.branchId = branchId;
    
    // Base query
    const academicYears = await AcademicYear.find(filter);
    
    // Populate with branch names for UI display
    const populatedAcademicYears = await Promise.all(
      academicYears.map(async (year) => {
        try {
          const branch = await Branch.findById(year.branchId, 'name');
          return {
            ...year._doc,
            branchName: branch ? branch.name : 'Unknown Branch'
          };
        } catch (err) {
          console.error('Error getting branch name:', err);
          return {
            ...year._doc,
            branchName: 'Unknown Branch'
          };
        }
      })
    );
    
    res.status(200).json({
      status: "success",
      results: populatedAcademicYears.length,
      data: populatedAcademicYears
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

// BranchController.js
exports.getBranchesforschool = async (req, res) => {
    try {
      const { schoolId } = req.query;
      console.log(schoolId)
      // Filter branches by schoolId if provided
      const filter = {};
      if (schoolId) filter.schoolId = schoolId;
      
      const branches = await Branch.find({schoolAdmin:schoolId}, 'name _id');
      
      res.status(200).json({
        status: "success",
        data: branches
      });
    } catch (error) {
      res.status(400).json({
        status: "fail",
        message: error.message
      });
    }
  };