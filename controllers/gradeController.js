// controllers/gradeController.js
const Grade = require('../models/Grade');

// Create a new grade
exports.createGrade = async (req, res) => {
  try {
    const { name, type, minAge, maxAge, school, level } = req.body;
    
    const grade = new Grade({
      name,
      type,
      minAge,
      maxAge,
      school,
      level,
      createdBy: req.user.id  // Current authenticated user
    });

    const savedGrade = await grade.save();
    
    // Populate relevant fields for response
    await savedGrade.populate([
      { path: 'school', select: 'name' },
      { path: 'level', select: 'name' },
      { path: 'createdBy', select: 'name role' }
    ]);
    
    res.status(201).json({
      success: true,
      data: savedGrade
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all grades
exports.getAllGrades = async (req, res) => {
  try {
    let query = {};
    
    // If schooladmin, only show grades for their school
    if (req.user.role === 'schooladmin') {
      query.school = req.user.schoolId;
    }
    
    const grades = await Grade.find(query)
      .populate('school', 'name')
      .populate('level', 'name')
      .populate('createdBy', 'name role')
      .populate('updatedBy', 'name role')
      .sort('name');
    
    res.status(200).json({
      success: true,
      count: grades.length,
      data: grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single grade
exports.getGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('school', 'name')
      .populate('level', 'name')
      .populate('createdBy', 'name role')
      .populate('updatedBy', 'name role');
    
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }
    
    // Check if schooladmin has access to this grade
    if (req.user.role === 'schooladmin' && grade.school._id.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this grade'
      });
    }
    
    res.status(200).json({
      success: true,
      data: grade
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update grade
exports.updateGrade = async (req, res) => {
  try {
    let grade = await Grade.findById(req.params.id);
    
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }
    
    // Check if schooladmin has access to this grade
    if (req.user.role === 'schooladmin' && grade.school.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this grade'
      });
    }
    
    // If level is being updated, only superadmin can do this
    if (req.body.level && req.user.role !== 'superadmin' && grade.level.toString() !== req.body.level) {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can change the level of a grade'
      });
    }
    
    // Update the grade and track who updated it
    req.body.updatedBy = req.user.id;
    
    grade = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'school', select: 'name' },
      { path: 'level', select: 'name' },
      { path: 'createdBy', select: 'name role' },
      { path: 'updatedBy', select: 'name role' }
    ]);
    
    res.status(200).json({
      success: true,
      data: grade
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete grade
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }
    
    // Check if schooladmin has access to this grade
    if (req.user.role === 'schooladmin' && grade.school.toString() !== req.user.schoolId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this grade'
      });
    }
    
    await grade.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};