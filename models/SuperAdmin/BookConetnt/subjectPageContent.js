const mongoose = require("mongoose");


const subjectPageContentSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },
    SubjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },

    SubjectPageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectPage",
        required: true
    },
    contentAvtar: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    duration: { type: String, required: true },
    shcedule: {
        type: String,
    },
    objectives: [
        {
            objectiveTitle: { type: String, required: true },
            objectiveValue: { type: String, required: true },
        }
    ],
    interactiveActivity: [{
        title: { type: String, required: true },
        link: { type: String, required: true },
        poster: { type: String, required: true },
    }]


}, { timestamps: true })


module.exports = mongoose.model("SubjectPageContent", subjectPageContentSchema);