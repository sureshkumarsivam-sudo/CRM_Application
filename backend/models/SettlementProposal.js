const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  installmentNumber: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: Date,
  status: {
    type: String,
    enum: ['Pending', 'SCHEDULED', 'PAID', 'Paid', 'GRACE_PERIOD', 'OVERDUE', 'Overdue'],
    default: 'Pending'
  },
  overdueDate: Date,
  paymentReference: String
});

const approvalSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['L1', 'L2'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    name: String,
    userId: String,
    role: String
  },
  approvedAt: Date,
  comments: String
});

const settlementProposalSchema = new mongoose.Schema({
  // Letter ID (auto-generated)
  letterId: {
    type: String,
    unique: true,
    index: true
  },
  
  // Proposal Type
  proposalType: {
    type: String,
    enum: ['Settlement', 'Closure'],
    required: true
  },
  
  // Customer & Account Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  accountNumber: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  
  // Financial Details
  totalOutstanding: {
    type: Number,
    required: true,
    min: 0
  },
  principalOutstanding: {
    type: Number,
    required: true,
    min: 0
  },
  proposedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  waiverAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  waiverPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Payment Structure
  paymentType: {
    type: String,
    enum: ['One-Time', 'Installment'],
    default: 'One-Time'
  },
  numberOfInstallments: {
    type: Number,
    min: 1,
    max: 10,
    default: 1
  },
  installments: [installmentSchema],
  
  // Status & Workflow
  // Note: After L1 and L2 approval, status is set to "Active" (not "Approved")
  // Status remains "Active" until settlement is fully completed, then becomes "Completed"
  status: {
    type: String,
    enum: ['Pending L1', 'Pending L2', 'Active', 'Completed', 'Rejected', 'Cancelled', 'Broken Settlement', 'Invalid Proposal'],
    default: 'Pending L1',
    index: true
  },
  statusMessage: {
    type: String,
    default: ''
  },
  completedDate: Date,
  approvals: [approvalSchema],
  
  // Letter & Documentation
  letterGenerated: {
    type: Boolean,
    default: false
  },
  letterGeneratedDate: Date,
  letterUrl: String,
  letterCancelledDate: Date,
  cancelledBy: {
    name: String,
    userId: String,
    role: String
  },
  
  // Dates
  proposalDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  approvalDate: Date,
  completionDate: Date,
  
  // Audit Trail
  createdBy: {
    name: String,
    userId: String,
    role: String
  },
  modifiedBy: {
    name: String,
    userId: String,
    role: String
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  
  // Additional Notes
  notes: String,
  internalNotes: String,
  
  // Account Lock Management
  accountLocked: {
    type: Boolean,
    default: false,
    index: true
  },
  lockReason: {
    type: String,
    enum: [
      'Under Processing',           // Pending L1/L2
      'Approved',                   // L1 Approved or Active
      'Under Settlement Period',    // Active with pending installments
      'Invalid Proposal',           // Payment overdue
      'Broken Settlement',          // Payment overdue (broken)
      'Cancellation In Progress',   // Cancelled status
      null
    ],
    default: null
  },
  lockDate: Date,
  unlockDate: Date,
  
  // Grace Period for Overdue Payments
  gracePeriodDays: {
    type: Number,
    default: 5,
    min: 0,
    max: 30
  },
  
  // Last Payment Check
  lastPaymentCheck: Date,
  overdueNotificationSent: {
    type: Boolean,
    default: false
  },
  overdueNotificationDate: Date
}, {
  timestamps: true
});

// Pre-save hook to generate Letter ID
settlementProposalSchema.pre('save', async function(next) {
  if (!this.letterId) {
    const prefix = this.proposalType === 'Settlement' ? 'STL' : 'CLO';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the last proposal for this type and month
    const lastProposal = await this.constructor.findOne({
      letterId: new RegExp(`^${prefix}/Chennai/${year}${month}`)
    }).sort({ letterId: -1 });
    
    let sequence = 1;
    if (lastProposal && lastProposal.letterId) {
      const lastSequence = parseInt(lastProposal.letterId.split('/').pop());
      sequence = lastSequence + 1;
    }
    
    this.letterId = `${prefix}/Chennai/${year}${month}/${String(sequence).padStart(4, '0')}`;
  }
  
  // Auto-lock/unlock account based on status
  const lockingStatuses = ['Pending L1', 'L1 Approved', 'Pending L2', 'Active'];
  const unlockingStatuses = ['Completed', 'Rejected'];
  
  if (lockingStatuses.includes(this.status)) {
    this.accountLocked = true;
    if (!this.lockDate) {
      this.lockDate = new Date();
    }
    
    // Set lock reason based on status
    if (this.status === 'Pending L1' || this.status === 'Pending L2') {
      this.lockReason = 'Under Processing';
    } else if (this.status === 'L1 Approved') {
      this.lockReason = 'Approved';
    } else if (this.status === 'Active') {
      // Check if there are pending installments
      const hasPendingInstallments = this.installments && 
        this.installments.some(inst => inst.status === 'Pending' || inst.status === 'Overdue');
      
      if (hasPendingInstallments) {
        this.lockReason = 'Under Settlement Period';
      } else {
        this.lockReason = 'Approved';
      }
    }
  } else if (unlockingStatuses.includes(this.status)) {
    this.accountLocked = false;
    this.lockReason = null;
    if (!this.unlockDate) {
      this.unlockDate = new Date();
    }
  } else if (this.status === 'Cancelled') {
    this.accountLocked = true;
    this.lockReason = 'Cancellation In Progress';
  }
  
  next();
});

// Indexes for better query performance
settlementProposalSchema.index({ customerId: 1, status: 1 });
settlementProposalSchema.index({ proposalDate: -1 });
settlementProposalSchema.index({ status: 1, proposalDate: -1 });
settlementProposalSchema.index({ accountNumber: 1, accountLocked: 1 });
settlementProposalSchema.index({ accountNumber: 1, status: 1 });

module.exports = mongoose.model('SettlementProposal', settlementProposalSchema);
