// models/Grade.js
const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique:[true, 'Grade is already exits !']
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolAdmin',
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  teacher: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  ],
  subject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  ],
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
  }
}, { timestamps: true });


module.exports = mongoose.model('Grade', gradeSchema);