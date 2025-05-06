const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required!'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required!'],
  },
  schoolName: {
    type: String,
    required: [true, 'School name is required!'],
    unique: true,
    trim: true,
  },
  contact: {
    email: {
      type: String,
      required: [true, 'Email is required!'],
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required!'],
    },
  },
  branches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });


// schoolSchema.pre('save', async function (next) {
//     if (this.isModified('isActive') && this.isActive === false) {
//       const Branch = require('./Branch');
//       await Branch.updateMany({ schoolId: this._id }, { isActive: false });
//     }
//     next();
//  });
  

module.exports = mongoose.model('School', schoolSchema);
