const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  templateType: {
    type: String,
    enum: ['LetterApproved', 'PaymentReminder', 'OverdueAlert', 'CancellationConfirmation'],
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  placeholders: [{
    key: String,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    name: String,
    userId: String,
    role: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
