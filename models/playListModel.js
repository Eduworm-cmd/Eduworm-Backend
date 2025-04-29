const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true
    },
    thumbnail: {
      public_id: String,
      url: String
    },
    contents: [{
      type: Schema.Types.ObjectId,
      ref: "Content"
    }],
    assignedStudents: [{
      type: Schema.Types.ObjectId,
      ref: "Student"
    }],
    assignedClasses: [{
      type: Schema.Types.ObjectId,
      ref: "Class"
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", playlistSchema);