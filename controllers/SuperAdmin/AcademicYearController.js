const mongoose = require("mongoose");
const academicYearSchema = require("../../models/SuperAdmin/academicYearModel");

class AcademicYearController {

    createAcademicYear = async (req, res) => {
        try {
            const { name, startDate, endDate, } = req.body;

            if (!name || !startDate || !endDate) {
                return res.status(400).json({
                    message: "Name, start date, end date, are required.",
                });
            }

            const existingAcademicYear = await academicYearSchema.findOne({ name});
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


}

module.exports = new AcademicYearController();
