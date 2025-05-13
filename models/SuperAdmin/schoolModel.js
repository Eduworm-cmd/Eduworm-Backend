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
  location: {
    country: {
      type: String,
      required: [true, 'Country is required!'],
    },
    state: {
      type: String,
      required: [true, 'State is required!'],
    },
    city: {
      type: String,
      required: [true, 'City is required!'],
    },
    pinCode: {
      type: String,
      required: [true, 'Pin code is required!'],
    },
    address: {
      type: String,
      required: [true, 'Address is required!'],
    },
  },
  branches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolAdmin',
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
