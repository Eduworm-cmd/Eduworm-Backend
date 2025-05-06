const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema(
  {
    BranchId: { type: String, unique: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    name: { type: String, required: true },
    displayName: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    affiliation_board: {
      type: String,
      enum: ["CBSE", "ICSE", "State Board", "IB", "Other"],
      default: "Other",
    },
    total_Students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    total_Teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
    total_Staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],
    branchPassword: { type: String, required: true, select: false },
    branchLogo: { type: String },
    fees: [
      {
        class: String,
        amount: Number,
      },
    ],
    startDate: { type: String },
    endDate: { type: String },
    isActive: { type: Boolean, default: true },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    academicYear: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear" },
    ],
  },
  { timestamps: true }
);

// Create compound indexes for email and phone
authSchema.index({ "contact.email": 1 }, { unique: true });
authSchema.index({ "contact.phone": 1 }, { unique: true });

// 🔐 Password hashing
authSchema.pre("save", async function (next) {
  if (!this.isModified("branchPassword")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.branchPassword = await bcrypt.hash(this.branchPassword, salt);
    next();
  } catch (err) {
    next(err);
  }
});

authSchema.pre('save',async function(next) {
  // Generate BranchId if not already present
  if (!this.BranchId) {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.BranchId = `BR-${timestamp}${random}`;
  }
  next();
})
authSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.branchPassword);
};

module.exports = mongoose.model("SchoolAdmin", authSchema);