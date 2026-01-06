const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  emailType: {
    type: String,
    enum: ['LetterApproved', 'PaymentReminder', 'OverdueAlert', 'CancellationConfirmation', 'Test'],
    required: true
  },
  recipientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  recipientName: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Sent', 'Failed', 'Bounced', 'Pending'],
    default: 'Pending'
  },
  sentAt: {
    type: Date
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  errorDetails: {
    message: String,
    code: String,
    stack: String
  },
  relatedEntity: {
    type: {
      type: String,
      enum: ['SettlementProposal', 'PTPPayment', 'CancellationRequest', 'Customer']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    letterNumber: String,
    accountNumber: String,
    customerName: String,
    installmentNumber: Number,
    dueDate: Date,
    amountDue: Number
  },
  attachments: [{
    filename: String,
    path: String,
    contentType: String
  }],
  providerResponse: {
    messageId: String,
    response: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
emailLogSchema.index({ emailType: 1, status: 1, createdAt: -1 });
emailLogSchema.index({ recipientEmail: 1, createdAt: -1 });
emailLogSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
