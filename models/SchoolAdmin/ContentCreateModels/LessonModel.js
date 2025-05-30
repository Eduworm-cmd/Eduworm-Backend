const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
    UnitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    ClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    dayId: { type: mongoose.Schema.Types.ObjectId, ref: "Day", required: true },
    SubjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    contentAvtar: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: String, required: true },
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
    }],

    creationType: {
        type: String,
        enum: ['manual', 'book'],
        required: true
    },
    bookPageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookPageContent',
        required: function () { return this.creationType === 'book'; }
    },
}, { timestamps: true })


module.exports = mongoose.model("Lesson", lessonSchema);