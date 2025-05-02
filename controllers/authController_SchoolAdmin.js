const jwt = require("jsonwebtoken");
const Auth = require("../models/authModel_SchoolAdmin");
const cloudinary = require("../config/cloudinary");
const bcrypt = require("bcryptjs");
const { default: mongoose } = require("mongoose");

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};


// Register user with OTP
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, role, branches } = req.body;

    const userExists = await Auth.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP - in production use a random generator
    const staticOtp = "123456";

    const newUser = new Auth({
      firstName,
      lastName,
      phoneNumber,
      staticOtp,
      role,
      branches,
      isVerified: false,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully. Please verify OTP.", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP and mark user as verified
const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, staticOtp } = req.body;

    const user = await Auth.findOne({ phone: phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.staticOtp !== staticOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        email: user.branchEmail,
        phoneNumber: user.phoneNumber,
        role: user.role,
        schoolName: user.schoolName,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Login only after verification
const loginUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await Auth.findOne({ phone: phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) return res.status(403).json({ message: "User not verified" });

    // Generate new OTP (for now hardcoded)
    user.staticOtp = "123456";
    await user.save();

    res.status(200).json({ message: "OTP sent successfully", otp: user.staticOtp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Controller function for login
const loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);
    console.log("Password provided:", password); // Be careful with logging passwords in production

    const user = await Auth.findOne({ branchEmail: email });

    console.log("User found:", user ? "Yes" : "No");

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) return res.status(403).json({ message: "User not verified" });

    // Log the stored hashed password for debugging
    console.log("Stored hashed password:", user.branchPassword);

    try {
      // Debug the bcrypt comparison
      const isMatch = await bcrypt.compare(password, user.branchPassword);
      console.log("Password comparison result:", isMatch);

      if (!isMatch) {
        // TEMPORARY WORKAROUND: If you need to bypass password check temporarily
        // Comment the next line and uncomment the workaround below
        return res.status(400).json({ message: "Invalid credentials" });

        // TEMPORARY WORKAROUND - REMOVE IN PRODUCTION
        // console.log("WARNING: Bypassing password check for testing!");
      }

      console.log("Authentication successful");

      const token = generateToken(user._id, user.role);

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.branchEmail,
          phoneNumber: user.phone, // Changed from phoneNumber to phone to match schema
          role: user.role,
          schoolName: user.schoolName,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (bcryptError) {
      console.error("Bcrypt comparison error:", bcryptError);
      return res.status(500).json({ message: "Authentication error" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Register by SuperAdmin Create School
const createSchoolAdminBySuperAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      schoolName,
      displayName,
      country,
      state,
      city,
      pincode,
      address,
      startDate,
      endDate,
      academicYear,
      branchName,
      branchEmail,
      branchPassword,
      classes,
      schoolLogoBuffer,
    } = req.body;

    const requiredFields = {
      firstName,
      lastName,
      email,
      phone,
      schoolName,
      displayName,
      country,
      state,
      city,
      pincode,
      address,
      startDate,
      endDate,
      academicYear,
      branchName,
      branchEmail,
      branchPassword,
      classes,
      schoolLogoBuffer,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
    }

    const existingUser = await Auth.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or phone number already exists" });
    }

    // Upload school logo
    let schoolLogo = "";
    try {
      const uploadResponse = await cloudinary.uploader.upload(
        `data:image/png;base64,${schoolLogoBuffer}`,
        { folder: "School Logos" }
      );
      schoolLogo = uploadResponse.secure_url;
    } catch (error) {
      return res.status(500).json({ message: "Logo upload failed: " + error.message });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(branchPassword, 10);

    const newSchoolAdmin = new Auth({
      firstName,
      lastName,
      email,
      phone,
      schoolName,
      displayName,
      country,
      state,
      city,
      pincode,
      address,
      startDate,
      endDate,
      academicYear,
      branchName,
      branchEmail,
      branchPassword: hashedPassword,
      branches: [],
      classes,
      isVerified: true,
      schoolLogo,
    });

    await newSchoolAdmin.save();

    return res.status(201).json({
      message: "School created successfully",
      userId: newSchoolAdmin._id,
      schoolName: newSchoolAdmin.schoolName,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Get All Schools With Full Details
const getFullSchools = async (req, res) => {
  try {
    const allSchools = await Auth.find({ role: 'schooladmin' })
      .populate({
        path: 'academicYear',
        model: 'AcademicYear',
        select: 'name startDate endDate',
      })
      .populate({
        path: 'classes',
        model: 'Class',
        select: 'name subjects',
      })
      .lean();

    return res.status(200).json({
      message: "Schools retrieved successfully",
      allSchools,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
};

// SchoolAdminController.js
const getAllSchools = async (req, res) => {
  try {
    const schools = await Auth.find({}, 'name schoolName');

    res.status(200).json({
      status: "success",
      data: schools
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};


const getSchoolById = async (req, res) => {
  try {
    const { schoolId } = req.params;
        
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid School Id format" 
      });
    }
    
    const school = await Auth.findById(schoolId);
    
    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: "School not found" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "School fetched successfully", 
      data: school 
    });
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};






module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  getAllSchools,
  getFullSchools,
  getSchoolById,
  loginWithEmailPassword,
  createSchoolAdminBySuperAdmin
};
