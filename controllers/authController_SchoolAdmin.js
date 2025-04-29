const jwt = require("jsonwebtoken");
const Auth = require("../models/authModel_SchoolAdmin");
const cloudinary = require("../config/cloudinary");

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

    const user = await Auth.findOne({ phoneNumber });
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
        phoneNumber: user.phoneNumber,
        role: user.role,
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

    const user = await Auth.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) return res.status(403).json({ message: "User not verified" });

    // Generate new OTP (for now hardcoded)
    user.staticOtp = "123456";
    await user.save();

    res.status(200).json({ message: "OTP sent successfully",otp:user.staticOtp }); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Auth.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) return res.status(403).json({ message: "User not verified" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register by SuperAdmin
const createSchoolAdminBySuperAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      schoolName,
      displayName,
      phone,
      country,
      state,
      city,
      pincode,
      address,
      startDate,
      endDate,
      academicYear,
      branchName,
      branchPhone,
      branchEmail,
      branches,
      classes,
      schoolLogoBuffer
    } = req.body;

    // Check if user already exists
    const existingUser = await Auth.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });
    
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or phone number already exists" });
    }

    let schoolLogoUrl = "";
    if (schoolLogoBuffer) {
      // Upload base64 image buffer to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(
        `data:image/png;base64,${schoolLogoBuffer}`,
        { folder: "school_logos" }
      );
      schoolLogoUrl = uploadResponse.secure_url;
    }

    // Create new school admin user
    const newUser = await Auth.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      schoolName,
      displayName,
      phone,
      country,
      state,
      city,
      pincode,
      address,
      startDate,
      endDate,
      academicYear,
      branchName,
      branchPhone,
      branchEmail,
      branches,
      classes,
      isVerified: true,
      schoolLogo: schoolLogoUrl || ""
    });

    res.status(201).json({
      message: "SchoolAdmin registered successfully",
      userId: newUser._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// SchoolAdminController.js
const getAllSchools = async (req, res) => {
  try {
    const schools = await Auth.find({}, 'name schoolName'); // Just get name and _id
    
    res.status(200).json({
      status: "success",
      data: schools
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};





module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  getAllSchools,
  loginWithEmailPassword,
  createSchoolAdminBySuperAdmin
};
