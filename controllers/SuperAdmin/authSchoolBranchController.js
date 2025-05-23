const jwt = require("jsonwebtoken");
const SchoolAdmin = require("../../models/SuperAdmin/authSchoolBranchModel");
const schoolSchema = require("../../models/SuperAdmin/schoolModel")
const cloudinary = require("../../config/cloudinary");
const mongoose = require("mongoose");
const gradeModel = require("../../models/SuperAdmin/gradeModel");
const schoolModel = require("../../models/SuperAdmin/schoolModel");
const classModel = require("../../models/SuperAdmin/classModel");
const UnitModel = require("../../models/SchoolAdmin/ContentCreateModels/UnitModel");
const DayModel = require("../../models/SchoolAdmin/ContentCreateModels/DayModel");
const LessonModel = require("../../models/SchoolAdmin/ContentCreateModels/LessonModel");


const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
      school: user.school || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};


// Verify OTP and mark user as verified
const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, staticOtp } = req.body;

    const user = await SchoolAdmin.findOne({ "contact.phone": phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.staticOtp !== staticOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id, "schooladmin");

    res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.contact.email,
        phoneNumber: user.contact.phone,
        role: "schooladmin",
        schoolId: user.school,
        schoolName: user.name
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
      // You can optionally allow these to be passed in the request
      contentStarted,
      contentStartDate,
    } = req.body;

    // Basic validations
    if (!contact || typeof contact !== 'object') {
      return res.status(400).json({ message: "Contact information is required." });
    }
    if (!contact.email || typeof contact.email !== 'string' || !contact.email.trim()) {
      return res.status(400).json({ message: "Valid email is required." });
    }
    if (!contact.phone || typeof contact.phone !== 'string' || !contact.phone.trim()) {
      return res.status(400).json({ message: "Valid phone number is required." });
    }

    // Check duplicates
    const existingEmail = await SchoolAdmin.findOne({ "contact.email": contact.email.trim() });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const existingPhone = await SchoolAdmin.findOne({ "contact.phone": contact.phone.trim() });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already in use" });
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

    // Create new branch - ADD the contentStartData field here
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
      // Add contentStartData with provided values or defaults
      contentStartData: {
        contentStarted: contentStarted ?? false,
        contentStartDate: contentStartDate ? new Date(contentStartDate) : null
      }
    });

    const savedBranch = await newBranch.save();

    // Add branch ID to school
    const schoolDoc = await schoolSchema.findById(school);
    if (!schoolDoc) {
      return res.status(404).json({ message: "School not found." });
    }

    schoolDoc.branches.push(savedBranch._id);
    await schoolDoc.save();

    res.status(201).json({
      message: "Branch created successfully",
      branch: {
        id: savedBranch._id,
        name: savedBranch.name,
        displayName: savedBranch.displayName,
        logoUrl: savedBranch.branchLogo,
        role: savedBranch.role,
        // Include contentStartData in the response
        contentStartData: savedBranch.contentStartData
      }
    });
  } catch (error) {
    console.error("Error creating branch:", error.message);
    res.status(500).json({ message: error.message });
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

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.contact.email,
        phoneNumber: user.contact.phone,
        role: "schooladmin",
        name: user.name,
        schoolId: user.school,
        schoolName: user.displayName,
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
      .limit(limit)
      .lean(); // Use lean to modify returned objects directly

    if (!branches || branches.length === 0) {
      return res.status(404).json({ message: "No branches found" });
    }

    const totalBranches = await SchoolAdmin.countDocuments(query);


    return res.status(200).json({
      message: "Branches fetched successfully",
      page: Number(page),
      limit: Number(limit),
      totalBranches,
      totalPages: Math.ceil(totalBranches / limit),
      data: branches,
    });
  } catch (error) {
    console.error("Error in getallBranches:", error.message);
    res.status(500).json({ error: error.message });
  }
};


const DeleteBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    const branch = await SchoolAdmin.findByIdAndDelete(branchId);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    await schoolModel.updateMany(
      { branches: branchId },
      { $pull: { branches: branchId } }
    )
    return res.status(200).json({ message: "Branch deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

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

    const branch = await SchoolAdmin.findById(branchId)
      .populate("school", "_id name");


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


const calculateDayVisibility = async (branchId) => {
  try {
    // Get branch details
    const branch = await SchoolAdmin.findById(branchId);
    if (!branch || !branch.contentStartData || !branch.contentStartData.contentStarted) {
      return false;
    }

    const startDate = new Date(branch.contentStartData.contentStartDate);
    if (!startDate) return false;

    // Get all classes for this branch
    const classes = await classModel.find({ branch: branchId, isActive: true });

    for (const classObj of classes) {
      // Get all units for this class
      const units = await UnitModel.find({ classId: classObj._id }).sort({ startDayNumber: 1 });

      let currentDate = new Date(startDate);
      let currentDayNumber = 1;

      for (const unit of units) {
        // Get days for this unit
        const days = await DayModel.find({ unitId: unit._id }).sort({ globalDayNumber: 1 });

        // If no days exist, create them
        if (days.length === 0) {
          const totalDays = unit.totalDays;
          const newDays = [];

          for (let i = 0; i < totalDays; i++) {
            // Skip weekends (Saturday and Sunday)
            while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
              currentDate = new Date(currentDate);
              currentDate.setDate(currentDate.getDate() + 1);
            }

            const weekNumber = Math.ceil(i / 5) + (unit.startDayNumber ? Math.floor(unit.startDayNumber / 5) : 0);

            newDays.push({
              unitId: unit._id,
              globalDayNumber: currentDayNumber,
              week: weekNumber,
              calendarDate: new Date(currentDate),
              isVisible: new Date() >= currentDate
            });

            currentDayNumber++;
            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() + 1);
          }

          if (newDays.length > 0) {
            await Day.insertMany(newDays);
          }
        } else {
          // Update existing days
          for (const day of days) {
            // Skip weekends (Saturday and Sunday)
            while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
              currentDate = new Date(currentDate);
              currentDate.setDate(currentDate.getDate() + 1);
            }

            day.calendarDate = new Date(currentDate);
            day.isVisible = new Date() >= currentDate;
            await day.save();

            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error calculating day visibility:", error);
    return false;
  }
};



const updateBranchContentSettings = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { contentStarted, contentStartDate } = req.body;

    // Use findByIdAndUpdate instead of findById and manual save
    const updatedBranch = await SchoolAdmin.findByIdAndUpdate(
      branchId,
      {
        $set: {
          'contentStartData.contentStarted': contentStarted === "true" || contentStarted === true ? true : false,
          'contentStartData.contentStartDate': contentStartDate ? new Date(contentStartDate) : null
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    // If content is started, calculate and update the day visibility
    if (contentStarted && contentStartDate) {
      await calculateDayVisibility(branchId);
    }

    return res.status(200).json({
      success: true,
      message: "Branch content settings updated",
      data: updatedBranch.contentStartData
    });
  } catch (error) {
    console.error("Error updating branch content settings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update branch content settings",
      error: error.message
    });
  }
};

const searchBySchoolName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "School name is required" });
    }

    const matchedSchools = await schoolModel.find({
      schoolName: { $regex: name, $options: "i" },
    }).populate({
      path: "branches",
      model: "SchoolAdmin",
    });

    if (!matchedSchools.length) {
      return res.status(404).json({ message: "No school found" });
    }

    return res.status(200).json({
      message: "Schools with branches fetched successfully",
      data: matchedSchools,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: error.message });
  }
};



