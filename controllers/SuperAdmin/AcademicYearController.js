const mongoose = require("mongoose");
const academicYearSchema = require("../../models/SuperAdmin/academicYearModel");
const academicYearModel = require("../../models/SuperAdmin/academicYearModel");
const { json } = require("express");

class AcademicYearController {

    createAcademicYear = async (req, res) => {
        try {
            const { name, startDate, endDate, } = req.body;

            if (!name || !startDate || !endDate) {
                return res.status(400).json({
                    message: "Name, start date, end date, are required.",
                });
            }

            const existingAcademicYear = await academicYearSchema.findOne({ name });
            if (existingAcademicYear) {
                return res.status(400).json({ message: `${name} already exists.` });
            }


            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start) || isNaN(end)) {
                return res.status(400).json({ message: "Invalid date format." });
            }

            if (start >= end) {
                return res.status(400).json({
                    message: "End date must be after the start date.",
                });
            }

            const academicYear = await academicYearSchema.create({
                name,
                startDate: start,
                endDate: end,
            });

            return res.status(201).json({
                message: "Academic Year created successfully",
                academicYear,
            });

        } catch (error) {
            console.error("Error creating academic year:", error.message);
            return res.status(500).json({ message: "Server error: " + error.message });
        }
    };

    getAcademicYearDropdown = async (req, res) => {
        try {
            const academicYears = await academicYearSchema
                .find()
                .select('_id name');

            if (!academicYears || academicYears.length === 0) {
                return res.status(404).json({ message: "No Academic Year found!" });
            }

            return res.status(201).json({
                data: academicYears,
            });

        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ message: error.message });
        }
    };

    getAllAcademicYear = async (req, res) => {
        try {
            let { page = 1, limit = 10 } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);
            const skip = (page - 1) * limit;

            const allAcademicYear = await academicYearSchema
                .find()
                .sort({ startDate: -1 })
                .skip(skip)
                .limit(limit)

            if (!allAcademicYear || allAcademicYear.length === 0) {
                return res.status(404).json({ message: "No Academic Year Found!" });
            }

            const totalRecords = await academicYearSchema.countDocuments();

            return res.status(200).json({
                message: "Academic Years fetched successfully!",
                page,
                limit,
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit),
                data: allAcademicYear
            });

        } catch (error) {
            console.error("Error fetching academic years:", error);
            return res.status(500).json({ message: error.message });
        }
    };

    // Update AcademicYear 
    updateAcademicYear = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, startDate, endDate } = req.body;

            if (!id) {
                return res.status(400).json({ message: "Academic Year ID is required!" });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid Academic Year ID!" });
            }

            if (!name || !startDate || !endDate) {
                return res.status(400).json({ message: "Name, Start Date, and End Date are required!" });
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start) || isNaN(end)) {
                return res.status(400).json({ message: "Invalid date format for start or end date." });
            }

            if (start >= end) {
                return res.status(400).json({ message: "Start Date must be before End Date." });
            }

            const nameExists = await academicYearModel.findOne({ name, _id: { $ne: id } });
            if (nameExists) {
                return res.status(409).json({ message: "An academic year with this name already exists." });
            }

            const updated = await academicYearModel.findByIdAndUpdate(
                id,
                {
                    name,
                    startDate: start,
                    endDate: end,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!updated) {
                return res.status(404).json({ message: "Academic Year not found." });
            }

            return res.status(200).json({
                message: "Academic Year updated successfully.",
                data: updated,
            });

        } catch (error) {
            console.error("Update Academic Year Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    //Academic Year By  Id
    academicYearById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: "Academic Year ID is required!" });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid Academic Year ID!" });
            }

            const academicYear = await academicYearModel.findById(id);

            if (!academicYear) {
                return res.status(404).json({ message: "Academic Year not found!" });
            }

            return res.status(200).json({
                message: "Academic Year fetched successfully!",
                data: academicYear,
            });
        } catch (error) {
            console.error("Error fetching Academic Year:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };


    // Delete AcademicYear
    deleteAcademicYear = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: "Academic Year Id is required !" });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid academic year Id !" });
            }

            const deletedAcademicYear = await academicYearModel.findByIdAndDelete(id);

            if (!deletedAcademicYear) {
                return res.status(404).json({ message: "Academic Year not found!" });
            }

            return res.status(200).json({ message: "Academic Year deleted successfully!" });

        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ message: "Internal server error." });

        }
    }

}

module.exports = new AcademicYearController();
