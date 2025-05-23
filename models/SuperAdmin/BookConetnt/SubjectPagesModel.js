const mongoose = require("mongoose");


const bookPagesSchema = new mongoose.Schema({
    classId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Class",
        required : true
    },
    SubjectId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Subject",
        required : true
    },
    title:{type:String,required:true},
    imageUrl:{type:String,required:true},
},{timestamps:true})


module.exports = mongoose.model("SubjectPage", bookPagesSchema);