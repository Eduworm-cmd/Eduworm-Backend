const Branch = require("../models/branchModel");
const SchoolAdmin = require("../models/authModel_SchoolAdmin");
const cloudinary = require("../config/cloudinary");

exports.createBranch = async (req, res) => {
    try {
        const { name, displayName, phoneNumber, email, country, state, city, pinCode, address, branchLogo } = req.body;
        const schoolAdminId = req.user.id; // School Admin is authenticated via JWT token

        let logoUrl = "";
        if (branchLogo) {
            const uploadedImage = await cloudinary.uploader.upload(branchLogo, {
                folder: "school-admin-branch-logos",
                allowed_formats: ["jpg", "png", "jpeg", "webp"],
            });
            logoUrl = uploadedImage.secure_url; // CDN URL
        }

        const newBranch = new Branch({
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
            schoolAdmin: schoolAdminId,  // Store reference to school admin
        });

        const savedBranch = await newBranch.save();

        await SchoolAdmin.findByIdAndUpdate(schoolAdminId, {
            $push: { branches: savedBranch._id },
        });

        res.status(201).json(savedBranch);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating branch" });
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
