const mongoose = require("mongoose");


const bookPagesSchema = new mongoose.Schema({
    SubjectId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Subject",
        required : true
    },
    title:{type:String,required:true},
    imageUrl:{type:String,required:true},
},{timestamps:true})


module.exports = mongoose.model("BookPages", bookPagesSchema);