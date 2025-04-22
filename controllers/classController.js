const Class = require('../models/classModel');

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('school', 'name')
      .populate('branch', 'name')
      .populate('grade', 'name')
      .populate('academicYear', 'name')
      .populate('teacher', 'name');
    
    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single class
exports.getClassById = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('school', 'name')
      .populate('branch', 'name')
      .populate('grade', 'name')
      .populate('academicYear', 'name')
      .populate('teacher', 'name');
    
    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: classObj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new class
exports.createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    
    return res.status(201).json({
      success: true,
      data: newClass
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const classObj = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: classObj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    
    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    await classObj.remove();
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Toggle class active status
exports.toggleClassStatus = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    
    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    // Toggle the isActive status
    classObj.isActive = !classObj.isActive;
    await classObj.save();
    
    return res.status(200).json({
      success: true,
      data: classObj,
      message: `Class ${classObj.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};