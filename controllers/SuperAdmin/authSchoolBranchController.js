const jwt = require("jsonwebtoken");
const SchoolAdmin = require("../../models/SuperAdmin/authSchoolBranchModel");
const schoolSchema = require("../../models/SuperAdmin/schoolModel")
const cloudinary = require("../../config/cloudinary");
const mongoose = require("mongoose");


const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Remove
const loginBranch = async (req, res) => {
  const { email, branchPassword } = req.body;

  try {
    const existBranch = await SchoolAdmin.findOne({ "contact.email": email }).select("+branchPassword");
    if (!existBranch) {
      return res.status(400).json({ message: 'Branch not found' });
    }
    const isMatch = await existBranch.comparePassword(branchPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({
      id: existBranch._id,
      name: existBranch.name,
      school: existBranch.school,
    },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      })

    res.status(200).json({
      message: "Login successful",
      token,
      branch: {
        id: branch._id,
        name: branch.name,
        email: branch.contact.email,
        phone: branch.contact.phone,
        school: branch.school,
        location: branch.location,
      },
    });

  } catch (error) {
    console.error(error, "Login error");
    res.status(500).json({ message: error.message });
  }
}



// Register user with OTP
// const registerUser = async (req, res) => {
//   try {
//     const { firstName, lastName, phoneNumber, role, branches } = req.body;

//     const userExists = await Auth.findOne({ phoneNumber });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Generate OTP - in production use a random generator
//     const staticOtp = "123456";

//     const newUser = new Auth({
//       firstName,
//       lastName,
//       phoneNumber,
//       staticOtp,
//       role,
//       branches,
//       isVerified: false,
//     });

