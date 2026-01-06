const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password by default
  },
  
  // Role-Based Access
  role: {
    type: String,
    required: [true, 'User role is required'],
    enum: ['Super Admin', 'Admin', 'Team Lead', 'Manager', 'Caller', 'Field Executive'],
    default: 'Caller'
  },
  
  // Account Status
  accountStatus: {
    type: String,
    enum: ['Pending Approval', 'Active', 'Suspended', 'Deactivated', 'Rejected'],
    default: 'Pending Approval'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  
  // Approval Tracking
  approvedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    approvedAt: Date
  },
  rejectedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    rejectedAt: Date,
    reason: String
  },
  
  // Security
  lastLogin: {
    type: Date
  },
  lastLoginIP: {
    type: String
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedUntil: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  
  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  
  // Session Management
  refreshTokens: [{
    token: String,
    createdAt: Date,
    expiresAt: Date,
    ipAddress: String,
    userAgent: String
  }],
  
  // Profile Information
  profilePicture: {
    type: String
  },
  department: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  reportingTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Privileges (Reference to Role privileges + user-specific overrides)
  customPrivileges: {
    type: Map,
    of: Boolean,
    default: {}
  },
  
  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Audit Trail
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String
  },
  modifiedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    modifiedAt: Date
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ isDeleted: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token is created after password change
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockedUntil && this.lockedUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockedUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes
  
  // Lock the account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = {
      isLocked: true,
      lockedUntil: Date.now() + lockTime
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0, isLocked: false },
    $unset: { lockedUntil: 1 }
  });
};

// Static method to check if user has privilege
userSchema.statics.hasPrivilege = async function(userId, privilegeKey) {
  const user = await this.findById(userId);
  if (!user) return false;
  
  // Check custom privileges first
  if (user.customPrivileges && user.customPrivileges.has(privilegeKey)) {
    return user.customPrivileges.get(privilegeKey);
  }
  
  // Check role-based privileges
  const Role = mongoose.model('Role');
  const role = await Role.findOne({ roleName: user.role });
  
  if (role && role.privileges) {
    return role.privileges.get(privilegeKey) || false;
  }
  
  return false;
};

// Virtual for full display name with role
userSchema.virtual('displayName').get(function() {
  return `${this.fullName} (${this.role})`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
