const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SchoolAdminSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    unique: true
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
  contact: {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true // Index but not unique at this level
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true // Index but not unique at this level
    }
  },
  affiliation_board: String,
  total_Students: {
    type: Number,
    default: 0
  },
  total_Teachers: {
    type: Number,
    default: 0
  },
  total_Staff: {
    type: Number,
    default: 0
  },
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
  academicYear: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure email uniqueness across all branches
SchoolAdminSchema.index({ "contact.email": 1 }, { unique: true, sparse: true });

// Compound index to ensure phone uniqueness across all branches
SchoolAdminSchema.index({ "contact.phone": 1 }, { unique: true, sparse: true });

// Hash password before saving
SchoolAdminSchema.pre('save', async function (next) {
  const branch = this;

  // Only hash the password if it has been modified (or is new)
  if (!branch.isModified('branchPassword')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the new salt
    const hashedPassword = await bcrypt.hash(branch.branchPassword, salt);

    // Replace plain text password with hashed password
    branch.branchPassword = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
SchoolAdminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.branchPassword);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model('SchoolAdmin', SchoolAdminSchema);