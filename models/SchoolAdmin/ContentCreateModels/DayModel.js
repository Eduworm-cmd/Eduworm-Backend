    const mongoose = require("mongoose");

    const daySchema = new mongoose.Schema({
        unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
        globalDayNumber: Number,
        week: Number,

        calendarDate: {
            type: Date,
            default: null
        },
        // Flag to check if this day is visible based on the branch's content start date
        isVisible: {
            type: Boolean,
            default: false
        },
        lessons:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson"
        }],
        isActive: {
            type: Boolean,
            default: true,
          },
    });




    module.exports = mongoose.model("Day", daySchema);
    