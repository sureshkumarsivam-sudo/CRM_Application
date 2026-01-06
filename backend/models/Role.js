const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  // Role Information
  roleName: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    enum: ['Super Admin', 'Admin', 'Team Lead', 'Manager', 'Caller', 'Field Executive'],
    trim: true
  },
  roleDescription: {
    type: String,
    trim: true
  },
  roleLevel: {
    type: Number,
    required: true,
    // 1 = Super Admin, 2 = Admin, 3 = Manager/Team Lead, 4 = Caller/Field Executive
    min: 1,
    max: 10
  },
  
  // Privileges Map - Key-Value pairs for fine-grained access control
  privileges: {
    type: Map,
    of: Boolean,
    default: {}
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
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
  }
}, {
  timestamps: true,
  collection: 'roles'
});

// Indexes
roleSchema.index({ roleName: 1 });
roleSchema.index({ roleLevel: 1 });
roleSchema.index({ isActive: 1 });

// Static method to initialize default roles and privileges
roleSchema.statics.initializeDefaultRoles = async function() {
  const defaultRoles = [
    {
      roleName: 'Super Admin',
      roleDescription: 'Full system access with all privileges',
      roleLevel: 1,
      privileges: new Map([
        // Dashboard
        ['view_dashboard', true],
        ['view_analytics', true],
        ['export_dashboard_reports', true],
        
        // User Management
        ['view_users', true],
        ['create_users', true],
        ['edit_users', true],
        ['delete_users', true],
        ['approve_users', true],
        ['manage_roles', true],
        ['grant_privileges', true],
        ['revoke_privileges', true],
        
        // Collections
        ['view_collections', true],
        ['create_ptp', true],
        ['edit_ptp', true],
        ['delete_ptp', true],
        ['approve_payments', true],
        ['upload_collection_data', true],
        ['export_collection_reports', true],
        
        // Accounts Management
        ['view_accounts', true],
        ['create_accounts', true],
        ['edit_accounts', true],
        ['delete_accounts', true],
        ['lock_unlock_accounts', true],
        ['view_account_history', true],
        
        // Customer Management
        ['view_customers', true],
        ['create_customers', true],
        ['edit_customers', true],
        ['delete_customers', true],
        ['export_customer_data', true],
        
        // Employee Management
        ['view_employees', true],
        ['create_employees', true],
        ['edit_employees', true],
        ['delete_employees', true],
        ['manage_allocations', true],
        
        // Settlements
        ['view_settlements', true],
        ['create_settlement_proposals', true],
        ['approve_settlements', true],
        ['cancel_settlements', true],
        
        // Reports
        ['view_reports', true],
        ['export_reports', true],
        ['schedule_reports', true],
        
        // System Settings
        ['view_settings', true],
        ['edit_settings', true],
        ['configure_email', true],
        ['view_audit_logs', true],
        ['manage_status_codes', true],
        
        // Field Executive
        ['view_field_assignments', true],
        ['assign_field_tasks', true],
        ['approve_field_visits', true]
      ])
    },
    {
      roleName: 'Admin',
      roleDescription: 'Administrative access with most privileges',
      roleLevel: 2,
      privileges: new Map([
        ['view_dashboard', true],
        ['view_analytics', true],
        ['export_dashboard_reports', true],
        ['view_users', true],
        ['create_users', true],
        ['edit_users', true],
        ['approve_users', true],
        ['view_collections', true],
        ['create_ptp', true],
        ['edit_ptp', true],
        ['delete_ptp', true],
        ['approve_payments', true],
        ['upload_collection_data', true],
        ['export_collection_reports', true],
        ['view_accounts', true],
        ['create_accounts', true],
        ['edit_accounts', true],
        ['lock_unlock_accounts', true],
        ['view_account_history', true],
        ['view_customers', true],
        ['create_customers', true],
        ['edit_customers', true],
        ['export_customer_data', true],
        ['view_employees', true],
        ['create_employees', true],
        ['edit_employees', true],
        ['manage_allocations', true],
        ['view_settlements', true],
        ['create_settlement_proposals', true],
        ['approve_settlements', true],
        ['view_reports', true],
        ['export_reports', true],
        ['view_settings', true],
        ['edit_settings', true],
        ['view_audit_logs', true],
        ['manage_status_codes', true],
        ['view_field_assignments', true],
        ['assign_field_tasks', true],
        ['approve_field_visits', true]
      ])
    },
    {
      roleName: 'Team Lead',
      roleDescription: 'Team management and operational access',
      roleLevel: 3,
      privileges: new Map([
        ['view_dashboard', true],
        ['view_analytics', true],
        ['view_collections', true],
        ['create_ptp', true],
        ['edit_ptp', true],
        ['upload_collection_data', true],
        ['export_collection_reports', true],
        ['view_accounts', true],
        ['edit_accounts', true],
        ['view_account_history', true],
        ['view_customers', true],
        ['edit_customers', true],
        ['export_customer_data', true],
        ['view_employees', true],
        ['manage_allocations', true],
        ['view_settlements', true],
        ['create_settlement_proposals', true],
        ['view_reports', true],
        ['export_reports', true],
        ['view_field_assignments', true],
        ['assign_field_tasks', true]
      ])
    },
    {
      roleName: 'Manager',
      roleDescription: 'Managerial access with approval rights',
      roleLevel: 3,
      privileges: new Map([
        ['view_dashboard', true],
        ['view_analytics', true],
        ['view_collections', true],
        ['create_ptp', true],
        ['edit_ptp', true],
        ['approve_payments', true],
        ['upload_collection_data', true],
        ['export_collection_reports', true],
        ['view_accounts', true],
        ['edit_accounts', true],
        ['view_account_history', true],
        ['view_customers', true],
        ['edit_customers', true],
        ['view_employees', true],
        ['view_settlements', true],
        ['approve_settlements', true],
        ['view_reports', true],
        ['export_reports', true],
        ['approve_field_visits', true]
      ])
    },
    {
      roleName: 'Caller',
      roleDescription: 'Operations staff with data entry access',
      roleLevel: 4,
      privileges: new Map([
        ['view_dashboard', true],
        ['view_collections', true],
        ['create_ptp', true],
        ['edit_ptp', true],
        ['view_accounts', true],
        ['edit_accounts', true],
        ['view_customers', true],
        ['edit_customers', true],
        ['view_settlements', true],
        ['create_settlement_proposals', true]
      ])
    },
    {
      roleName: 'Field Executive',
      roleDescription: 'Field operations staff with limited access',
      roleLevel: 4,
      privileges: new Map([
        ['view_dashboard', true],
        ['view_collections', true],
        ['create_ptp', true],
        ['view_accounts', true],
        ['view_customers', true],
        ['view_field_assignments', true]
      ])
    }
  ];
  
  for (const roleData of defaultRoles) {
    await this.findOneAndUpdate(
      { roleName: roleData.roleName },
      roleData,
      { upsert: true, new: true }
    );
  }
  
  console.log('Default roles initialized successfully');
};

