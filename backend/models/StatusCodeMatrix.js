const mongoose = require('mongoose');

const statusCodeMatrixSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  statusName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  applicableFor: {
    type: String,
    enum: ['CALLER', 'FIELD_EXECUTIVE', 'BOTH', 'TELECALLER', 'INHOUSE'],
    required: true,
    default: 'BOTH'
  },
  category: {
    type: String,
    enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'CONTACT_ESTABLISHED', 'NON_CONTACT', 'REFUSAL', 'ADMINISTRATIVE'],
    required: true
  },
  nextActionTrigger: {
    type: String,
    required: true,
    trim: true
  },
  remarksRequired: {
    type: Boolean,
    default: false
  },
  responsibleTeam: {
    type: String,
    enum: ['TELECALLER', 'TL', 'FE', 'MANAGER', 'LEGAL', 'OPERATIONS'],
    required: true
  },
  autoEscalation: {
    enabled: {
      type: Boolean,
      default: false
    },
    timeInHours: {
      type: Number,
      default: 24
    },
    escalateTo: {
      type: String,
      enum: ['TL', 'MANAGER', 'LEGAL', 'OPERATIONS', 'NONE'],
      default: 'NONE'
    }
  },
  automation: {
    createFollowUpTask: {
      type: Boolean,
      default: false
    },
    sendSMS: {
      type: Boolean,
      default: false
    },
    triggerSettlementWorkflow: {
      type: Boolean,
      default: false
    },
    triggerEscalationWorkflow: {
      type: Boolean,
      default: false
    },
    createDisputeCase: {
      type: Boolean,
      default: false
    },
    assignToFieldVisit: {
      type: Boolean,
      default: false
    },
    triggerSkipTracing: {
      type: Boolean,
      default: false
    },
    createDataCorrectionTask: {
      type: Boolean,
      default: false
    },
    updateAddressStatus: {
      type: Boolean,
      default: false
    },
    lockAllocation: {
      type: Boolean,
      default: false
    },
    createPTPReminder: {
      type: Boolean,
      default: false
    },
    generateReceipt: {
      type: Boolean,
      default: false
    },
    updateOutstanding: {
      type: Boolean,
      default: false
    }
  },
  addressStatus: {
    type: String,
    enum: ['LIVE', 'SKIPPED', 'TRACED', 'NOT_VERIFIED', 'NONE'],
    default: 'NONE'
  },
  priority: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#FFB84D'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: 'System'
  },
  updatedBy: {
    type: String,
    default: 'System'
  }
});

// Update the updatedAt field on save
statusCodeMatrixSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
statusCodeMatrixSchema.index({ code: 1 });
statusCodeMatrixSchema.index({ statusName: 1 });
statusCodeMatrixSchema.index({ applicableFor: 1 });
statusCodeMatrixSchema.index({ isActive: 1 });
statusCodeMatrixSchema.index({ priority: -1 });

module.exports = mongoose.model('StatusCodeMatrix', statusCodeMatrixSchema);
