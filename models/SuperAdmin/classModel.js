const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClassSchema = new Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
      unique: [true, "ClassName must be unique"]
    },
    type: {
      type: String,
      enum: ["Sepcial", "General"],
      deafult:"General"
    },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolAdmin' },
    grades: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grade",
        required: true,
      },
    ],
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
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Class", ClassSchema);