// Method to get all privilege keys
roleSchema.statics.getAllPrivilegeKeys = function() {
  return [
    // Dashboard
    'view_dashboard',
    'view_analytics',
    'export_dashboard_reports',
    
    // User Management
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'approve_users',
    'manage_roles',
    'grant_privileges',
    'revoke_privileges',
    
    // Collections
    'view_collections',
    'create_ptp',
    'edit_ptp',
    'delete_ptp',
    'approve_payments',
    'upload_collection_data',
    'export_collection_reports',
    
    // Accounts
    'view_accounts',
    'create_accounts',
    'edit_accounts',
    'delete_accounts',
    'lock_unlock_accounts',
    'view_account_history',
    
    // Customers
    'view_customers',
    'create_customers',
    'edit_customers',
    'delete_customers',
    'export_customer_data',
    
    // Employees
    'view_employees',
    'create_employees',
    'edit_employees',
    'delete_employees',
    'manage_allocations',
    
    // Settlements
    'view_settlements',
    'create_settlement_proposals',
    'approve_settlements',
    'cancel_settlements',
    
    // Reports
    'view_reports',
    'export_reports',
    'schedule_reports',
    
    // Settings
    'view_settings',
    'edit_settings',
    'configure_email',
    'view_audit_logs',
    'manage_status_codes',
    
    // Field Executive
    'view_field_assignments',
    'assign_field_tasks',
    'approve_field_visits'
  ];
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
