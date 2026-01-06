const mongoose = require('mongoose');

const employeeNewSchema = new mongoose.Schema({
  // Personal Details
  employeeCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  emailId: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  permanentAddress: {
    type: String,
    trim: true
  },
  presentAddress: {
    type: String,
    trim: true
  },
  sameAsPermanent: {
    type: Boolean,
    default: false
  },
  emergencyContactName: {
    type: String,
    trim: true
  },
  emergencyContactRelationship: {
    type: String,
    trim: true
  },
  emergencyContactNumber: {
    type: String,
    trim: true
  },
  uploadPhoto: {
    filename: String,
    path: String,
    uploadDate: Date
  },

  // Employment Details
  companyName: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  reportingManager: {
    type: String,
    trim: true
  },
  dateOfJoining: {
    type: Date
  },
  employmentStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Resigned', 'Terminated'],
    default: 'Active'
  },
  status: {
    type: String,
    enum: ['Probation', 'Confirmed', 'Contract', 'Trainee'],
    default: 'Probation'
  },
  idCardStatus: {
    type: String,
    enum: ['Issued', 'Not Issued', 'Pending'],
    default: 'Pending'
  },
  referralName: {
    type: String,
    trim: true
  },

  // Educational Details
  qualification: {
    type: String,
    trim: true
  },
  institutionName: {
    type: String,
    trim: true
  },
  yearOfPassing: {
    type: String,
    trim: true
  },
  percentageGrade: {
    type: String,
    trim: true
  },
  educationalCertificates: [{
    filename: String,
    path: String,
    uploadDate: Date
  }],

  // Work Experience
  previousCompanyName: {
    type: String,
    trim: true
  },
  previousDesignation: {
    type: String,
    trim: true
  },
  durationFrom: {
    type: Date
  },
  durationTo: {
    type: Date
  },
  reasonForLeaving: {
    type: String,
    trim: true
  },
  experienceCertificate: [{
    filename: String,
    path: String,
    uploadDate: Date
  }],
  lastSalarySlip: [{
    filename: String,
    path: String,
    uploadDate: Date
  }],

  // Statutory & Bank Details
  bankName: {
    type: String,
    trim: true
  },
  accountNumber: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  uanNumber: {
    type: String,
    trim: true
  },
  pfNumber: {
    type: String,
    trim: true
  },
  esicNumber: {
    type: String,
    trim: true
  },

  // Document Uploads
  aadharCard: [{
    filename: String,
    path: String,
    uploadDate: Date
  }],
  panCard: [{
    filename: String,
    path: String,
    uploadDate: Date
  }],
  voterIdDrivingLicense: [{
    filename: String,
    path: String,
    uploadDate: Date
  }],
  offerLetterJoiningLetter: [{
    filename: String,
    path: String,
    uploadDate: Date
  }],
  otherDocuments: [{
    filename: String,
    path: String,
    uploadDate: Date,
    description: String
  }],

  // Form Metadata
  formStatus: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  formCompletionPercentage: {
    type: Number,
    default: 0
  },
  submittedDate: {
    type: Date
  },
  approvedDate: {
    type: Date
  },
  approvedBy: {
    type: String,
    trim: true
  },

  // System Fields
  createdBy: {
    type: String,
    default: 'System'
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
employeeNewSchema.index({ employeeCode: 1 });
employeeNewSchema.index({ fullName: 1 });
employeeNewSchema.index({ emailId: 1 });
employeeNewSchema.index({ employmentStatus: 1 });
employeeNewSchema.index({ designation: 1 });
employeeNewSchema.index({ branch: 1 });

// Method to calculate form completion percentage
employeeNewSchema.methods.calculateFormCompletion = function() {
  let completedFields = 0;
  let totalFields = 0;

  // Personal Details (10 required fields)
  const personalFields = ['employeeCode', 'fullName', 'gender', 'dateOfBirth', 'contactNumber', 'emailId', 'permanentAddress', 'presentAddress', 'emergencyContactName', 'emergencyContactNumber'];
  personalFields.forEach(field => {
    totalFields++;
    if (this[field]) completedFields++;
  });

  // Employment Details (8 fields)
  const employmentFields = ['companyName', 'branch', 'designation', 'reportingManager', 'dateOfJoining', 'employmentStatus', 'status', 'idCardStatus'];
  employmentFields.forEach(field => {
    totalFields++;
    if (this[field]) completedFields++;
  });

  // Educational Details (4 fields)
  const educationFields = ['qualification', 'institutionName', 'yearOfPassing', 'percentageGrade'];
  educationFields.forEach(field => {
    totalFields++;
    if (this[field]) completedFields++;
  });

  // Statutory & Bank Details (6 fields)
  const statutoryFields = ['bankName', 'accountNumber', 'ifscCode', 'uanNumber', 'pfNumber', 'esicNumber'];
  statutoryFields.forEach(field => {
    totalFields++;
    if (this[field]) completedFields++;
  });

  // Documents (2 mandatory fields)
  totalFields += 2;
  if (this.aadharCard && this.aadharCard.length > 0) completedFields++;
  if (this.panCard && this.panCard.length > 0) completedFields++;

  this.formCompletionPercentage = Math.round((completedFields / totalFields) * 100);
  return this.formCompletionPercentage;
};

// Pre-save middleware to calculate form completion
employeeNewSchema.pre('save', function(next) {
  this.calculateFormCompletion();
  next();
});

const EmployeeNew = mongoose.model('EmployeeNew', employeeNewSchema);

module.exports = EmployeeNew;
