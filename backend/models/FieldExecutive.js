const mongoose = require('mongoose');

const fieldExecutiveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  team: {
    type: String,
    required: true,
    trim: true
  },
  allocated: {
    type: Number,
    default: 0
  },
  visited: {
    type: Number,
    default: 0
  },
  validVisits: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0,
    comment: 'Distance in KM'
  },
  photos: {
    type: Number,
    default: 0
  },
  avgVisitsPerDay: {
    type: Number,
    default: 0
  },
  validVisitPercentage: {
    type: Number,
    default: 0
  },
  avgTimePerVisit: {
    type: Number,
    default: 0,
    comment: 'Time in minutes'
  },
  efficiencyScore: {
    type: Number,
    default: 0
  },
  collectionAmount: {
    type: Number,
    default: 0
  },
  targetAchievement: {
    type: Number,
    default: 0,
    comment: 'Percentage'
  },
  settlements: {
    type: Number,
    default: 0
  },
  attendance: {
    type: Number,
    default: 0,
    comment: 'Percentage'
  },
  overallRating: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Poor', 'N/A'],
    default: 'N/A'
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate valid visit percentage before saving
fieldExecutiveSchema.pre('save', function(next) {
  if (this.visited > 0) {
    this.validVisitPercentage = Math.round((this.validVisits / this.visited) * 100);
  }
  
  if (this.collectionAmount > 0 && this.targetAchievement === 0) {
    // This can be set based on target if needed
    this.targetAchievement = 0;
  }
  
  next();
});

// Index for faster queries
fieldExecutiveSchema.index({ employeeId: 1 });
fieldExecutiveSchema.index({ region: 1, team: 1 });
fieldExecutiveSchema.index({ isActive: 1 });
fieldExecutiveSchema.index({ createdAt: -1 });

const FieldExecutive = mongoose.model('FieldExecutive', fieldExecutiveSchema);

module.exports = FieldExecutive;
