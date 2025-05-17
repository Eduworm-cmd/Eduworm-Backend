const mongoose = require("mongoose");



const daySchema = new mongoose.Schema({
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    globalDayNumber: Number,
});
module.exports = mongoose.model("Day", daySchema);
  