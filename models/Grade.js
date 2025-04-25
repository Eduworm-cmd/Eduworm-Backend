// models/Grade.js
const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['General', 'Special', 'Advanced'],
    default: 'General'
  },
  minAge: {
    type: Number,
    required: true,
    min: 1
  },
  maxAge: {
    type: Number,
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolAdmin',
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
  }
}, { timestamps: true });

// Validation to ensure maxAge is greater than minAge
gradeSchema.pre('validate', function(next) {
  if (this.maxAge <= this.minAge) {
    this.invalidate('maxAge', 'Max age must be greater than min age');
  }
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);