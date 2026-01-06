const mongoose = require('mongoose');

const statusCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Positive', 'Neutral', 'Negative'],
    default: 'Neutral'
  },
  nextActionTrigger: {
    type: String,
    required: true,
    trim: true
  },
  responsible: {
    type: String,
    required: true,
    trim: true
  },
  autoEscalationLogic: {
    type: String,
    required: true,
    trim: true
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
  }
}, {
  timestamps: true,
  collection: 'Status_Code'
});

// Index for faster queries
statusCodeSchema.index({ code: 1 });
statusCodeSchema.index({ category: 1 });
statusCodeSchema.index({ isActive: 1 });

// Pre-save middleware to update timestamp
statusCodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const StatusCode = mongoose.model('StatusCode', statusCodeSchema);

module.exports = StatusCode;
