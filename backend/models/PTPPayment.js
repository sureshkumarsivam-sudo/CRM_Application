const mongoose = require('mongoose');

const ptpPaymentSchema = new mongoose.Schema({
  // Account and Customer Information
  accountNumber: {
    type: String,
    required: true,
    trim: true,
    index: true,
    uppercase: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  // PTP/Payment Details
  ptpAmount: {
    type: Number,
    required: true,
    min: 0
  },
  collectedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Status Information
  status: {
    type: String,
    required: true,
    enum: ['All Status', 'PTP', 'COLLECTED', 'PDC', 'PART-PAYMENT', 'W-SETT', 'PENDING', 'OVERDUE'],
    default: 'PTP',
    index: true
  },
  previousStatus: {
    type: String,
    enum: ['PTP', 'COLLECTED', 'PDC', 'PART-PAYMENT', 'W-SETT', 'PENDING', 'OVERDUE']
  },
  
  // Date Information
  paymentDate: {
    type: Date,
    required: true,
    index: true
  },
  actualCollectionDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  reminderDate: {
    type: Date
  },
  
  // Caller and Contact Information
  callerName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  alternateContactNumber: {
    type: String,
    trim: true
  },
  
  // Team Leader and Process
  amAndTL: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  process: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CHEQUE', 'ONLINE', 'NEFT', 'RTGS', 'UPI', 'PDC', 'OTHER'],
    default: 'CASH'
  },
  transactionReference: {
    type: String,
    trim: true
  },
  
  // Collection Details
  collectionLocation: {
    type: String,
    trim: true
  },
  collectionRemarks: {
    type: String,
    trim: true
  },
  
  // Reference to Customer and Employee
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    index: true
  },
  
  // Follow-up and Reminder Information
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpNotes: [{
    note: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Priority and Tags
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Status History for Audit Trail
  statusHistory: [{
    status: String,
    changedBy: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  
  // Additional tracking fields
  createdBy: {
    name: String,
    userId: String,
    role: String
  },
  modifiedBy: {
    name: String,
    userId: String,
    role: String,
    modifiedAt: Date
  },
  
  // Data Quality
  dataSource: {
    type: String,
    enum: ['MANUAL', 'EXCEL_UPLOAD', 'API', 'SYSTEM'],
    default: 'MANUAL'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    name: String,
    userId: String,
    verifiedAt: Date
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    name: String,
    userId: String
  }
}, {
  timestamps: true,
  collection: 'ptppayments'
});

// Indexes for better query performance
ptpPaymentSchema.index({ accountNumber: 1, paymentDate: -1 });
ptpPaymentSchema.index({ callerName: 1, status: 1 });
ptpPaymentSchema.index({ paymentDate: -1 });
ptpPaymentSchema.index({ status: 1, paymentDate: -1 });
ptpPaymentSchema.index({ customerId: 1, status: 1 });
ptpPaymentSchema.index({ employeeId: 1, paymentDate: -1 });
ptpPaymentSchema.index({ process: 1, status: 1 });
ptpPaymentSchema.index({ amAndTL: 1, status: 1 });
ptpPaymentSchema.index({ priority: 1, status: 1 });
ptpPaymentSchema.index({ isDeleted: 1 });

// Compound indexes for common queries
ptpPaymentSchema.index({ status: 1, paymentDate: -1, callerName: 1 });
ptpPaymentSchema.index({ process: 1, status: 1, paymentDate: -1 });

// Virtual for pending amount calculation
ptpPaymentSchema.virtual('calculatedPendingAmount').get(function() {
  return this.ptpAmount - this.collectedAmount;
});

// Virtual for overdue check
ptpPaymentSchema.virtual('isOverdue').get(function() {
  if (this.status === 'COLLECTED') return false;
  if (!this.paymentDate) return false;
  return new Date() > new Date(this.paymentDate);
});

// Virtual for collection efficiency
ptpPaymentSchema.virtual('collectionEfficiency').get(function() {
  if (this.ptpAmount === 0) return 0;
  return (this.collectedAmount / this.ptpAmount) * 100;
});

// Pre-save middleware to update timestamps and calculate pending amount
ptpPaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate pending amount
  if (this.collectedAmount !== undefined) {
    this.pendingAmount = this.ptpAmount - this.collectedAmount;
  }
  
  // Auto-update status based on collection
  if (this.collectedAmount >= this.ptpAmount) {
    this.status = 'COLLECTED';
    this.actualCollectionDate = this.actualCollectionDate || new Date();
  } else if (this.collectedAmount > 0 && this.collectedAmount < this.ptpAmount) {
    this.status = 'PART-PAYMENT';
  }
  
  // Check for overdue status
  if (this.status !== 'COLLECTED' && this.paymentDate && new Date() > new Date(this.paymentDate)) {
    this.previousStatus = this.status;
    this.status = 'OVERDUE';
  }
  
  next();
});

// Static method to get summary statistics
ptpPaymentSchema.statics.getSummaryStats = async function(filters = {}) {
  const matchQuery = { isDeleted: false, ...filters };
  
  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        totalAmount: { $sum: '$ptpAmount' },
        collectedAmount: { $sum: '$collectedAmount' },
        pendingAmount: { $sum: '$pendingAmount' },
        collectedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'COLLECTED'] }, 1, 0] }
        },
        ptpCount: {
          $sum: { $cond: [{ $eq: ['$status', 'PTP'] }, 1, 0] }
        },
        overdueCount: {
          $sum: { $cond: [{ $eq: ['$status', 'OVERDUE'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalRecords: 0,
    totalAmount: 0,
    collectedAmount: 0,
    pendingAmount: 0,
    collectedCount: 0,
    ptpCount: 0,
    overdueCount: 0
  };
};

// Static method to get today's PTPs
ptpPaymentSchema.statics.getTodayPTPs = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    paymentDate: { $gte: today, $lt: tomorrow },
    isDeleted: false
  });
};

// Static method to get overdue payments
ptpPaymentSchema.statics.getOverduePayments = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    paymentDate: { $lt: today },
    status: { $nin: ['COLLECTED'] },
    isDeleted: false
  });
};

// Instance method to add status history
ptpPaymentSchema.methods.addStatusHistory = function(status, changedBy, reason) {
  this.statusHistory.push({
    status,
    changedBy,
    changedAt: new Date(),
    reason
  });
  return this;
};

// Instance method to add follow-up note
ptpPaymentSchema.methods.addFollowUpNote = function(note, addedBy) {
  this.followUpNotes.push({
    note,
    addedBy,
    addedAt: new Date()
  });
  return this;
};

const PTPPayment = mongoose.model('PTPPayment', ptpPaymentSchema);

module.exports = PTPPayment;
