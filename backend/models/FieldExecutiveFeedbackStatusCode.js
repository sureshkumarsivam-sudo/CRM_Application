const mongoose = require('mongoose');

const fieldExecutiveFeedbackStatusCodeSchema = new mongoose.Schema({
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
fieldExecutiveFeedbackStatusCodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
fieldExecutiveFeedbackStatusCodeSchema.index({ code: 1 });
fieldExecutiveFeedbackStatusCodeSchema.index({ statusName: 1 });
fieldExecutiveFeedbackStatusCodeSchema.index({ isActive: 1 });

module.exports = mongoose.model('FieldExecutiveFeedbackStatusCode', fieldExecutiveFeedbackStatusCodeSchema);