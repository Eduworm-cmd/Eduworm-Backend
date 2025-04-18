const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const studentModel = require("../models/studentModel");

// Helper function to upload base64 image to Cloudinary
const uploadBase64ToCloudinary = async (base64Data) => {
  try {
    if (!base64Data) return null;
    
    // Upload to Cloudinary directly from base64
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "student_photos",
      use_filename: true,
      unique_filename: true
    });
    
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Image upload failed");
  }
};

const studentController = {
  // Create a new student
  createStudent: async (req, res) => {
    try {
      const {
        firstName, lastName, dateOfBirth, gender, 
        school, rollNo, admissionNumber, dateOfJoining, 
        bloodGroup, enrollmentStatus, uniqueId,
        currentClass, photo
      } = req.body;
      
      // Parse JSON strings if they come as strings
      let parsedCurrentClass = currentClass;
      if (typeof currentClass === 'string') {
        parsedCurrentClass = JSON.parse(currentClass);
      }
      
      let parents = [];
      if (req.body.parents) {
        // If parents come as a JSON string
        if (typeof req.body.parents === 'string') {
          parents = JSON.parse(req.body.parents);
        } 
        // If parents come as array already
        else if (Array.isArray(req.body.parents)) {
          parents = req.body.parents;
        }
      }
      
      // Handle student photo upload (base64)
      let studentPhotoUrl = null;
      if (photo) {
        studentPhotoUrl = await uploadBase64ToCloudinary(photo);
      }
      
      // Handle parent photos upload (base64)
      const processedParents = [];
      for (let i = 0; i < parents.length; i++) {
        const parent = typeof parents[i] === 'string' ? JSON.parse(parents[i]) : parents[i];
        let parentPhotoUrl = null;
        
        // Check if there's a photo for this parent
        const parentPhotoKey = `parentPhoto${i}`;
        if (req.body[parentPhotoKey]) {
          parentPhotoUrl = await uploadBase64ToCloudinary(req.body[parentPhotoKey]);
        }
        
        processedParents.push({
          ...parent,
          photo: parentPhotoUrl
        });
      }
      
      const student = new studentModel({
        firstName,
        lastName,
        dateOfBirth,
        gender,
        school,
        rollNo,
        admissionNumber,
        dateOfJoining,
        bloodGroup,
        enrollmentStatus,
        uniqueId,
        photo: studentPhotoUrl,
        currentClass: parsedCurrentClass,
        parents: processedParents,
        branch: req.body.branch, // Branch ID from authenticated session
        isActive: true // Default to active when creating
      });
      
      await student.save();
      
      // Update Branch model to add this student
      const Branch = require("../models/branchModel");
      await Branch.findByIdAndUpdate(
        req.body.branch,
        { $push: { students: student._id } }
      );
      
      res.status(201).json({ success: true, data: student });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Get a single student by ID
  getStudent: async (req, res) => {
    try {
      const studentId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ success: false, message: "Invalid student ID format" });
      }
      
      const student = await studentModel.findById(studentId)
        .populate('school', 'name displayName') // Optional: populate related school/branch info
        .exec();
      
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
      
      res.status(200).json({ success: true, data: student });
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Get all students with filtering and pagination
  getAllStudents: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        branch, 
        grade, 
        section, 
        name, 
        enrollmentStatus,
        isActive 
      } = req.query;
      
      // Build filter object
      const filter = {};
      
      if (branch) filter.branch = branch;
      if (grade) filter['currentClass.grade'] = grade;
      if (section) filter['currentClass.section'] = section;
      if (enrollmentStatus) filter.enrollmentStatus = enrollmentStatus;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      // Handle name search (search in both firstName and lastName)
      if (name) {
        filter.$or = [
          { firstName: { $regex: name, $options: 'i' } },
          { lastName: { $regex: name, $options: 'i' } }
        ];
      }
      
      // Execute query with pagination
      const students = await studentModel.find(filter)
        .populate('school', 'name displayName')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .exec();
      
      // Get total count for pagination
      const totalCount = await studentModel.countDocuments(filter);
      
      res.status(200).json({
        success: true,
        data: students,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Update an existing student
  updateStudent: async (req, res) => {
    try {
      const studentId = req.params.id;
      const updateData = { ...req.body };
      
      // Find the existing student first
      const existingStudent = await studentModel.findById(studentId);
      if (!existingStudent) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
      
      // Handle student photo upload if there's a new one (base64)
      if (updateData.photo) {
        updateData.photo = await uploadBase64ToCloudinary(updateData.photo);
      }
      
      // Handle parent information updates
      if (updateData.parents) {
        let parsedParents;
        
        // Parse if string, use as is if array
        if (typeof updateData.parents === 'string') {
          parsedParents = JSON.parse(updateData.parents);
        } else if (Array.isArray(updateData.parents)) {
          parsedParents = updateData.parents;
        } else {
          parsedParents = [];
        }
        
        const processedParents = [];
        
        for (let i = 0; i < parsedParents.length; i++) {
          const parent = typeof parsedParents[i] === 'string' 
            ? JSON.parse(parsedParents[i]) 
            : parsedParents[i];
            
          let parentPhotoUrl = parent.photo; // Keep existing photo
          
          // If there's a new photo for this parent (base64)
          const parentPhotoKey = `parentPhoto${i}`;
          if (updateData[parentPhotoKey]) {
            parentPhotoUrl = await uploadBase64ToCloudinary(updateData[parentPhotoKey]);
            // Remove the base64 data from updateData after processing
            delete updateData[parentPhotoKey];
          }
          
          processedParents.push({
            ...parent,
            photo: parentPhotoUrl
          });
        }
        
        updateData.parents = processedParents;
      }
      
      // If currentClass is provided as a string, parse it
      if (updateData.currentClass && typeof updateData.currentClass === 'string') {
        updateData.currentClass = JSON.parse(updateData.currentClass);
      }
      
      const updatedStudent = await studentModel.findByIdAndUpdate(
        studentId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      res.status(200).json({ success: true, data: updatedStudent });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Delete a student
  deleteStudent: async (req, res) => {
    try {
      const studentId = req.params.id;
      
      // Find the student to get their branch before deletion
      const student = await studentModel.findById(studentId);
      
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
      
      const branchId = student.branch;
      
      // Delete the student
      await studentModel.findByIdAndDelete(studentId);
      
      // Remove the student from the branch's students array
      const Branch = require("../models/branchModel");
      await Branch.findByIdAndUpdate(
        branchId,
        { $pull: { students: studentId } }
      );
      
      res.status(200).json({ 
        success: true, 
        message: "Student deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Activate or deactivate student account
  toggleStudentStatus: async (req, res) => {
    try {
      const studentId = req.params.id;
      const { isActive } = req.body;
      
      if (isActive === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: "isActive status is required" 
        });
      }
      
      const updatedStudent = await studentModel.findByIdAndUpdate(
        studentId,
        { isActive: Boolean(isActive) },
        { new: true }
      );
      
      if (!updatedStudent) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
      
      const statusMessage = updatedStudent.isActive ? "activated" : "deactivated";
      
      res.status(200).json({
        success: true,
        message: `Student account ${statusMessage} successfully`,
        data: updatedStudent
      });
    } catch (error) {
      console.error("Error toggling student status:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Bulk activate/deactivate students
  bulkToggleStatus: async (req, res) => {
    try {
      const { studentIds, isActive } = req.body;
      
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Student IDs array is required" 
        });
      }
      
      if (isActive === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: "isActive status is required" 
        });
      }
      
      const result = await studentModel.updateMany(
        { _id: { $in: studentIds } },
        { $set: { isActive: Boolean(isActive) } }
      );
      
      const statusMessage = isActive ? "activated" : "deactivated";
      
      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} student accounts ${statusMessage} successfully`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error("Error in bulk toggle student status:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Get student stats by branch
  getStudentStats: async (req, res) => {
    try {
      const { branch } = req.query;
      
      if (!branch) {
        return res.status(400).json({ 
          success: false, 
          message: "Branch ID is required" 
        });
      }
      
      const stats = await studentModel.aggregate([
        { $match: { branch: mongoose.Types.ObjectId(branch) } },
        { $group: {
            _id: {
              grade: "$currentClass.grade",
              isActive: "$isActive"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.grade": 1 } }
      ]);
      
      // Reformat the stats for easier consumption
      const formattedStats = {};
      stats.forEach(stat => {
        const grade = stat._id.grade;
        const isActive = stat._id.isActive;
        
        if (!formattedStats[grade]) {
          formattedStats[grade] = { active: 0, inactive: 0, total: 0 };
        }
        
        if (isActive) {
          formattedStats[grade].active = stat.count;
        } else {
          formattedStats[grade].inactive = stat.count;
        }
        
        formattedStats[grade].total += stat.count;
      });
      
      res.status(200).json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      console.error("Error getting student stats:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = studentController;