const DayModel = require('../../../models/SchoolAdmin/ContentCreateModels/DayModel');
const UnitModel = require('../../../models/SchoolAdmin/ContentCreateModels/UnitModel');
const authSchoolBranchModel = require('../../../models/SuperAdmin/authSchoolBranchModel');
const SchoolAdmin = require('../../../models/SuperAdmin/authSchoolBranchModel');
const classModel = require('../../../models/SuperAdmin/classModel');


const getDayByUnitId = async (req, res)=>{
    const {unitId} = req.params;
    try {
        const day = await DayModel.find({unitId}).select("globalDayNumber");
        if(!day) return res.status(404).json({success:false,message:"Day not found"});
        res.status(200).json({success:true,data:day});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
}


const updateDayVisibility = async () => {
    try {
        // Get all active branches
        const branches = await authSchoolBranchModel.find({
            isActive: true,
            'contentStartData.contentStarted': true,
            'contentStartData.contentStartDate': { $ne: null }
        });

        for (const branch of branches) {
            // Update visibility for each branch
            await calculateDayVisibility(branch._id);
        }

        console.log(`Updated day visibility for ${branches.length} branches`);
    } catch (error) {
        console.error("Error in scheduled visibility update:", error);
    }
};


/**
 * Calculates which days should be visible based on the branch's content start date
 */
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
                        await DayModel.insertMany(newDays);
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

module.exports = {
    getDayByUnitId,
    calculateDayVisibility,
    updateDayVisibility
}