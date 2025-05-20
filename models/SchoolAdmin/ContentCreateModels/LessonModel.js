const mongoose = require("mongoose");


const lessonSchema = new mongoose.Schema({
    UnitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    ClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    dayId: { type: mongoose.Schema.Types.ObjectId, ref: "Day", required: true },
    lessonAvatar: { type: String, required: true },
    lessonTitle: { type: String, required: true },
    duration: { type: Number, required: true },
    objectives: [
        {
            objectiveTitle: { type: String, required: true },
            objectiveValue: { type: String, required: true },
        }
    ],
    interactiveActivity: [{
        title: { type: String },
        link: { type: String },
        poster: { type: String },
    }]
}, { timestamps: true })


module.exports = mongoose.model("Lesson", lessonSchema);