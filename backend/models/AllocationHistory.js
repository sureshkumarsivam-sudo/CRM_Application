const mongoose = require('mongoose');

const allocationHistorySchema = new mongoose.Schema({
  // Reference to main allocation
  allocationId: {
    type: String,
    required: true,
    index: true
  },
  
  // Account Reference
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  
  loanId: {
    type: String,
    index: true
  },
  
  accountName: String,
  
  // Action Details
  action: {
    type: String,
    enum: ['Allocated', 'Reassigned', 'Completed', 'Cancelled', 'Performance Update', 'Status Change'],
    required: true
  },
  
  // From Details (for reallocation)
  from: {
    callerName: String,
    callerId: String,
    team: String,
    allocationId: String
  },
  
  // To Details
  to: {
    callerName: String,
    callerId: String,
    team: String,
    allocationId: String
  },
  
  // Change Details
  changes: {
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  },
  
  // Reason & Notes
  reason: String,
  notes: String,
  
  // Performance Snapshot (at time of action)
  performanceSnapshot: {
    contacted: Number,
    promiseToPay: Number,
    collected: Number,
    collectionAmount: Number,
    completionPercentage: Number
  },
  
  // User who performed the action
  performedBy: {
    name: String,
    userId: String,
    role: String
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
  
}, {
  timestamps: true
});

// Indexes
allocationHistorySchema.index({ allocationId: 1, timestamp: -1 });
allocationHistorySchema.index({ accountId: 1, timestamp: -1 });
allocationHistorySchema.index({ loanId: 1, timestamp: -1 });
allocationHistorySchema.index({ 'to.callerName': 1, timestamp: -1 });
allocationHistorySchema.index({ action: 1, timestamp: -1 });

const AllocationHistory = mongoose.model('AllocationHistory', allocationHistorySchema);

module.exports = AllocationHistory;
