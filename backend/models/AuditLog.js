const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Reference to Settlement Proposal (optional for customer-only audits)
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SettlementProposal',
    index: true
  },
  letterId: {
    type: String,
    index: true
  },
  
  // Reference to Customer (for account status changes)
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  accountNumber: {
    type: String,
    index: true
  },
  
  // Action Details
  action: {
    type: String,
    required: true,
    enum: [
      'Proposal Created',
      'L1 Review',
      'L1 Approved',
      'L1 Rejected',
      'L2 Review',
      'L2 Approval & Letter Generation',
      'Letter Generated',
      'Payment Received',
      'Installment Paid',
      'Proposal Completed',
      'Proposal Cancelled',
      'Proposal Modified',
      'Status Changed',
      'Payment Marked as Paid',
      'Payment Marked as Paid - Account Status Updated',
      'Account Status Updated'
    ]
  },
  
  // User Information
  user: {
    name: {
      type: String,
      required: true
    },
    userId: String,
    role: {
      type: String,
      enum: ['Initiator', 'Manager L1', 'Manager L2', 'Admin', 'System'],
      required: true
    }
  },
  
  // Additional Details
  details: String,
  previousStatus: String,
  newStatus: String,
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Indexes
auditLogSchema.index({ proposalId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
