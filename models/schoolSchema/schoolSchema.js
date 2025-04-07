const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String, required: true },
    email: { type: String, required: true },
    techers: [{ type: mongoose.Schema.Types.ObjectId, ref: "teacher" }],
})
const school = mongoose.model("school", schoolSchema);
module.exports = { school };