const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  loanId: {
    type: String,
    required: true,
    index: true
  },
  statusCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  statusLabel: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    required: true
  },
  activityType: {
    type: String,
    default: 'Feedback'
  },
  followUpDate: {
    type: Date
  },
  promiseAmount: {
    type: Number
  },
  createdBy: {
    type: String,
    required: true
  },
  userRole: {
    type: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
feedbackSchema.index({ customerId: 1, createdAt: -1 });
feedbackSchema.index({ loanId: 1, createdAt: -1 });
feedbackSchema.index({ statusCode: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
