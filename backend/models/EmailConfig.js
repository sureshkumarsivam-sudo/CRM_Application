const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['SMTP', 'Office365', 'Gmail'],
    required: true,
    default: 'SMTP'
  },
  fromEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  smtpHost: {
    type: String,
    trim: true
  },
  smtpPort: {
    type: Number,
    default: 587
  },
  smtpUsername: {
    type: String,
    trim: true
  },
  smtpPassword: {
    type: String // Encrypted in production
  },
  smtpSecure: {
    type: Boolean,
    default: false // true for 465, false for other ports
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTested: {
    type: Date
  },
  testResult: {
    success: Boolean,
    message: String,
    testedAt: Date
  },
  createdBy: {
    name: String,
    userId: String,
    role: String
  },
  updatedBy: {
    name: String,
    userId: String,
    role: String
  }
}, {
  timestamps: true
});

// Only allow one active configuration
emailConfigSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

module.exports = mongoose.model('EmailConfig', emailConfigSchema);
