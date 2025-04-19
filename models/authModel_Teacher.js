const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  dateOfBirth: {
    type: Date
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  emailIDOfficial: {
    type: String,
    required: [true, 'Official email ID is required'],
    unique: true
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  employeeRole: {
    type: String,
    required: [true, 'Employee role is required']
  },
  role: {
    type: String,
    enum: ['staff'],
    default: 'staff'
  },
//   school: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'School',
//     required: [true, 'School is required']
//   },
  branch: {
    type: String,
    // required: [true, 'Branch is required']
  },
  employeeId: {
    type: String,
    unique: true
  },
  title: {
    type: String
  },
  emailIDPersonal: {
    type: String
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed']
  },
  marriageAnniversary: {
    type: Date
  },
  department: {
    type: String
  },
  subDepartment: {
    type: String
  },
  emergencyContact: {
    type: String
  },
  nationality: {
    type: String
  },
  religion: {
    type: String
  },
  fatherName: {
    type: String
  },
  bankDetails: {
    accountNumber: {
      type: String
    },
    nameAsPerBank: {
      type: String
    },
    bankName: {
      type: String
    },
    bankBranch: {
      type: String
    },
    ifscCode: {
      type: String
    }
  },
  currentAddress: {
    type: String
  },
  permanentAddress: {
    type: String
  },
  aadhaarCard: {
    type: String
  },
  aadhaarCardUrl: {
    type: String
  },
  panCard: {
    type: String
  },
  panCardUrl: {
    type: String
  },
  photoUrl: {
    type: String
  },
  dateOfJoining: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Teachers', StaffSchema);