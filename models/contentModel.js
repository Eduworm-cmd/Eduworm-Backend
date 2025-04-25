const mongoose = require('mongoose');
const { Schema } = mongoose;

const contentSchema = new Schema(
  {
    contentType: {
      type: String,
      enum: ['game', 'video'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    contentId: {
      type: String,
      unique: true,
      default: function() {
        return `c-${Math.random().toString(36).substr(2, 9)}`;
      }
    },
    domain: {
      type: String,
      required: true,
      lowercase: true // Automatically converts to lowercase
    },
    subdomain: {
      type: String,
      required: true,
      lowercase: true // Automatically converts to lowercase
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: 'Grade',
      required: true
    },
    learningObjective: {
      type: String,
      required: true
    },
    redirectLink: {
      type: String,
      required: true
    },
    previewImage: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);
