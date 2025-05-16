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
    totalDays :{
        type : Number,
        required : true
    },
    startDayNumber:{
        type: Number,
    }
})


module.exports = mongoose.model('Unit',unitSchema);