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
    s
})