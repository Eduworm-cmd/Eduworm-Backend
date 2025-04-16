const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    displayName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String, required: true },
    isActive: { type: Boolean, default: true },

    state: { type: String, required: true },
    city: { type: String, required: true },
    pinCode: { type: String, required: true },
    address: { type: String, required: true },
    branchLogo: { type: String },
    schoolAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolAdmin", required: true }, // Reference to School Admin
students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
