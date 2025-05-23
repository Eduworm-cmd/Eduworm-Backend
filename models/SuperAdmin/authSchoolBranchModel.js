const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ✅ Updated contentStartSchema with both flags and date
const contentStartSchema = new mongoose.Schema({
  contentStarted: {
    type: Boolean,
    default: false
  },
  contentStartDate: {
    type: Date,
    default: null
  }
}, { _id: false });

const SchoolAdminSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    default: 'branch-admin',
    enum: ['branch-admin']
  },
  location: {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    pincode: { type: String, trim: true }
  },
  staticOtp: {
    type: String,
    default: null
  },
  contact: {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true
    }
  },
  affiliation_board: String,
  total_Students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  total_Staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  total_Teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }],
  branchPassword: {
    type: String,
    required: true
  },
  branchLogo: {
    type: String,
    default: ""
  },
  fees: [{
    name: String,
    amount: Number,
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'half-yearly', 'yearly']
    }
  }],
  startDate: Date,
  endDate: Date,
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // ✅ Updated structure with contentStarted + contentStartDate
  contentStartData: contentStartSchema

}, {
  timestamps: true
});

// Indexes for fast lookup
SchoolAdminSchema.index({ "contact.email": 1 }, { sparse: true });
SchoolAdminSchema.index({ "contact.phone": 1 }, { sparse: true });

// 🔐 Pre-save hook to hash password
SchoolAdminSchema.pre('save', async function (next) {
  const branch = this;

  if (!branch.isModified('branchPassword')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(branch.branchPassword, salt);
    branch.branchPassword = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// 🔑 Compare password method
SchoolAdminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.branchPassword);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model('SchoolAdmin', SchoolAdminSchema);
