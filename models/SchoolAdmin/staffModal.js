const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  profile: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  emailId: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
  employeeRole: {
    type: String,
    enum: ['staff', 'teacher'],
    required: true
  },
  dateofJoining: { type: String, required: true },
  bloodGroup: { type: String },
  maritalStatus: { type: String },
  marriageAnniversary: { type: String },
  department: { type: String, required: true },
  subDepartment: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  nationality: { type: String, required: true },
  religion: { type: String, required: true },

  address: {
    currentAddress: { type: String, required: true },
    permanentAddress: { type: String, required: true },
  },
  employeeBankDeatils: {
    accountNumber: { type: String, required: true },
    nameAsPerBank: { type: String, required: true },
    bankName: { type: String, required: true },
    bankBranch: { type: String, required: true },
    ifscCode: { type: String, required: true },
  },
  document: {
    aadharCard: { type: String, required: false },
    panCard: { type: String },
  },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolAdmin', required: true },

  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
}, { timestamps: true });

staffSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  if (!this.employeeId) {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.employeeId = `EMP-${timestamp}${random}`;
  }

  next();
});

staffSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('SchoolStaff', staffSchema);