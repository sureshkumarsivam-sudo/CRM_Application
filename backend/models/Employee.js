const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Basic Information
  empCode: {
    type: String,
    required: [true, 'Employee code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  doj: {
    type: Date,
    required: [true, 'Date of joining is required']
  },
  reportingManager: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Active', 'Inactive', 'Terminated', 'On Leave', 'Probation'],
    default: 'Active'
  },
  
  // Personal Information
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed'],
    default: 'Single'
  },
  
  // Professional Information
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    default: 0
  },
  employmentStatus: {
    type: String,
    required: [true, 'Employment status is required'],
    enum: ['Permanent', 'Contract', 'Temporary', 'Intern', 'Consultant'],
    default: 'Permanent'
  },
  
  // Salary Information
  salaryOffered: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  annual: {
    type: Number,
    min: [0, 'Annual salary cannot be negative']
  },
  
  // Contact Information
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  officialEmailId: {
    type: String,
    required: [true, 'Official email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  personalEmailId: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  
  // Address Information
  currentAddress: {
    type: String,
    required: [true, 'Current address is required'],
    trim: true
  },
  permanentAddress: {
    type: String,
    required: [true, 'Permanent address is required'],
    trim: true
  },
  
  // Identity Documents
  panCardNo: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'Please enter a valid PAN card number'
    }
  },
  aadharCardNo: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{12}$/.test(v);
      },
      message: 'Please enter a valid Aadhar card number'
    }
  },
  
  // Banking Information
  bankAccountNumber: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
      },
      message: 'Please enter a valid IFSC code'
    }
  },
  bankName: {
    type: String,
    trim: true
  },
  bankBranch: {
    type: String,
    trim: true
  },
  
  // Emergency Contact
  emergencyContactNumber: {
    type: String,
    trim: true
  },
  emergencyContactName: {
    type: String,
    trim: true
  },
  emergencyContactRelationship: {
    type: String,
    trim: true,
    enum: ['Father', 'Mother', 'Spouse', 'Sibling', 'Friend', 'Other']
  },
  
  // Additional Information
  referralName: {
    type: String,
    trim: true
  },
  uanNumber: {
    type: String,
    trim: true
  },
  pfNumber: {
    type: String,
    trim: true
  },
  esicNo: {
    type: String,
    trim: true
  },
  idCardDone: {
    type: Boolean,
    default: false
  },
  confirmedOrExtendedDate: {
    type: Date
  },
  exitDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name display
employeeSchema.virtual('displayName').get(function() {
  return `${this.empCode} - ${this.name}`;
});

// Virtual for age calculation
employeeSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for years of service
employeeSchema.virtual('yearsOfService').get(function() {
  if (!this.doj) return null;
  const today = new Date();
  const joinDate = new Date(this.doj);
  let years = today.getFullYear() - joinDate.getFullYear();
  const monthDiff = today.getMonth() - joinDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < joinDate.getDate())) {
    years--;
  }
  return Math.max(0, years);
});

// Index for better search performance
employeeSchema.index({ empCode: 1 });
employeeSchema.index({ name: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ branch: 1 });
employeeSchema.index({ designation: 1 });

// Text index for search functionality
employeeSchema.index({
  empCode: 'text',
  name: 'text',
  department: 'text',
  designation: 'text',
  branch: 'text',
  officialEmailId: 'text',
  contactNumber: 'text'
});

// Pre-save middleware
employeeSchema.pre('save', function(next) {
  // Auto-generate employee code if not provided
  if (!this.empCode && this.isNew) {
    const timestamp = Date.now().toString().slice(-6);
    this.empCode = `EMP${timestamp}`;
  }
  
  // Set annual salary if only monthly salary is provided
  if (this.salaryOffered && !this.annual) {
    this.annual = this.salaryOffered * 12;
  }
  
  next();
});

// Static methods
employeeSchema.statics.findByDepartment = function(department) {
  return this.find({ department: department, status: 'Active' });
};

employeeSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

employeeSchema.statics.searchEmployees = function(query, options = {}) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    $or: [
      { empCode: searchRegex },
      { name: searchRegex },
      { department: searchRegex },
      { designation: searchRegex },
      { branch: searchRegex },
      { officialEmailId: searchRegex },
      { contactNumber: searchRegex }
    ]
  }, null, options);
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;