const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    cover_image: { type: String },
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    total_pages: { type: Number, default: 0 },
    language: { type: String },
    publisher: { type: String },
    is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Book", BookSchema);