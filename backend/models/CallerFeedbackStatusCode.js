const mongoose = require('mongoose');

const callerFeedbackStatusCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  nextActionTrigger: {
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
});

// Update the updatedAt field on save
callerFeedbackStatusCodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
callerFeedbackStatusCodeSchema.index({ code: 1 });
callerFeedbackStatusCodeSchema.index({ statusName: 1 });
callerFeedbackStatusCodeSchema.index({ isActive: 1 });

module.exports = mongoose.model('CallerFeedbackStatusCode', callerFeedbackStatusCodeSchema);