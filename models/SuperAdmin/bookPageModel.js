const mongoose = require("mongoose");

const BookPageSchema = new mongoose.Schema({
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    page_number: { type: Number, required: true },
    title: { type: String, required: true },
    page_image: { type: String },
    lesson_Guidelines: [
        {
            title: { type: String, required: true },
            description: { type: String,required:true},
        }
    ],
    activities: [{
        title: { type: String },
        description: { type: String },
        type: { type: String },
        url: { type: String },
        image: { type: String },
    }],
    linked_days: [{
        unit: { type: Number },
        week: { type: Number },
        day: { type: Number },
        day_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' }
    }],
},{timestamps:true});

module.exports = mongoose.model("BookPage",BookPageSchema);