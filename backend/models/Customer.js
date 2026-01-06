const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Basic Account Information
  loanId: {
    type: String,
    required: false,
    unique: false,
    index: true,
    sparse: true
  },
  parent: String,
  accountName: {
    type: String,
    required: false,
    trim: true
  },
  productType: {
    type: String,
    default: 'PL'
  },
  
  // Financial Details
  totalOutstanding: {
    type: Number,
    default: 0
  },
  principalOutstanding: {
    type: Number,
    default: 0
  },
  interestCharges: {
    type: Number,
    default: 0
  },
  otherCharges: {
    type: Number,
    default: 0
  },
  loanAmount: {
    type: Number,
    min: 0
  },
  rateOfInterest: String,
  tenure: {
    type: Number,
    min: 0
  },
  emiAmount: {
    type: Number,
    min: 0
  },
  totalRepayableAmount: {
    type: Number,
    default: 0
  },
  paidEmiCount: {
    type: Number,
    default: 0
  },
  paidEmiAmount: {
    type: Number,
    default: 0
  },
  pendingEmiCount: {
    type: Number,
    default: 0
  },
  pendingEmiAmount: {
    type: Number,
    default: 0
  },
  
  // Loan Dates
  sanctionDate: Date,
  sanctionAmount: {
    type: Number,
    min: 0
  },
  disbursementDate: Date,
  disbursementAmount: {
    type: Number,
    min: 0
  },
  emiStartDate: Date,
  maturityDate: Date,
  lastPaymentDate: Date,
  lastPaidAmount: {
    type: Number,
    default: 0
  },
  
  // Account Status
  dpdBucket: String,
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'CLOSED', 'WRITTEN OFF', 'SETTLED', 'UNDER LITIGATION', 'UNDER PROGRESS'],
    default: 'ACTIVE'
  },
  dateOfNPA: Date,
  
  // Personal Information
  fatherName: String,
  motherName: String,
  spouseName: String,
  dob: {
    type: Date,
    required: false
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'OTHER'],
    required: false
  },
  pan: {
    type: String,
    uppercase: true,
    trim: true
  },
  aadhaarNumber: {
    type: String,
    trim: true
  },
  voterId: String,
  drivingLicence: String,
  designation: String,
  
  // Contact Information
  registeredMobile: {
    type: String,
    required: false
  },
  alternateMobile: String,
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Address Details
  residentialAddress: {
    type: String,
    required: false
  },
  location: String,
  pin: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  
  // Employer Details
  employerName: String,
  employerAddress: String,
  employerLocation: String,
  employerPin: String,
  employerState: String,
  officialMailId: String,
  occupationType: String,
  employmentJobSector: String,
  
  // Allocation & Team
  allocation: String,
  callerName: String,
  teamLeader: String,
  manager: String,
  
  // Calling Status
  callingStatusCodes: String,
  remarks: String,
  lastConnectedDate: Date,
  lastConnectedNumber: String,
  
  // Field Status
  lastFieldVisitedDate: Date,
  fieldStatusCodes: String,
  fieldRemarks: String,
  
  // Settlement Information
  settlementType: String,
  settlementAmount: {
    type: Number,
    default: 0
  },
  installments: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  settlementStatus: String,
  
  // Legacy fields for backward compatibility
  city: String,
  phoneNo: String,
  mobileNo: String,
  addressDetails: String,
  employerType: String,
  emi: Number,
  principalDueOverDue: Number,
  totalOverDue: Number,
  interestRate: Number,
  status: String,
  tags: [String],
  notes: String,
  lastContactDate: Date,
  nextFollowUpDate: Date,
  occupation: String,
  profession: String,
  educationLevel: String,
  nationality: {
    type: String,
    default: 'Indian'
  },
  team: String
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance
customerSchema.index({ accountName: 'text', email: 'text', phoneNo: 'text' });
customerSchema.index({ city: 1, state: 1 });
customerSchema.index({ sanctionDate: -1 });
customerSchema.index({ status: 1 });

// Virtual for full name display
customerSchema.virtual('displayName').get(function() {
  return this.accountName;
});

// Virtual for overdue status
customerSchema.virtual('isOverdue').get(function() {
  return this.totalOverDue > 0;
});

// Virtual for loan status summary
customerSchema.virtual('loanSummary').get(function() {
  return {
    sanctioned: this.sanctionAmount,
    disbursed: this.disbursementAmount,
    overdue: this.totalOverDue,
    emi: this.emi,
    tenure: this.tenure
  };
});

// Pre-save middleware
customerSchema.pre('save', function(next) {
  // Convert date strings to proper Date objects
  if (typeof this.dob === 'string' && this.dob) {
    this.dob = new Date(this.dob);
  }
  if (typeof this.sanctionDate === 'string' && this.sanctionDate) {
    this.sanctionDate = new Date(this.sanctionDate);
  }
  if (typeof this.disbursementDate === 'string' && this.disbursementDate) {
    this.disbursementDate = new Date(this.disbursementDate);
  }
  if (typeof this.emiStartDate === 'string' && this.emiStartDate) {
    this.emiStartDate = new Date(this.emiStartDate);
  }
  if (typeof this.maturityDate === 'string' && this.maturityDate) {
    this.maturityDate = new Date(this.maturityDate);
  }
  if (typeof this.dateOfNPA === 'string' && this.dateOfNPA) {
    this.dateOfNPA = new Date(this.dateOfNPA);
  }
  
  next();
});

// Static methods
customerSchema.statics.findByLoanId = function(loanId) {
  return this.findOne({ loanId });
};

customerSchema.statics.searchCustomers = function(query, options = {}) {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;
  
  let searchQuery = {};
  
  if (query) {
    searchQuery = {
      $or: [
        { accountName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phoneNo: { $regex: query, $options: 'i' } },
        { mobileNo: { $regex: query, $options: 'i' } },
        { loanId: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { state: { $regex: query, $options: 'i' } }
      ]
    };
  }
  
  return this.find(searchQuery)
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Customer', customerSchema);