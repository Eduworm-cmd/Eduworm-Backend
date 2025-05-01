const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    staticOtp: { type: String, default: "123456" },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["schooladmin"], default: "schooladmin" },
    schoolName: { type: String },
    displayName: { type: String },
    classes: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: String },
    address: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    academicYearLabel: { type: String },
    branchName: { type: String, required: true, unique: true },
    branchEmail: { type: String, required: true, unique: true },
    branchPassword: { type: String, required: true },
    schoolLogo: { type: String },
    branches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    academicYear: [{ type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear" }],
  },
  { timestamps: true }
);

// Hash branchPassword before saving
authSchema.pre("save", async function (next) {
  if (this.isModified("branchPassword")) {
    const salt = await bcrypt.genSalt(10);
    this.branchPassword = await bcrypt.hash(this.branchPassword, salt);
  }
  next();
});

// Use branchPassword for authentication
authSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.branchPassword);
};

module.exports = mongoose.model("SchoolAdmin", authSchema);
