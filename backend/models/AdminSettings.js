const mongoose = require('mongoose');

// User Role Waiver Limits Schema
const userRoleWaiverLimitSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Manager L2', 'Manager L1', 'User'],
    unique: true
  },
  maxWaiverPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxWaiverAmount: {
    type: Number,
    required: true,
    min: 0
  },
  approvalRequired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Global Waiver Policy Schema
const globalWaiverPolicySchema = new mongoose.Schema({
  minWaiverPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxWaiverPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  colorThresholds: {
    green: {
      min: { type: Number, required: true, default: 0 },
      max: { type: Number, required: true, default: 40 }
    },
    amber: {
      min: { type: Number, required: true, default: 40 },
      max: { type: Number, required: true, default: 60 }
    },
    red: {
      min: { type: Number, required: true, default: 60 },
      max: { type: Number, required: true, default: 100 }
    }
  }
}, {
  timestamps: true
});

// Installment Defaults Schema
const installmentDefaultsSchema = new mongoose.Schema({
  minInstallmentCount: {
    type: Number,
    required: true,
    min: 1
  },
  maxInstallmentCount: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Letter Template Schema
const letterTemplateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: true,
    trim: true
  },
  templateType: {
    type: String,
    required: true,
    enum: ['Settlement', 'Closure', 'NOC', 'NDC']
  },
  content: {
    type: String,
    required: true
  },
  placeholders: [{
    name: String,
    description: String
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Active'
  },
  version: {
    type: Number,
    default: 1
  },
  versionHistory: [{
    version: Number,
    content: String,
    modifiedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String
    },
    modifiedAt: Date
  }],
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String
  },
  modifiedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String
  }
}, {
  timestamps: true
});

// Settings Audit Trail Schema
const settingsAuditTrailSchema = new mongoose.Schema({
  settingName: {
    type: String,
    required: true
  },
  settingType: {
    type: String,
    required: true,
    enum: ['User Role Waiver Limits', 'Global Waiver Policy', 'Installment Defaults', 'Letter Templates']
  },
  action: {
    type: String,
    required: true,
    enum: ['Created', 'Updated', 'Deleted']
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  modifiedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    role: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
settingsAuditTrailSchema.index({ timestamp: -1 });
settingsAuditTrailSchema.index({ settingType: 1, timestamp: -1 });
settingsAuditTrailSchema.index({ 'modifiedBy.userId': 1, timestamp: -1 });

// Models
const UserRoleWaiverLimit = mongoose.model('UserRoleWaiverLimit', userRoleWaiverLimitSchema);
const GlobalWaiverPolicy = mongoose.model('GlobalWaiverPolicy', globalWaiverPolicySchema);
const InstallmentDefaults = mongoose.model('InstallmentDefaults', installmentDefaultsSchema);
const LetterTemplate = mongoose.model('LetterTemplate', letterTemplateSchema);
const SettingsAuditTrail = mongoose.model('SettingsAuditTrail', settingsAuditTrailSchema);

module.exports = {
  UserRoleWaiverLimit,
  GlobalWaiverPolicy,
  InstallmentDefaults,
  LetterTemplate,
  SettingsAuditTrail
};
