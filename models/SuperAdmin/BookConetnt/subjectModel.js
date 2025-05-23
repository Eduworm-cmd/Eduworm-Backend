const mongoose = require("mongoose");



const subjectSchema = new mongoose.Schema({
    classId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Class",
        required : true
    },
    title:{type:String,required:true, unique: true},
   imageUrl:{type:String,required:true},
    SubjectPage: [{ type: mongoose.Schema.Types.ObjectId, ref:"SubjectPage"}],
},{timestamps:true})


module.exports = mongoose.model("Subject", subjectSchema);


