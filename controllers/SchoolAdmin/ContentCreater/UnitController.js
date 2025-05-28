const { default: mongoose } = require("mongoose");
const DayModel = require("../../../models/SchoolAdmin/ContentCreateModels/DayModel");
const UnitModel = require("../../../models/SchoolAdmin/ContentCreateModels/UnitModel");
const classModel = require("../../../models/SuperAdmin/classModel");

// Create Unit API
const createUnit = async (req, res) => {
  try {
    const { classId, name, totalDays } = req.body;

    if (!classId || !name || !totalDays) {
      return res.status(400).json({
        success: false,
        message: "classId, name, and totalDays are required",
      });
    }

    const existClass = await classModel.findById(classId);
    if (!existClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const lastUnit = await UnitModel.find({ classId })
      .sort({ startDayNumber: -1 })
      .limit(1);

    const startDayNumber =
      lastUnit.length > 0
        ? lastUnit[0].startDayNumber + lastUnit[0].totalDays
        : 1;

    const unit = await UnitModel.create({
      classId,
      name,
      totalDays,
      startDayNumber,
    });

    // Create days for the unit
    for (let i = 0; i < totalDays; i++) {
      const globalDayNumber = startDayNumber + i;
      const week = Math.ceil(globalDayNumber / 5);

      const newDay = await DayModel.create({
        unitId: unit._id,
        globalDayNumber,
        week,
      });

      if (newDay._id) {
        await UnitModel.findByIdAndUpdate(
          unit._id,
          { $push: { days: newDay._id } },
          { new: true }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Unit created successfully",
      data: unit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Visible Units By Class Id - Progressive system
const GetVisibleUnitsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;

    const existClass = await classModel.findById(classId);
    if (!existClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Content start date - can be configured
    const cstartDate = new Date("2025-05-25");

    const currentDate = new Date();
    let daysPassed = calculateCalendarDaysBetweenFixed(cstartDate, currentDate);

    if (daysPassed < 0) {
      // Current date before start date
      return res.status(200).json({
        success: true,
        data: [],
        message: `Content will start from ${cstartDate.toISOString().split("T")[0]}`,
        activeUnit: null,
        currentDay: 0,
        systemInfo: {
          startDate: cstartDate.toISOString().split("T")[0],
          currentDate: currentDate.toISOString().split("T")[0],
          currentDay: 0,
        },
      });
    }

    if (daysPassed === 0) {
      // Today is the start day
      daysPassed = 1;
    }

    // Fetch all units for the class ordered by startDayNumber
    const allUnits = await UnitModel.find({ classId }).sort({ startDayNumber: 1 });

    if (allUnits.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No units found",
        activeUnit: null,
        currentDay: daysPassed,
      });
    }

    let currentUnit = null;
    let unitsToShow = [];

    for (const unit of allUnits) {
      const unitStartDay = unit.startDayNumber;
      const unitEndDay = unit.startDayNumber + unit.totalDays - 1;

      if (daysPassed >= unitStartDay && daysPassed <= unitEndDay) {
        currentUnit = unit;
        break;
      } else if (daysPassed > unitEndDay) {
        const completedUnitData = await getCompletedUnitData(unit);
        unitsToShow.push(completedUnitData);
      }
    }

    if (currentUnit) {
      const activeUnitData = await getProgressiveUnitData(currentUnit, daysPassed);
      unitsToShow.push(activeUnitData);
    }

    // Update visibility only if daysPassed > 0
    if (daysPassed > 0) {
      await updateProgressiveVisibility(daysPassed);
    }

    const currentWeek = Math.ceil(daysPassed / 5);
    const activeWeekInUnit = currentUnit
      ? Math.ceil((daysPassed - currentUnit.startDayNumber + 1) / 5)
      : 0;

    res.status(200).json({
      success: true,
      data: unitsToShow,
      activeUnit: currentUnit
        ? {
          unitId: currentUnit._id,
          unitName: currentUnit.name,
          currentDay: daysPassed,
          unitStartDay: currentUnit.startDayNumber,
          unitEndDay: currentUnit.startDayNumber + currentUnit.totalDays - 1,
          dayInUnit: daysPassed - currentUnit.startDayNumber + 1,
          weekInUnit: activeWeekInUnit,
          totalWeeksInUnit: Math.ceil(currentUnit.totalDays / 5),
        }
        : null,
      systemInfo: {
        currentDay: daysPassed,
        currentWeek: currentWeek,
        totalUnits: allUnits.length,
        completedUnits: unitsToShow.filter((u) => u.isCompleted).length,
        startDate: cstartDate.toISOString().split("T")[0],
        currentDate: currentDate.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error in GetVisibleUnitsByClassId:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Helper: calculate calendar days between two dates
function calculateCalendarDaysBetweenFixed(startDate, endDate) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((endDate - startDate) / msPerDay);
}


// Helper: Get completed unit data (all days visible)
async function getCompletedUnitData(unit) {
  const unitStartDay = unit.startDayNumber;
  const unitEndDay = unit.startDayNumber + unit.totalDays - 1;

  const days = await DayModel.find({
    unitId: unit._id,
    globalDayNumber: { $gte: unitStartDay, $lte: unitEndDay },
  })
    .populate("lessons")
    .sort({ globalDayNumber: 1 });

  return {
    unitId: unit._id,
    name: unit.name,
    totalDays: unit.totalDays,
    days,
    isCompleted: true,
    isActive: false,
  };
}

// Helper: Get progressive data for active unit (only visible weeks/days)
async function getProgressiveUnitData(unit, currentDay) {
  const unitStartDay = unit.startDayNumber;
  const unitEndDay = unit.startDayNumber + unit.totalDays - 1;

  const dayInUnit = currentDay - unitStartDay + 1;
  const weeksToShow = Math.ceil(dayInUnit / 5);
  const maxVisibleDay = Math.min(unitStartDay + weeksToShow * 5 - 1, unitEndDay);

  const days = await DayModel.find({
    unitId: unit._id,
    globalDayNumber: { $gte: unitStartDay, $lte: maxVisibleDay },
  })
    .populate("lessons")
    .sort({ globalDayNumber: 1 });

  return {
    unitId: unit._id,
    name: unit.name,
    totalDays: unit.totalDays,
    days,
    isCompleted: false,
    isActive: true,
    weeksShown: weeksToShow,
    currentDayInUnit: dayInUnit,
  };
}

// Helper: Update visibility flags based on days passed
async function updateProgressiveVisibility(daysPassed) {
  // Fetch all units
  const units = await UnitModel.find({}).sort({ startDayNumber: 1 });

  for (const unit of units) {
    const unitStartDay = unit.startDayNumber;
    const unitEndDay = unit.startDayNumber + unit.totalDays - 1;

    if (daysPassed >= unitEndDay) {
      // Unit completed
      if (!unit.isVisible) {
        await UnitModel.findByIdAndUpdate(unit._id, { isVisible: true });
      }
    } else if (daysPassed >= unitStartDay && daysPassed < unitEndDay) {
      // Unit currently active (partially visible)
      if (!unit.isVisible) {
        await UnitModel.findByIdAndUpdate(unit._id, { isVisible: true });
      }
    } else {
      // Unit not started - invisible
      if (unit.isVisible) {
        await UnitModel.findByIdAndUpdate(unit._id, { isVisible: false });
      }
    }
  }
}



const unitByClassId = async (req, res) => {
  try {
    const { classId } = req.params;

    const existClass = await classModel.findById(classId);
    if (!existClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const units = await UnitModel.find({ classId }).select('_id name');


    if (!units || units.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No units found for this class",
      });
    }

    res.status(200).json({
      success: true,
      message: "Units retrieved successfully",
      data: units,
    });

    return res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    console.error("Error in unitByClassId:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

};

module.exports = {
  createUnit,
  GetVisibleUnitsByClassId,
  unitByClassId,
};
