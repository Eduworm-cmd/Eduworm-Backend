const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name:{
        type:String,
        require:[true]
    },
    profile:{
        type:String,
        require:[true]
    },
    role:{
        type:String,
        default:"stundent"
    }
})


module.exports = mongoose.Schema('Student',studentSchema);