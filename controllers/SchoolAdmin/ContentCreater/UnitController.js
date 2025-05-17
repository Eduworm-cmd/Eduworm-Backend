const DayModel = require("../../../models/SchoolAdmin/ContentCreateModels/DayModel");
const UnitModel = require("../../../models/SchoolAdmin/ContentCreateModels/UnitModel");
const classModel = require("../../../models/SuperAdmin/classModel");



const createUnit = async (req, res) => {
    try {
        const { classId, name, totalDays } = req.body;

        // Input validation
        if (!classId || !name || !totalDays) {
            return res.status(400).json({ success: false, message: "classId, name, and totalDays are required" });
        }

        // Check if class exists
        const existClass = await classModel.findById(classId);
        if (!existClass) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        // Get last unit of the class to determine startDayNumber
        const lastUnit = await UnitModel.find({ classId }).sort({ startDayNumber: -1 }).limit(1);
        const startDayNumber = lastUnit.length > 0 ? lastUnit[0].startDayNumber + lastUnit[0].totalDays : 1;

        // Create new unit
        const unit = await UnitModel.create({ classId, name, totalDays, startDayNumber });

        // Create associated days
        for (let i = 0; i < totalDays; i++) {
            await DayModel.create({ unitId: unit._id, globalDayNumber: startDayNumber + i });
        }

        return res.status(200).json({ success: true, message: "Unit created successfully", data: unit });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

const GetUnitsByClassId = async (req, res) => {
    try {
        const { classId } = req.params;

        const Class = await classModel.findById(classId);
        if (!Class) {
            return res.status(404).json({ error: "Class not found" });
        }

        // Just select the fields you need, no populate needed
        const units = await UnitModel.find({ classId }).select("name");
        if (!units || units.length === 0) {
            return res.status(404).json({ error: "Units not found" });
        }

        res.status(200).json({ success: true, data: units });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    createUnit,
    GetUnitsByClassId,
}