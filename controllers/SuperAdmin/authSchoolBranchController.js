const jwt = require("jsonwebtoken");
const SchoolAdmin = require("../../models/SuperAdmin/authSchoolBranchModel");
const cloudinary = require("../../config/cloudinary");
const { default: mongoose } = require("mongoose");


const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};


const loginBranch = async (req, res)=>{
  const { email, branchPassword } = req.body;

  try {
    const existBranch = await SchoolAdmin.findOne({"contact.email": email}).select("+branchPassword");
    if(!existBranch)
    {
      return res.status(400).json({ message: 'Branch not found' });
    }
 const isMatch = await existBranch.comparePassword(branchPassword);
 if(!isMatch)
 {
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
    console.error(error,"Login error");
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



const createSchoolBranch = async (req, res) => {
  try {
    const {
      BranchId,  // Added this to match what's being passed
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

    // ✅ Contact validation - more thorough validation
    if (!contact || typeof contact !== 'object') {
      return res.status(400).json({ error: "Contact information is required." });
    }

    if (!contact.email || typeof contact.email !== 'string' || !contact.email.trim()) {
      return res.status(400).json({ error: "Valid email is required." });
    }

    if (!contact.phone || typeof contact.phone !== 'string' || !contact.phone.trim()) {
      return res.status(400).json({ error: "Valid phone number is required." });
    }

    // ✅ Check if email already exists
    const existingEmail = await SchoolAdmin.findOne({ "contact.email": contact.email.trim() });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // ✅ Check if phone already exists
    const existingPhone = await SchoolAdmin.findOne({ "contact.phone": contact.phone.trim() });
    if (existingPhone) {
      return res.status(409).json({ error: "Phone number already in use" });
    }

    // ✅ Ensure BranchId is unique
    if (BranchId) {
      const existingBranch = await SchoolAdmin.findOne({ BranchId });
      if (existingBranch) {
        return res.status(409).json({ error: "Branch ID already exists" });
      }
    }

    console.log("Creating branch...", req.body);

    // ✅ Create new school branch
    const newBranch = new SchoolAdmin({
      BranchId,  // Include this in the creation
      school,
      name,
      displayName,
      location,
      contact: {
        email: contact.email.trim(),
        phone: contact.phone.trim()
      },
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
    });

    const savedBranch = await newBranch.save();

    res.status(201).json({
      message: "Branch created successfully",
      branch: {
        id: savedBranch._id,
        BranchId: savedBranch.BranchId,
        name: savedBranch.name,
        displayName: savedBranch.displayName
      }
    });
  } catch (error) {
    console.error("Branch creation error:", error);

    // More descriptive error messages
    if (error.code === 11000) {
      const fieldName = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        error: `Duplicate value for ${fieldName}`,
        details: `The ${fieldName} value already exists in the database.`
      });
    }

    res.status(500).json({
      error: "Failed to create branch",
      details: error.message,
    });
  }
};






// Controller function for login
const loginWithEmailPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);
    console.log("Password provided:", password); 

    const user = await Auth.findOne({ branchEmail: email });

    if (!user) return res.status(404).json({ message: "User not found" });
   
    if (!user.isVerified) return res.status(403).json({ message: "User not verified" });

    // Log the stored hashed password for debugging
    console.log("Stored hashed password:", user.branchPassword);

    try {
      // Debug the bcrypt comparison
      const isMatch = await user.comparePassword(password)
      console.log("Password comparison result:", isMatch);

      if (!isMatch) {
      //   // TEMPORARY WORKAROUND: If you need to bypass password check temporarily
      //   // Comment the next line and uncomment the workaround below
        return res.status(400).json({ message: "Invalid credentials" });

      //   // TEMPORARY WORKAROUND - REMOVE IN PRODUCTION
        console.log("WARNING: Bypassing password check for testing!");
      }

      console.log("Authentication successful");

      const token = generateToken(user._id, user.role);

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.branchEmail,
          phoneNumber: user.phone, 
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


const getSchoolById = async (req, res) => {
  try {
    const { schoolId } = req.params;
        
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid School Id format" 
      });
    }
    
    const school = await SchoolAdmin.findById(schoolId);
    
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
  verifyOtp,
  loginUser,
  getAllSchools,
  getFullSchools,
  getSchoolById,
  loginBranch,
  createSchoolBranch,
  loginWithEmailPassword,
  // createSchoolAdminBySuperAdmin
};
