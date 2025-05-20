const mongoose = require("mongoose");



const subjectSchema = new mongoose.Schema({
    classId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Class",
        required : true
    },
    title:{type:String,required:true},
   imageUrl:{type:String,required:true},
},{timestamps:true})


module.exports = mongoose.model("Subject", subjectSchema);


