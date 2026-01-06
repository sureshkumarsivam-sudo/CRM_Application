const mongoose = require('mongoose');

const privilegeAuditLogSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  
  // Action Details
  action: {
    type: String,
    required: true,
    enum: ['GRANT', 'REVOKE', 'MODIFY', 'ROLE_CHANGE'],
    index: true
  },
  privilegeKey: {
    type: String,
    required: true
  },
  privilegeName: {
    type: String
  },
  previousValue: {
    type: Boolean
  },
  newValue: {
    type: Boolean
  },
  
  // Performed By
  performedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  
  // Metadata
  reason: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  // Timestamps
  performedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'privilegeauditlogs'
});

// Indexes
privilegeAuditLogSchema.index({ userId: 1, performedAt: -1 });
privilegeAuditLogSchema.index({ action: 1, performedAt: -1 });
privilegeAuditLogSchema.index({ 'performedBy.userId': 1, performedAt: -1 });

// Static method to log privilege change
privilegeAuditLogSchema.statics.logPrivilegeChange = async function(data) {
  return this.create({
    userId: data.userId,
    userName: data.userName,
    userRole: data.userRole,
    action: data.action,
    privilegeKey: data.privilegeKey,
    privilegeName: data.privilegeName,
    previousValue: data.previousValue,
    newValue: data.newValue,
    performedBy: data.performedBy,
    reason: data.reason,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  });
};

// Static method to get user's privilege history
privilegeAuditLogSchema.statics.getUserPrivilegeHistory = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ performedAt: -1 })
    .limit(limit)
    .populate('performedBy.userId', 'fullName email role');
};

const PrivilegeAuditLog = mongoose.model('PrivilegeAuditLog', privilegeAuditLogSchema);

module.exports = PrivilegeAuditLog;
