const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phoneNumber: { type: String, required: true, unique: true },
    staticOtp: { type: String, default: "123456" },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["schooladmin"], default: "schooladmin" },
    schoolName: { type: String },
    city: { type: String },
    state: { type: String },
    branches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
    academicYear: [{ type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear" }],
  },
  { timestamps: true }
);

// Hash password before save
authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

authSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("SchoolAdmin", authSchema);
