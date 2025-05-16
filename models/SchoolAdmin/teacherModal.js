const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    assignClass: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    teacherName: { type: String, required: true },
    subjects: [{ type: String }],
    qualifications: [{ type: String }],
    specialization: { type: String },
    experience: { type: Number },
    joiningDate: { type: Date, default: Date.now },
    isClassTeacher: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);