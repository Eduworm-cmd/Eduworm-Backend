const cloudinary = require("cloudinary");
const staffModel = require("../../models/SuperAdmin/staffModel");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
class StaffController {
  createStaff = async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({
          success: false,
          message: "Request body is empty",
        });
      }

      const {
        firstName,
        lastName,
        password,
        dateOfBirth,
        phoneNumber,
        emailId,
        gender,
        employeeRole,
        department,
        currentAddress,
        profile,
        nationality,
        religion,
        fatherName,
        permanentAddress,
        pinCode,
        city,
        state,
      } = req.body;

      const requiredFields = {
        firstName,
        lastName,
        password,
        dateOfBirth,
        phoneNumber,
        emailId,
        gender,
        employeeRole,
        department,
        currentAddress,
        profile,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const existingStaff = await staffModel.findOne({
        $or: [{ emailId }, { phoneNumber }],
      });

      if (existingStaff) {
        const conflictFields = [];
        if (existingStaff.emailId === emailId) conflictFields.push("Email");
        if (existingStaff.phoneNumber === phoneNumber)
          conflictFields.push("Phone Number");

        return res.status(400).json({
          success: false,
          message: `${conflictFields.join(" and ")} already exist${conflictFields.length > 1 ? "" : "s"
            }`,
        });
      }

      // Upload profile image
      let profileUrl = "";
      if (profile) {
        try {
          const uploadResult = await cloudinary.uploader.upload(
            `data:image/png;base64,${profile}`,
            {
              folder: "SuperAdmin-staff-photos",
              allowed_formats: ["jpg", "jpeg", "png", "webp"],
            }
          );
          profileUrl = uploadResult.secure_url;
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Profile upload failed: " + error.message,
          });
        }
      }

      const newStaff = await staffModel.create({
        firstName,
        lastName,
        password,
        dateOfBirth,
        phoneNumber,
        emailId,
        gender,
        employeeRole,
        department,
        currentAddress,
        nationality,
        religion,
        fatherName,
        permanentAddress,
        pinCode,
        city,
        state,
        profile: profileUrl,
      });

      return res.status(201).json({
        success: true,
        message: "Staff member created successfully",
        data: {
          _id: newStaff._id,
          employeeId: newStaff.employeeId,
          firstName: newStaff.firstName,
        },
      });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };

  //Get All Staaff
  GetAllStaff = async (req, res) => {
    try {
      const staff = await staffModel.find();

      if (!staff) {
        return res.status(404).json({ message: "No staff found" });
      }

      res.status(200).json(staff);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get Staff By Id
  getStaffById = async (req, res) => {
    try {
      const { staffId } = req.params;

      if (!staffId) {
        return res
          .status(400)
          .json({ success: false, message: "Staff ID is required." });
      }

      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Staff ID format." });
      }

      const staff = await staffModel.findById(staffId).select("-password");

      console.log(staff);

      if (!staff) {
        return res
          .status(404)
          .json({ success: false, message: "Staff not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Staff fetched successfully.",
        data: staff,
      });
    } catch (error) {
      console.error("Error fetching staff by ID:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  updateStaff = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        emailId,
        password,
        gender,
        employeeRole,
        department,
        nationality,
        religion,
        fatherName,
        currentAddress,
        permanentAddress,
        pinCode,
        city,
        state,
        profile,
      } = req.body;

      const existingStaff = await staffModel.findById(id);
      if (!existingStaff) {
        return res.status(404).json({ success: false, message: "Staff not found" });
      }

      const conflict = await staffModel.findOne({
        _id: { $ne: id },
        $or: [{ emailId }, { phoneNumber }],
      });

      if (conflict) {
        return res.status(400).json({ message: "Email or phone number already in use by another user" });
      }

      let profileUrl = existingStaff.profile;
      if (profile && profile.startsWith("data:image")) {
        try {
          const upload = await cloudinary.uploader.upload(profile, {
            folder: "SuperAdmin-staff-photos",
          });
          profileUrl = upload.secure_url;
        } catch (err) {
          return res.status(500).json({ message: "Failed to upload profile image" });
        }
      }

      let hashedPassword = existingStaff.password;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }

      existingStaff.set({
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        emailId,
        password: hashedPassword,
        gender,
        employeeRole,
        department,
        nationality,
        religion,
        fatherName,
        currentAddress,
        permanentAddress,
        pinCode,
        city,
        state,
        profile: profileUrl,
      });

      await existingStaff.save();

      return res.status(200).json({ success: true, message: "Staff updated successfully", data: existingStaff });
    } catch (error) {
      console.error("Update staff error:", error);
      return res.status(500).json({ message: error.message });
    }
  };


  deleteStaff = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Staff Id is required!" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Staff Id is invalid!" });
      }

      const deletedStaff = await staffModel.findByIdAndDelete(id);

      if (!deletedStaff) {
        return res.status(404).json({ message: "Staff not found!" });
      }

      return res.status(200).json({ message: "Staff deleted successfully." });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message || "Server Error" });
    }
  };


  // createStaffStaffForSchool = async (req, res) => {
  //   try {
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({message: error.message});
  //   }
  // };
}

module.exports = new StaffController();
