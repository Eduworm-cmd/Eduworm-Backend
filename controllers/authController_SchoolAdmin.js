const jwt = require("jsonwebtoken");
const Auth = require("../models/authModel_SchoolAdmin");

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

    res.status(200).json({ message: "OTP sent successfully",otp:user.staticOtp }); // In prod: don't send OTP here
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
};
