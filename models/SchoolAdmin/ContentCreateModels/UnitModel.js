const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
    classId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Class",
        required : true
    },
    name:{
        type : String,
        required : true
    },
    days:[{type: mongoose.Schema.Types.ObjectId, ref: "Day", required: true}],
    totalDays :{
        type : Number,
        required : true
    },
    startDayNumber:{
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true,
      },
})


module.exports = mongoose.model('Unit',unitSchema);