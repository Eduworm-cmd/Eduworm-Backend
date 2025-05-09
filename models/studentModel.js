const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  relationship: { type: String },
  phoneNumber: { type: String },
  email: { type: String },
  currentAddress: { type: String },
  photo: { type: String }
});







// Define the student schema
const studentSchema = new mongoose.Schema({
  // Student Personal Information
  firstName: { type: String },
  lastName: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  
  // School Information
  school: { type: String, ref: "School" },
  schoolBranch: { type: String, ref: "SchoolAdmin" },
  rollNo: { type: String },
  admissionNumber: { type: String },
  dateOfJoining: { type: Date },
  bloodGroup: { type: String },
  enrollmentStatus: { type: String },
  uniqueId: { type: String },
  photo: { type: String },


  //personal documants
documents: {
  transferCertificate: { type: String },
  aadharCard: { type: String },
  studentIDCard: { type: String },
},

emergencyContact: {
  name: { type: String },
  relation: { type: String },
  phone: { type: String },
}
,
  
  currentClass: {
    class: {type:mongoose.Schema.Types.ObjectId,ref:"Class"},
    academicYear: { type: String }, 
  },
  parents: [parentSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Create index for faster queries
studentSchema.index({ firstName: 1, lastName: 1 });
studentSchema.index({ rollNo: 1 });
studentSchema.index({ admissionNumber: 1 });
studentSchema.index({ branch: 1 });
studentSchema.index({ isActive: 1 });





module.exports = mongoose.model("Student", studentSchema);