const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: { type: String, required: true, unique: true }, 
    courseContent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseContent',
    },
});

const Class = mongoose.model('Class', classSchema);

module.exports = { Class };