//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully. Please verify OTP.", userId: newUser._id });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Verify OTP and mark user as verified
const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, staticOtp } = req.body;

    const user = await SchoolAdmin.findOne({"contact.phone" : phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.staticOtp !== staticOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id, "schooladmin");

    res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        email: user.contact.email,
        phoneNumber: user.contact.phone,
        role: "schooladmin",
        schoolName: user.name,
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

    const user = await SchoolAdmin.findOne({ "contact.phone": phoneNumber });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate new OTP (for now hardcoded)
    user.staticOtp = "123456";
    await user.save();

    res.status(200).json({ message: "OTP sent successfully", otp: user.staticOtp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const createSchoolBranch = async (req, res) => {
  try {
    const {
      school,
      name,
      displayName,
      location,
      contact,
      affiliation_board,
      total_Students,
      total_Teachers,
      total_Staff,
      branchPassword,
      branchLogo,
      fees,
      startDate,
      endDate,
      classes,
      academicYear,
      isActive,
    } = req.body;

    // Basic validations
    if (!contact || typeof contact !== 'object') {
      return res.status(400).json({ error: "Contact information is required." });
    }
    if (!contact.email || typeof contact.email !== 'string' || !contact.email.trim()) {
      return res.status(400).json({ error: "Valid email is required." });
    }
    if (!contact.phone || typeof contact.phone !== 'string' || !contact.phone.trim()) {
      return res.status(400).json({ error: "Valid phone number is required." });
    }

    // Check duplicates
    const existingEmail = await SchoolAdmin.findOne({ "contact.email": contact.email.trim() });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const existingPhone = await SchoolAdmin.findOne({ "contact.phone": contact.phone.trim() });
    if (existingPhone) {
      return res.status(409).json({ error: "Phone number already in use" });
    }

    // Handle logo upload (base64, data URI, or URL)
    let branchLogoUrl = "";
    try {
      if (!branchLogo || branchLogo.length < 50) {
        throw new Error("Invalid or missing logo image data");
      }

      const isDataUri = branchLogo.startsWith("data:image/");
      const isUrl = branchLogo.startsWith("http");

      const uploadSource = isDataUri
        ? branchLogo
        : isUrl
          ? branchLogo
          : `data:image/png;base64,${branchLogo}`;

      const uploadResponse = await cloudinary.uploader.upload(uploadSource, {
        folder: "Branch Logos",
      });

      branchLogoUrl = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", JSON.stringify(uploadError, null, 2));
      return res.status(500).json({
        message: "Logo upload failed",
        details: uploadError?.message || uploadError?.error?.message || "Unknown error"
      });
    }

    // Create new branch
    const newBranch = new SchoolAdmin({
      school,
      name,
      displayName,
      location,
      contact: {
        email: contact.email.trim(),
        phone: contact.phone.trim(),
      },
      affiliation_board,
      total_Students,
      total_Teachers,
      total_Staff,
      branchPassword,
      branchLogo: branchLogoUrl,
      fees,
      startDate,
      endDate,
      classes,
      academicYear,
      isActive,
    });

    const savedBranch = await newBranch.save();

    // Add branch ID to school
    const schoolDoc = await schoolSchema.findById(school);
    if (!schoolDoc) {
      return res.status(404).json({ error: "School not found." });
    }

    schoolDoc.branches.push(savedBranch._id);
    await schoolDoc.save();

    res.status(201).json({
      message: "Branch created successfully",
      branch: {
        id: savedBranch._id,
        name: savedBranch.name,
        displayName: savedBranch.displayName,
        logoUrl: savedBranch.branchLogo
      }
    });
  } catch (error) {
    console.error("Error creating branch:", error.message);
    res.status(500).json({ error: error.message });
  }
};



// Controller function for login
const loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await SchoolAdmin.findOne({ "contact.email": email }).select("+branchPassword");

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, "schooladmin"); 

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.contact.email,
        phoneNumber: user.contact.phone,
        role: "schooladmin",
        name: user.name,
        displayName: user.displayName,
        school: user.school,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};



// Register by SuperAdmin Create School
// const createSchoolAdminBySuperAdmin = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       phone,
//       schoolName,
//       displayName,
//       country,
//       state,
//       city,
//       pincode,
//       address,
//       startDate,
//       endDate,
//       academicYear,
//       branchName,
//       branchEmail,
//       branchPassword,
//       classes,
//       schoolLogoBuffer,
//     } = req.body;

//     // Validate required fields
//     const requiredFields = {
//       firstName,
//       lastName,
//       email,
//       phone,
//       schoolName,
//       displayName,
//       country,
//       state,
//       city,
//       pincode,
//       address,
//       startDate,
//       endDate,
//       academicYear,
//       branchName,
//       branchEmail,
//       branchPassword,
//       classes,
//       schoolLogoBuffer,
//     };

//     const missingFields = Object.entries(requiredFields)
//       .filter(([_, value]) => !value)
//       .map(([key]) => key);

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         message: `Missing required fields: ${missingFields.join(", ")}`
//       });
//     }

//     // Check if email, phone, or branchEmail already exists
//     const existingUser = await Auth.findOne({
//       $or: [
//         { email },
//         { phone },
//         { branchEmail }
//       ]
//     });

//     if (existingUser) {
//       let conflictField = existingUser.email === email ? "Email" :
//                           existingUser.phone === phone ? "Phone number" :
//                           "Branch email";

//       return res.status(400).json({
//         message: `${conflictField} already exists`
//       });
//     }

//     // Upload school logo to Cloudinary
//     let schoolLogo = "";
//     try {
//       const uploadResponse = await cloudinary.uploader.upload(
//         `data:image/png;base64,${schoolLogoBuffer}`,
//         { folder: "School Logos" }
//       );
//       schoolLogo = uploadResponse.secure_url;
//     } catch (uploadError) {
//       return res.status(500).json({
//         message: "Logo upload failed: " + uploadError.message
//       });
//     }


//     // Create new school admin document
//     const newSchoolAdmin = new Auth({
//       firstName,
//       lastName,
//       email,
//       phone,
//       schoolName,
//       displayName,
//       country,
//       state,
//       city,
//       pincode,
//       address,
//       startDate,
//       endDate,
//       academicYear,
//       branchName,
//       branchEmail,
//       branchPassword,
//       branches: [],
//       classes,
//       isVerified: true,
//       schoolLogo,
//     });

//     // Save to database
//     await newSchoolAdmin.save();

//     return res.status(201).json({
//       message: "School created successfully",
//       userId: newSchoolAdmin._id,
//       schoolName: newSchoolAdmin.schoolName,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal server error: " + error.message
//     });
//   }
// };



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


const getallBranches = async (req, res) => {
  try {
    let { page = 1, limit = 10, schoolId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (schoolId) {
      query.school = schoolId;
    }

    const branches = await SchoolAdmin.find(query)
      .populate("academicYear", "name startYear endYear")
      .populate("classes", "className")
      .populate("school", "schoolName")
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);


    if (!branches || branches.length === 0) {
      return res.status(404).json({ message: "No branches found" });
    }

    const totalBranches = await SchoolAdmin.countDocuments(query);

    return res.status(200).json({
      message: "Branches fetched successfully",
      page,
      limit,
      totalBranches,
      totalPages: Math.ceil(totalBranches / limit), // Corrected calculation
      data: branches,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};


const getBranchesBySchoolId = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        message: "Invalid School Id format"
      });
    }

    const branches = await SchoolAdmin.find({ school: schoolId }).select("name _id");
    console.log(branches);

    if (!branches || branches.length === 0) {
      return res.status(404).json({
        message: "No branches found for this school"
      });
    }

    return res.status(200).json({
      message: "Branches fetched successfully",
      data: branches
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getBranchesById = async (req, res) => {
  try {
    const { branchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        message: "Invalid Branch Id format"
      });
    }

    const branch = await SchoolAdmin.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found"
      });
    }

    return res.status(200).json({
      message: "Branch fetched successfully",
      data: branch
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  verifyOtp,
  loginUser,
  getAllSchools,
  getFullSchools,
  getBranchesBySchoolId,
  getallBranches,
  loginBranch,
  createSchoolBranch,
  loginWithEmailPassword,
  getBranchesById,
  // createSchoolAdminBySuperAdmin
};
