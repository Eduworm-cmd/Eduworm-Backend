const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StaffSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  profile: { type: String},
  firstName: { type: String, required: [true, 'First Name is required!'] },
  lastName: { type: String, required: [true, 'Last Name is required!'] },
  dateOfBirth: { type: String, required: [true, 'Date of Birth is required!'] },
  phoneNumber: { type: String, required: [true, 'Phone number is required!'], unique: true },
  emailId: { type: String, required: [true, 'Email ID is required!'], unique: true },
  password: { type: String, required: [true, 'Password is required!'] },
  gender: { type: String, required: [true, 'Gender is required!'] },
  employeeRole: {
    type: String,
    enum: ['staff', 'teacher'],
    required: [true, 'Employee Role is required!']
  },
  department: { type: String, required: [true, 'Department is required!'] },
  nationality: { type: String },
  religion: { type: String },
  fatherName: { type: String },
  currentAddress: { type: String, required: [true, 'Current Address is required!'] },
  permanentAddress: { type: String },
  pinCode: { type: String },
  city: { type: String },
  state: { type: String },
}, { timestamps: true });

// Pre-save middleware to hash password and generate employeeId
StaffSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }

  // Generate employeeId if not already present
  if (!this.employeeId) {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.employeeId = `EMP-${timestamp}${random}`;
  }

  next();
});

// Compare password method
StaffSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Staff", StaffSchema);
