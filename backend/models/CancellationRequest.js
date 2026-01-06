const mongoose = require('mongoose');

const cancellationRequestSchema = new mongoose.Schema({
  // Reference to Settlement Proposal
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SettlementProposal',
    required: true,
    index: true
  },
  
  // Letter Information
  letterId: {
    type: String,
    required: true,
    index: true
  },
  
  // Customer & Account Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
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
  
  // Cancellation Details
  cancellationReason: {
    type: String,
    enum: [
      'Customer requested cancellation',
      'Account settled through other means',
      'Customer default/unable to pay',
      'Administrative correction needed',
      'Other'
    ],
    required: true
  },
  
  cancellationReasonDetails: String, // For "Other" option
  additionalComments: String,
  
  // Workflow Status
  status: {
    type: String,
    enum: [
      'Awaiting L1 Manager Review',
      'L1 Approved - Awaiting Admin',
      'L1 Rejected',
      'Admin Finalized',
      'Cancelled'
    ],
    default: 'Awaiting L1 Manager Review',
    index: true
  },
  
  // L1 Manager Review
  l1Review: {
    reviewedBy: {
      name: String,
      userId: String,
      role: String
    },
    reviewDate: Date,
    decision: {
      type: String,
      enum: ['Approve', 'Reject', null],
      default: null
    },
    comments: String
  },
  
  // Admin Finalization
  adminFinalization: {
    finalizedBy: {
      name: String,
      userId: String,
      role: String
    },
    finalizationDate: Date,
    comments: String,
    accountUnlocked: {
      type: Boolean,
      default: false
    }
  },
  
  // Request Audit
  requestedBy: {
    name: String,
    userId: String,
    role: String,
    requestDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Notifications
  notifications: [{
    recipient: {
      type: String,
      enum: ['User', 'L1 Manager', 'Admin']
    },
    sentDate: Date,
    message: String,
    read: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
cancellationRequestSchema.index({ status: 1, createdAt: -1 });
cancellationRequestSchema.index({ proposalId: 1, status: 1 });
cancellationRequestSchema.index({ accountNumber: 1 });
cancellationRequestSchema.index({ 'requestedBy.userId': 1 });

module.exports = mongoose.model('CancellationRequest', cancellationRequestSchema);
