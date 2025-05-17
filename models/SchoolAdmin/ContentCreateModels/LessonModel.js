const mongoose = require("mongoose");


const lessonSchema = new mongoose.Schema({
    UnitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    ClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    dayId : {type: mongoose.Schema.Types.ObjectId,ref:"Day",required:true},
    lessonAvatar: String,
    title: String,
    subjectType: String,
    duration: Number,
    objective: String,
    materials: [String],
    activity: [String],
    closure: String,
    interactiveActivity: {
        title: String,
        link: String,
        assigned: { type: Boolean, default: false }
    }
})


module.exports = mongoose.model("Lesson", lessonSchema);