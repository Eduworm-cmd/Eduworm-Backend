const mongoose = require('mongoose');

// Pre-save middleware to generate unique employee ID
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
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  branch: {
    type: String,
    // required: [true, 'Branch is required']
  },
  employeeId: {
    type: String,
    unique: true,
    default: function() {
      return generateEmployeeId();
    }
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
},{ timestamps:true});

// Function to generate a unique employee ID
function generateEmployeeId() {
  // Create a timestamp component (last 4 digits of current timestamp)
  const timestamp = Date.now().toString().slice(-4);
  
  // Create a random component (4 random digits)
  const random = Math.floor(1000 + Math.random() * 9000);
  
  // Combine to create the employee ID with a prefix
  return `EMP-${timestamp}${random}`;
}

// Pre-save middleware to ensure employee ID is set
StaffSchema.pre('save', async function(next) {
  // If employeeId is not set, generate one
  if (!this.employeeId) {
    this.employeeId = generateEmployeeId();
    
    // Check if this ID already exists and regenerate if needed
    const exists = await this.constructor.findOne({ employeeId: this.employeeId });
    if (exists) {
      this.employeeId = generateEmployeeId();
    }
  }
  
  // Update the updatedAt field
  this.updatedAt = Date.now();
  
  next();
});

module.exports = mongoose.model('Teachers', StaffSchema);