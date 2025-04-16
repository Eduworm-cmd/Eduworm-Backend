const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    staticOtp: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["schooladmin"], default: "schooladmin" },
    branches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchoolAdmin", authSchema);
