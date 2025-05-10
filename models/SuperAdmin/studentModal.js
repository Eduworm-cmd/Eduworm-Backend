const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
    firstName: { type: String,require:true},
    lastName: { type: String,require:true},
    relationship: { type: String,require:true},
    phoneNumber: { type: String,require:true},
    email: { type: String,require:true},
    currentAddress: { type: String},
    photo: { type: String }
});

const studentSchema = new mongoose.Schema({
    firstName: { type: String, require:true},
    lastName: { type: String,require:true},
    dateOfBirth: { type: Date,require:true},
    gender: { type: String,require:true},

    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    schoolBranch: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolAdmin", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },

    rollNo: { type: String,require:true},
    admissionNumber: { type: String,require:true },
    dateOfJoining: { type: Date,require:true},
    bloodGroup: { type: String},
    enrollmentStatus: { type: String},
    uniqueId: { type: String },
    photo: { type: String },

    documents: {
        transferCertificate: { type: String },
        aadharCard: { type: String },
        studentIDCard: { type: String },
    },

    emergencyContact: {
        name: { type: String },
        relation: { type: String },
        phone: { type: String },
    },

    parents: [parentSchema],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

studentSchema.index({ firstName: 1, lastName: 1 });
studentSchema.index({ rollNo: 1 });
studentSchema.index({ admissionNumber: 1 });
studentSchema.index({ schoolBranch: 1 });
studentSchema.index({ isActive: 1 });

studentSchema.pre('save', async function (next) {
    if (!this.uniqueId) {
        const timestamp = Date.now().toString().slice(-4);
        const random = Math.floor(1000 + Math.random() * 5000);
        this.uniqueId = `EDU-${timestamp}${random}`;
    }
    next();
});
module.exports = mongoose.model("Student", studentSchema);
