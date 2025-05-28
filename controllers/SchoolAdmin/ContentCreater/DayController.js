const { default: mongoose } = require('mongoose');
const DayModel = require('../../../models/SchoolAdmin/ContentCreateModels/DayModel');
const UnitModel = require('../../../models/SchoolAdmin/ContentCreateModels/UnitModel');
const authSchoolBranchModel = require('../../../models/SuperAdmin/authSchoolBranchModel');
const SchoolAdmin = require('../../../models/SuperAdmin/authSchoolBranchModel');
const classModel = require('../../../models/SuperAdmin/classModel');

// Helper function to get visible days for a unit - Complete weeks only
async function getVisibleDaysForUnit(unit, totalVisibleDays) {
    const unitStartDay = unit.startDayNumber;
    const unitEndDay = unit.startDayNumber + unit.totalDays - 1;
    
    // Show complete weeks up to totalVisibleDays
    const maxVisibleDay = Math.min(totalVisibleDays, unitEndDay);
    
    if (maxVisibleDay < unitStartDay) {
        return []; // No days visible yet
    }
    
    // Get all days from unit start up to the maximum visible day (complete weeks)
    const visibleDays = await DayModel.find({ 
        unitId: unit._id,
        globalDayNumber: { 
            $gte: unitStartDay,
            $lte: maxVisibleDay 
        }
    }).sort({ globalDayNumber: 1 });
    
    return visibleDays;
}

// Helper function to calculate calendar days between two dates (including weekends)
function calculateCalendarDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset time to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const timeDifference = end.getTime() - start.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    
    return Math.max(0, daysDifference);
}

// Helper function to update day visibility for complete weeks
async function updateCompleteWeekVisibility(totalVisibleDays) {
    // Mark complete weeks as visible
    await DayModel.updateMany(
        { globalDayNumber: { $lte: totalVisibleDays } },
        { isVisible: true }
    );
    
    // Mark future days as not visible
    await DayModel.updateMany(
        { globalDayNumber: { $gt: totalVisibleDays } },
        { isVisible: false }
    );
}

const getDayByUnitId = async (req, res) => {
    try {
        const { unitId } = req.params;

        if (!unitId) {
            return res.status(400).json({
                success: false,
                message: "Unit ID is required!"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(unitId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Unit ID!"
            });
        }

        // Get unit details
        const unit = await UnitModel.findById(unitId);
        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        // Get class details to check content start status
        const isContentStarted = true;
        const cstartDate = new Date("2025-05-2"); // Match the main system start date
        
        // Check if content has started
        if (!isContentStarted || !cstartDate) {
            return res.status(400).json({
                success: false,
                message: "Content not started or start date not set"
            });
        }

        const startDate = new Date(cstartDate);
        const currentDate = new Date();
        
        // Calculate actual days passed from May 25th (including weekends)
        const daysPassed = calculateCalendarDaysBetween(startDate, currentDate);
        
        // Determine which weeks to show completely
        const currentWeekNumber = Math.floor(daysPassed / 5) + 1; // Which week we're currently in
        const weeksToShow = daysPassed > 0 ? currentWeekNumber : 0; // Show complete weeks up to current week
        const totalVisibleDays = weeksToShow * 5; // Always show complete weeks (5 days each)
        const completedWeeks = Math.floor(daysPassed / 5); // Fully completed weeks
        const daysInCurrentWeek = daysPassed % 5; // Days completed in current week

        if (daysPassed <= 0) {
            return res.status(200).json({
                success: false,
                message: "Content will start from May 25th",
                data: [],
                unitInfo: {
                    name: unit.name,
                    totalDays: unit.totalDays,
                    startDayNumber: unit.startDayNumber,
                    isCompleted: false
                },
                currentDay: 0,
                weeksToShow: 0,
                completedWeeks: 0
            });
        }

        // Get ALL visible days for this unit based on complete weeks
        const unitStartDay = unit.startDayNumber;
        const unitEndDay = unit.startDayNumber + unit.totalDays - 1;
        const maxVisibleDay = Math.min(totalVisibleDays, unitEndDay);

        // Only show days if the unit has started and complete weeks are available
        let days = [];
        if (totalVisibleDays >= unitStartDay) {
            days = await DayModel.find({
                unitId,
                globalDayNumber: {
                    $gte: unitStartDay,
                    $lte: maxVisibleDay
                }
            }).select("globalDayNumber week calendarDate isVisible lessons")
                .populate('lessons')
                .sort({ globalDayNumber: 1 });
        }

        if (!days || days.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No complete weeks available for this unit yet",
                data: [],
                unitInfo: {
                    name: unit.name,
                    totalDays: unit.totalDays,
                    startDayNumber: unit.startDayNumber,
                    isCompleted: daysPassed > unitEndDay
                },
                currentDay: daysPassed,
                weeksToShow: weeksToShow,
                completedWeeks: completedWeeks,
                daysInCurrentWeek: daysInCurrentWeek,
                totalVisibleDays: totalVisibleDays
            });
        }

        // Group days by week for better organization
        const daysByWeek = {};
        days.forEach(day => {
            if (!daysByWeek[day.week]) {
                daysByWeek[day.week] = [];
            }
            daysByWeek[day.week].push(day);
        });

        // Calculate unit-specific progress
        const unitProgress = {
            daysShown: days.length,
            weeksShownInUnit: Math.ceil(days.length / 5),
            isCurrentUnit: daysPassed >= unitStartDay && daysPassed < unitEndDay,
            isCompleted: totalVisibleDays >= unitEndDay,
            progressPercentage: Math.round((days.length / unit.totalDays) * 100)
        };

        // Update visibility in database
        await updateCompleteWeekVisibility(totalVisibleDays);

        res.status(200).json({
            success: true,
            data: days,
            daysByWeek: daysByWeek,
            totalVisibleDays: days.length,
            unitInfo: {
                name: unit.name,
                totalDays: unit.totalDays,
                startDayNumber: unit.startDayNumber,
                endDayNumber: unitEndDay,
                isCompleted: totalVisibleDays >= unitEndDay
            },
            unitProgress: unitProgress,
            systemInfo: {
                currentDay: daysPassed,
                weeksToShow: weeksToShow,
                completedWeeks: completedWeeks,
                daysInCurrentWeek: daysInCurrentWeek,
                totalVisibleDays: totalVisibleDays,
                startDate: "2025-05-25",
                currentDate: currentDate.toISOString().split('T')[0]
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getDayByUnitId,
};