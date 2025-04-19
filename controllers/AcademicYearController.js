const AcademicYear = require("../models/AcademicYearModel");
const Branch = require("../models/branchModel");
const School = require("../models/authModel_SchoolAdmin");

exports.createAcademicYear = async (req, res) => {
  try {
    const { name, startDate, endDate, branchId, schoolId } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        status: "fail",
        message: "End date must be after start date"
      });
    }

    // Create academic year
    const academicYear = await AcademicYear.create({
      name,
      startDate,
      endDate,
      branchId,
      schoolId
    });

    // Update branch with the new academic year
    await Branch.findByIdAndUpdate(
      branchId,
      { $push: { academicYear: academicYear._id } }
    );
    await School.findByIdAndUpdate(
        schoolId,
      { $push: { academicYear: academicYear._id } }
    );

    res.status(201).json({
      status: "success",
      data: academicYear
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

exports.getAllAcademicYears = async (req, res) => {
  try {
    const { schoolId, branchId } = req.query;
    
    const filter = {};
    if (schoolId) filter.schoolId = schoolId;
    if (branchId) filter.branchId = branchId;

    const academicYears = await AcademicYear.find(filter);

    res.status(200).json({
      status: "success",
      results: academicYears.length,
      data: academicYears
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

exports.getAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);

    if (!academicYear) {
      return res.status(404).json({
        status: "fail",
        message: "Academic year not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: academicYear
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

exports.updateAcademicYear = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Validate dates if both are provided
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        status: "fail",
        message: "End date must be after start date"
      });
    }

    const academicYear = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!academicYear) {
      return res.status(404).json({
        status: "fail",
        message: "Academic year not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: academicYear
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

exports.deleteAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);

    if (!academicYear) {
      return res.status(404).json({
        status: "fail",
        message: "Academic year not found"
      });
    }

    // Remove academic year reference from branch
    await Branch.findByIdAndUpdate(
      academicYear.branchId,
      { $pull: { academicYear: academicYear._id } }
    );
    await School.findByIdAndUpdate(
        academicYear.schoolId,
      { $push: { academicYear: academicYear._id } }
    );
    // Delete the academic year
    await AcademicYear.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Academic year deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);
    
    if (!academicYear) {
      return res.status(404).json({
        status: "fail",
        message: "Academic year not found"
      });
    }
    
    // Toggle the isActive status
    academicYear.isActive = !academicYear.isActive;
    await academicYear.save();
    
    res.status(200).json({
      status: "success",
      data: academicYear
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};