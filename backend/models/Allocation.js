const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  // Allocation Reference
  allocationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Allocation Details
  allocationDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  // Accounts Allocated
  accounts: [{
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    loanId: String,
    accountName: String,
    totalOutstanding: Number,
    principalOutstanding: Number,
    dpd: Number,
    bucket: String
  }],
  
  totalAccounts: {
    type: Number,
    required: true,
    default: 0
  },
  
  totalOutstanding: {
    type: Number,
    default: 0
  },
  
  // Allocation Assignee
  allocatedTo: {
    callerName: {
      type: String,
      required: true,
      index: true
    },
    callerId: String,
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  },
  
  // Team Structure
  team: {
    teamName: String,
    teamLeader: String,
    manager: String
  },
  
  // Allocation Type
  allocationType: {
    type: String,
    enum: ['Manual', 'Auto', 'Round-Robin', 'Rule-Based', 'Reallocation'],
    default: 'Manual'
  },
  
  // Allocation Rules (for auto allocation)
  allocationRules: {
    bucketRange: [String],
    dpdRange: {
      min: Number,
      max: Number
    },
    outstandingRange: {
      min: Number,
      max: Number
    },
    location: [String],
    productType: [String]
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Reassigned', 'Cancelled'],
    default: 'Active',
    index: true
  },
  
  // Performance Tracking
  performance: {
    contacted: {
      type: Number,
      default: 0
    },
    promiseToPay: {
      type: Number,
      default: 0
    },
    collected: {
      type: Number,
      default: 0
    },
    collectionAmount: {
      type: Number,
      default: 0
    },
    lastContactDate: Date,
    completionPercentage: {
      type: Number,
      default: 0
    }
  },
  
  // Target & Deadline
  targetAmount: Number,
  targetContacts: Number,
  deadline: Date,
  
  // Reallocation Info
  reallocatedFrom: {
    allocationId: String,
    callerName: String,
    reason: String,
    date: Date
  },
  
  // Notes & Comments
  notes: String,
  comments: [{
    user: String,
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Audit Trail
  createdBy: {
    name: String,
    userId: String,
    role: String
  },
  
  modifiedBy: {
    name: String,
    userId: String,
    timestamp: Date
  },
  
  cancelledBy: {
    name: String,
    userId: String,
    reason: String,
    timestamp: Date
  }
  
}, {
  timestamps: true
});

// Indexes for performance
allocationSchema.index({ 'allocatedTo.callerName': 1, allocationDate: -1 });
allocationSchema.index({ status: 1, allocationDate: -1 });
allocationSchema.index({ 'team.teamName': 1, allocationDate: -1 });
allocationSchema.index({ allocationDate: -1, status: 1 });

// Generate allocation ID
allocationSchema.pre('save', async function(next) {
  if (this.isNew && !this.allocationId) {
    const count = await mongoose.model('Allocation').countDocuments();
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.allocationId = `ALLOC-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before save
allocationSchema.pre('save', function(next) {
  if (this.accounts && this.accounts.length > 0) {
    this.totalAccounts = this.accounts.length;
    this.totalOutstanding = this.accounts.reduce((sum, acc) => sum + (acc.totalOutstanding || 0), 0);
  }
  next();
});

// Virtual for days since allocation
allocationSchema.virtual('daysSinceAllocation').get(function() {
  const now = new Date();
  const diff = now - this.allocationDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Method to update performance
allocationSchema.methods.updatePerformance = function(performanceData) {
  this.performance = {
    ...this.performance,
    ...performanceData,
    completionPercentage: this.totalAccounts > 0 
      ? Math.round((performanceData.contacted / this.totalAccounts) * 100)
      : 0
  };
  return this.save();
};

const Allocation = mongoose.model('Allocation', allocationSchema);

module.exports = Allocation;
