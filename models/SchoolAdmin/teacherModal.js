const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    assignClass:{type:mongoose.Schema.Types.ObjectId, ref:"Class", required:true},
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
});

module.exports = mongoose.model('Teacher', teacherSchema);
