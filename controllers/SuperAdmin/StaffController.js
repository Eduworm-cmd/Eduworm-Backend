const cloudinary = require("cloudinary");
const staffModel = require("../../models/SuperAdmin/staffModel");

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
        .filter(([_, value]) => value === undefined || value === null || value === "")
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
        return res.status(400).json({
          success: false,
          message: "Email ID or phone number already exists",
        });
      }

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
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload profile photo",
            error: uploadError.message,
          });
        }
      }

      const newStaff = await staffModel.create({
        firstName,
        lastName,
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
        data: newStaff,
      });
    } catch (error) {
      console.error("Server error:", error);
      
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: messages,
        });
      }

      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          error: `${field} must be unique`,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };


  //Get All Staaff
  GetAllStaff = async (req,res) =>{
    try {
      const staff = await staffModel.find();
      
      if (!staff) {
        return res.status(404).json({ message: 'No staff found' });
      }
  
      res.status(200).json(staff);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
}



module.exports = new StaffController();