const getBranchContent = async (req, res) => {
  try {
    const { branchId } = req.params;
    const branch = await mongoose.model("SchoolAdmin").findById(branchId)
      .populate({
        path: 'classes',
        populate: {
          path: 'units',
          populate: {
            path: 'days',
            match: { isVisible: true },
            populate: 'lessons'
          }
        }
      });

    // 2. Check content start date
    const today = new Date();
    const startDate = new Date(branch.contentStartData.contentStartDate);

    if (today < startDate) {
      return res.json({
        success: true,
        message: `Content starts on ${startDate.toLocaleDateString()}`,
        data: { classes: [], units: [], days: [], lessons: [] }
      });
    }

    // 3. Calculate working days (Mon-Fri only)
    let workingDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      const day = currentDate.getDay(); // 0=Sun, 6=Sat
      if (day !== 0 && day !== 6) workingDays++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 4. Prepare response
    const response = { classes: [], units: [], days: [], lessons: [] };
    let totalDaysProcessed = 0;

    branch.classes.forEach(cls => {
      response.classes.push(cls._id);

      cls.units?.forEach(unit => {
        if (totalDaysProcessed < workingDays) {
          response.units.push(unit._id);

          unit.days?.forEach(day => {
            if (day.globalDayNumber <= workingDays) {
              response.days.push(day._id);
              response.lessons.push(...(day.lessons || []));
            }
          });
        }
        totalDaysProcessed += unit.totalDays;
      });
    });

    return res.json({ success: true, data: response });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Helper function
function formatResponse(classes, includeAll = false) {
  const result = {
    classes: [],
    units: [],
    days: [],
    lessons: []
  };

  classes.forEach(cls => {
    if (!cls) return;
    result.classes.push(cls._id);

    if (cls.units && includeAll) {
      cls.units.forEach(unit => {
        if (!unit) return;
        result.units.push(unit._id);

        if (unit.days) {
          unit.days.forEach(day => {
            if (!day) return;
            result.days.push(day._id);

            if (day.lessons) {
              day.lessons.forEach(lesson => {
                result.lessons.push(lesson._id);
              });
            }
          });
        }
      });
    }
  });

  return result;
}

// Helper function to format response
function formatResponse(classes, showAll = false) {
  const classIds = classes.map(c => c._id);
  const unitIds = [];
  const dayIds = [];
  const lessonIds = [];

  classes.forEach(cls => {
    if (cls.units && cls.units.length) {
      cls.units.forEach(unit => {
        unitIds.push(unit._id);

        if (unit.days && unit.days.length) {
          unit.days.forEach(day => {
            if (showAll || day.isVisible) {
              dayIds.push(day._id);

              if (day.lessons && day.lessons.length) {
                day.lessons.forEach(lesson => {
                  lessonIds.push(lesson._id);
                });
              }
            }
          });
        }
      });
    }
  });

  return {
    classes: classIds,
    units: unitIds,
    days: dayIds,
    lessons: lessonIds
  };
}

// Helper function to process content visibility
function processContentVisibility(classes, daysSinceStart) {
  let cumulativeDays = 0;
  const result = {
    classes: classes.map(c => c._id),
    units: [],
    days: [],
    lessons: []
  };

  // Flatten all units while maintaining order
  const allUnits = [];
  classes.forEach(cls => {
    if (cls.units && cls.units.length) {
      cls.units.forEach(unit => {
        allUnits.push({
          ...unit,
          classId: cls._id
        });
      });
    }
  });

  // Sort units by startDayNumber or creation date
  allUnits.sort((a, b) => {
    if (a.startDayNumber !== undefined && b.startDayNumber !== undefined) {
      return a.startDayNumber - b.startDayNumber;
    }
    return a._id.toString().localeCompare(b._id.toString());
  });

  // Find current unit and days to show
  for (const unit of allUnits) {
    if (cumulativeDays + unit.totalDays > daysSinceStart) {
      result.units.push(unit._id);

      const daysCompletedInUnit = daysSinceStart - cumulativeDays;
      const daysToShow = Math.min(5, unit.totalDays - daysCompletedInUnit);

      // Get visible days sorted by globalDayNumber
      const visibleDays = unit.days
        .filter(day => day.isVisible)
        .sort((a, b) => a.globalDayNumber - b.globalDayNumber)
        .slice(0, daysToShow);

      visibleDays.forEach(day => {
        result.days.push(day._id);
        if (day.lessons && day.lessons.length) {
          day.lessons.forEach(lesson => {
            result.lessons.push(lesson._id);
          });
        }
      });

      return result;
    }
    cumulativeDays += unit.totalDays;
    result.units.push(unit._id); // Include all completed units
  }

  // All content completed - return everything
  return formatResponse(classes, true);
}
const updateBranch = async (req, res) => {
  try {
    const branchId = req.params.branchId;
    const updateBranch = req.body;

    console.log(updateBranch, branchId);

    const updatedBranch = await SchoolAdmin.findByIdAndUpdate(branchId, updateBranch, { new: true });

    if (!updatedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    return res.status(200).json({ success: true, message: "Branch updated successfully", data: updatedBranch });
  } catch (error) {
    console.error("Error updating branch:", error);
    return res.status(500).json({ message: error.message });
  }
}

const schoolBranchDropDown = async(req,res) =>{
  try {
  } catch (error) {
    console.log(error);
  }
}



module.exports = {
  DeleteBranch,
  updateBranch,
  verifyOtp,
  loginUser,
  getAllSchools,
  getFullSchools,
  getBranchesBySchoolId,
  getallBranches,
  createSchoolBranch,
  loginWithEmailPassword,
  getBranchesById,
  searchBySchoolName,
  updateBranchContentSettings,
  getBranchContent,
  // createSchoolAdminBySuperAdmin
};
