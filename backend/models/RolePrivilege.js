const mongoose = require('mongoose');

const rolePrivilegeSchema = new mongoose.Schema({
  role_name: {
    type: String,
    required: [true, 'Role name is required'],
    enum: ['Super Admin', 'Admin', 'Team Lead', 'Manager', 'Caller', 'Field Executive'],
    unique: true,
    trim: true
  },
  
  // Menu-level privileges (determines menu visibility)
  menu_access: {
    dashboard: { type: Boolean, default: true },
    accounts: { type: Boolean, default: true },
    allocations: { type: Boolean, default: true },
    collections: { type: Boolean, default: true },
    settlements: { type: Boolean, default: true },
    field_executive: { type: Boolean, default: true },
    documents: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    settings: { type: Boolean, default: false },
    employees: { type: Boolean, default: false },
    audit: { type: Boolean, default: false },
    admin: { type: Boolean, default: false }
  },
  
  // Granular privileges for actions within each module
  privileges: {
    // Dashboard Privileges
    dashboard: {
      view_dashboard: { type: Boolean, default: true },
      view_analytics: { type: Boolean, default: false },
      export_dashboard_reports: { type: Boolean, default: false }
    },
    
    // User Management Privileges
    user_management: {
      view_users: { type: Boolean, default: false },
      create_users: { type: Boolean, default: false },
      edit_users: { type: Boolean, default: false },
      delete_users: { type: Boolean, default: false },
      approve_users: { type: Boolean, default: false },
      manage_roles: { type: Boolean, default: false },
      grant_privileges: { type: Boolean, default: false },
      revoke_privileges: { type: Boolean, default: false }
    },
    
    // Collections Privileges
    collections: {
      view_collections: { type: Boolean, default: true },
      create_ptp: { type: Boolean, default: false },
      edit_ptp: { type: Boolean, default: false },
      delete_ptp: { type: Boolean, default: false },
      approve_payments: { type: Boolean, default: false },
      upload_collection_data: { type: Boolean, default: false },
      export_collection_reports: { type: Boolean, default: false }
    },
    
    // Accounts Privileges
    accounts: {
      view_accounts: { type: Boolean, default: true },
      create_accounts: { type: Boolean, default: false },
      edit_accounts: { type: Boolean, default: false },
      delete_accounts: { type: Boolean, default: false },
      lock_unlock_accounts: { type: Boolean, default: false },
      view_account_history: { type: Boolean, default: false }
    },
    
    // Customers Privileges
    customers: {
      view_customers: { type: Boolean, default: true },
      create_customers: { type: Boolean, default: false },
      edit_customers: { type: Boolean, default: false },
      delete_customers: { type: Boolean, default: false },
      export_customer_data: { type: Boolean, default: false }
    },
    
    // Employees Privileges
    employees: {
      view_employees: { type: Boolean, default: false },
      create_employees: { type: Boolean, default: false },
      edit_employees: { type: Boolean, default: false },
      delete_employees: { type: Boolean, default: false },
      manage_allocations: { type: Boolean, default: false }
    },
    
    // Settlements Privileges
    settlements: {
      view_settlements: { type: Boolean, default: true },
      create_settlement_proposals: { type: Boolean, default: false },
      approve_settlements: { type: Boolean, default: false },
      cancel_settlements: { type: Boolean, default: false }
    },
    
    // Reports Privileges
    reports: {
      view_reports: { type: Boolean, default: true },
      export_reports: { type: Boolean, default: false },
      schedule_reports: { type: Boolean, default: false }
    },
    
    // Settings Privileges
    settings: {
      view_settings: { type: Boolean, default: false },
      edit_settings: { type: Boolean, default: false },
      configure_email: { type: Boolean, default: false },
      view_audit_logs: { type: Boolean, default: false },
      manage_status_codes: { type: Boolean, default: false }
    },
    
    // Field Operations Privileges
    field_operations: {
      view_field_assignments: { type: Boolean, default: false },
      assign_field_tasks: { type: Boolean, default: false },
      approve_field_visits: { type: Boolean, default: false }
    },
    
    // Documents Privileges
    documents: {
      view_documents: { type: Boolean, default: true },
      upload_documents: { type: Boolean, default: false },
      delete_documents: { type: Boolean, default: false },
      approve_documents: { type: Boolean, default: false }
    },
    
    // Audit Privileges
    audit: {
      view_audit_logs: { type: Boolean, default: false },
      export_audit_logs: { type: Boolean, default: false },
      delete_audit_logs: { type: Boolean, default: false }
    },
    
    // Allocations Privileges
    allocations: {
      view_allocations: { type: Boolean, default: true },
      create_allocations: { type: Boolean, default: false },
      edit_allocations: { type: Boolean, default: false },
      delete_allocations: { type: Boolean, default: false }
    }
  },
  
  description: {
    type: String,
    default: ''
  },
  
  is_active: {
    type: Boolean,
    default: true
  },
  
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster role lookups
rolePrivilegeSchema.index({ role_name: 1 });

// Method to check if a specific privilege is granted
rolePrivilegeSchema.methods.hasPrivilege = function(category, privilege) {
  if (!this.privileges[category]) return false;
  return this.privileges[category][privilege] === true;
};

// Method to check if menu should be visible
rolePrivilegeSchema.methods.hasMenuAccess = function(menuKey) {
  return this.menu_access[menuKey] === true;
};

// Method to get all enabled privileges
rolePrivilegeSchema.methods.getEnabledPrivileges = function() {
  const enabled = {};
  
  Object.keys(this.privileges).forEach(category => {
    enabled[category] = {};
    Object.keys(this.privileges[category]).forEach(privilege => {
      if (this.privileges[category][privilege] === true) {
        enabled[category][privilege] = true;
      }
    });
  });
  
  return enabled;
};

// Static method to initialize default role privileges
rolePrivilegeSchema.statics.initializeDefaultRoles = async function() {
  const defaultRoles = [
    {
      role_name: 'Super Admin',
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: true,
        settings: true,
        employees: true,
        audit: true,
        admin: true
      },
      privileges: {
        dashboard: {
          view_dashboard: true,
          view_analytics: true,
          export_dashboard_reports: true
        },
        user_management: {
          view_users: true,
          create_users: true,
          edit_users: true,
          delete_users: true,
          approve_users: true,
          manage_roles: true,
          grant_privileges: true,
          revoke_privileges: true
        },
        collections: {
          view_collections: true,
          create_ptp: true,
          edit_ptp: true,
          delete_ptp: true,
          approve_payments: true,
          upload_collection_data: true,
          export_collection_reports: true
        },
        accounts: {
          view_accounts: true,
          create_accounts: true,
          edit_accounts: true,
          delete_accounts: true,
          lock_unlock_accounts: true,
          view_account_history: true
        },
        customers: {
          view_customers: true,
          create_customers: true,
          edit_customers: true,
          delete_customers: true,
          export_customer_data: true
        },
        employees: {
          view_employees: true,
          create_employees: true,
          edit_employees: true,
          delete_employees: true,
          manage_allocations: true
        },
        settlements: {
          view_settlements: true,
          create_settlement_proposals: true,
          approve_settlements: true,
          cancel_settlements: true
        },
        reports: {
          view_reports: true,
          export_reports: true,
          schedule_reports: true
        },
        settings: {
          view_settings: true,
          edit_settings: true,
          configure_email: true,
          view_audit_logs: true,
          manage_status_codes: true
        },
        field_operations: {
          view_field_assignments: true,
          assign_field_tasks: true,
          approve_field_visits: true
        },
        documents: {
          view_documents: true,
          upload_documents: true,
          delete_documents: true,
          approve_documents: true
        },
        audit: {
          view_audit_logs: true,
          export_audit_logs: true,
          delete_audit_logs: true
        },
        allocations: {
          view_allocations: true,
          create_allocations: true,
          edit_allocations: true,
          delete_allocations: true
        }
      },
      description: 'Full system access with all privileges'
    },
    {
      role_name: 'Admin',
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: true,
        settings: true,
        employees: true,
        audit: true,
        admin: true
      },
      privileges: {
        dashboard: {
          view_dashboard: true,
          view_analytics: true,
          export_dashboard_reports: true
        },
        user_management: {
          view_users: true,
          create_users: true,
          edit_users: true,
          delete_users: false,
          approve_users: true,
          manage_roles: true,
          grant_privileges: true,
          revoke_privileges: true
        },
        collections: {
          view_collections: true,
          create_ptp: true,
          edit_ptp: true,
          delete_ptp: true,
          approve_payments: true,
          upload_collection_data: true,
          export_collection_reports: true
        },
        accounts: {
          view_accounts: true,
          create_accounts: true,
          edit_accounts: true,
          delete_accounts: false,
          lock_unlock_accounts: true,
          view_account_history: true
        },
        customers: {
          view_customers: true,
          create_customers: true,
          edit_customers: true,
          delete_customers: false,
          export_customer_data: true
        },
        employees: {
          view_employees: true,
          create_employees: true,
          edit_employees: true,
          delete_employees: false,
          manage_allocations: true
        },
        settlements: {
          view_settlements: true,
          create_settlement_proposals: true,
          approve_settlements: true,
          cancel_settlements: true
        },
        reports: {
          view_reports: true,
          export_reports: true,
          schedule_reports: true
        },
        settings: {
          view_settings: true,
          edit_settings: true,
          configure_email: true,
          view_audit_logs: true,
          manage_status_codes: true
        },
        field_operations: {
          view_field_assignments: true,
          assign_field_tasks: true,
          approve_field_visits: true
        },
        documents: {
          view_documents: true,
          upload_documents: true,
          delete_documents: true,
          approve_documents: true
        },
        audit: {
          view_audit_logs: true,
          export_audit_logs: true,
          delete_audit_logs: false
        },
        allocations: {
          view_allocations: true,
          create_allocations: true,
          edit_allocations: true,
          delete_allocations: true
        }
      },
      description: 'Administrative access with most privileges'
    },
    {
      role_name: 'Team Lead',
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: true,
        settings: false,
        employees: true,
        audit: false,
        admin: false
      },
      privileges: {
        dashboard: {
          view_dashboard: true,
          view_analytics: true,
          export_dashboard_reports: true
        },
        user_management: {
          view_users: true,
          create_users: false,
          edit_users: false,
          delete_users: false,
          approve_users: false,
          manage_roles: false,
          grant_privileges: false,
          revoke_privileges: false
        },
        collections: {
          view_collections: true,
          create_ptp: true,
          edit_ptp: true,
          delete_ptp: false,
          approve_payments: true,
          upload_collection_data: true,
          export_collection_reports: true
        },
        accounts: {
          view_accounts: true,
          create_accounts: true,
          edit_accounts: true,
          delete_accounts: false,
          lock_unlock_accounts: false,
          view_account_history: true
        },
        customers: {
          view_customers: true,
          create_customers: true,
          edit_customers: true,
          delete_customers: false,
          export_customer_data: true
        },
        employees: {
          view_employees: true,
          create_employees: false,
          edit_employees: false,
          delete_employees: false,
          manage_allocations: true
        },
        settlements: {
          view_settlements: true,
          create_settlement_proposals: true,
          approve_settlements: false,
          cancel_settlements: false
        },
        reports: {
          view_reports: true,
          export_reports: true,
          schedule_reports: false
        },
        settings: {
          view_settings: false,
          edit_settings: false,
          configure_email: false,
          view_audit_logs: false,
          manage_status_codes: false
        },
        field_operations: {
          view_field_assignments: true,
          assign_field_tasks: true,
          approve_field_visits: true
        },
        documents: {
          view_documents: true,
          upload_documents: true,
          delete_documents: false,
          approve_documents: false
        },
        audit: {
          view_audit_logs: false,
          export_audit_logs: false,
          delete_audit_logs: false
        },
        allocations: {
          view_allocations: true,
          create_allocations: true,
          edit_allocations: true,
          delete_allocations: false
        }
      },
      description: 'Team leadership with operational privileges'
    },
    {
      role_name: 'Manager',
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: true,
        settings: false,
        employees: true,
        audit: false,
        admin: false
      },
      privileges: {
        dashboard: {
          view_dashboard: true,
          view_analytics: true,
          export_dashboard_reports: true
        },
        user_management: {
          view_users: true,
          create_users: false,
          edit_users: false,
          delete_users: false,
          approve_users: false,
          manage_roles: false,
          grant_privileges: false,
          revoke_privileges: false
        },
        collections: {
          view_collections: true,
          create_ptp: true,
          edit_ptp: true,
          delete_ptp: false,
          approve_payments: true,
          upload_collection_data: false,
          export_collection_reports: true
        },
        accounts: {
          view_accounts: true,
          create_accounts: false,
          edit_accounts: true,
          delete_accounts: false,
          lock_unlock_accounts: false,
          view_account_history: true
        },
        customers: {
          view_customers: true,
          create_customers: false,
          edit_customers: true,
          delete_customers: false,
          export_customer_data: true
        },
        employees: {
          view_employees: true,
          create_employees: false,
          edit_employees: false,
          delete_employees: false,
          manage_allocations: true
        },
        settlements: {
          view_settlements: true,
          create_settlement_proposals: true,
          approve_settlements: true,
          cancel_settlements: false
        },
        reports: {
          view_reports: true,
          export_reports: true,
          schedule_reports: false
        },
        settings: {
          view_settings: false,
          edit_settings: false,
          configure_email: false,
          view_audit_logs: false,
          manage_status_codes: false
        },
        field_operations: {
          view_field_assignments: true,
          assign_field_tasks: true,
          approve_field_visits: true
        },
        documents: {
          view_documents: true,
          upload_documents: true,
          delete_documents: false,
          approve_documents: true
        },
        audit: {
          view_audit_logs: false,
          export_audit_logs: false,
          delete_audit_logs: false
        },
        allocations: {
          view_allocations: true,
          create_allocations: true,
          edit_allocations: true,
          delete_allocations: false
        }
      },
      description: 'Managerial access with approval privileges'
    },
    {
      role_name: 'Caller',
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: false,
        field_executive: false,
        documents: true,
        reports: false,
        settings: false,
        employees: false,
        audit: false,
        admin: false
      },
      privileges: {
        dashboard: {
          view_dashboard: true,
          view_analytics: false,
          export_dashboard_reports: false
        },
        user_management: {
          view_users: false,
          create_users: false,
          edit_users: false,
          delete_users: false,
          approve_users: false,
          manage_roles: false,
          grant_privileges: false,
          revoke_privileges: false
        },
        collections: {
          view_collections: true,
          create_ptp: true,
          edit_ptp: true,
          delete_ptp: false,
          approve_payments: false,
          upload_collection_data: false,
          export_collection_reports: false
        },
        accounts: {
          view_accounts: true,
          create_accounts: false,
          edit_accounts: true,
          delete_accounts: false,
          lock_unlock_accounts: false,
          view_account_history: true
        },
        customers: {
          view_customers: true,
          create_customers: false,
          edit_customers: false,
          delete_customers: false,
          export_customer_data: false
        },
        employees: {
          view_employees: false,
          create_employees: false,
          edit_employees: false,
          delete_employees: false,
          manage_allocations: false
        },
        settlements: {
          view_settlements: false,
          create_settlement_proposals: false,
          approve_settlements: false,
          cancel_settlements: false
        },
        reports: {
          view_reports: false,
          export_reports: false,
          schedule_reports: false
        },
        settings: {
          view_settings: false,
          edit_settings: false,
          configure_email: false,
          view_audit_logs: false,
          manage_status_codes: false
        },
        field_operations: {
          view_field_assignments: false,
          assign_field_tasks: false,
          approve_field_visits: false
        },
        documents: {
          view_documents: true,
          upload_documents: true,
          delete_documents: false,
          approve_documents: false
        },
        audit: {
          view_audit_logs: false,
          export_audit_logs: false,
          delete_audit_logs: false
        },
        allocations: {
          view_allocations: true,
          create_allocations: false,
          edit_allocations: false,
          delete_allocations: false
        }
      },
      description: 'Basic caller access for customer interactions'
    },
    {
      role_name: 'Field Executive',
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: false,
        settings: false,
        employees: false,
        audit: false,
        admin: false
      },
      privileges: {
        dashboard: {
          view_dashboard: true,
          view_analytics: false,
          export_dashboard_reports: false
        },
        user_management: {
          view_users: false,
          create_users: false,
          edit_users: false,
          delete_users: false,
          approve_users: false,
          manage_roles: false,
          grant_privileges: false,
          revoke_privileges: false
        },
        collections: {
          view_collections: true,
          create_ptp: true,
          edit_ptp: true,
          delete_ptp: false,
          approve_payments: false,
          upload_collection_data: false,
          export_collection_reports: false
        },
        accounts: {
          view_accounts: true,
          create_accounts: false,
          edit_accounts: true,
          delete_accounts: false,
          lock_unlock_accounts: false,
          view_account_history: true
        },
        customers: {
          view_customers: true,
          create_customers: false,
          edit_customers: true,
          delete_customers: false,
          export_customer_data: false
        },
        employees: {
          view_employees: false,
          create_employees: false,
          edit_employees: false,
          delete_employees: false,
          manage_allocations: false
        },
        settlements: {
          view_settlements: true,
          create_settlement_proposals: true,
          approve_settlements: false,
          cancel_settlements: false
        },
        reports: {
          view_reports: false,
          export_reports: false,
          schedule_reports: false
        },
        settings: {
          view_settings: false,
          edit_settings: false,
          configure_email: false,
          view_audit_logs: false,
          manage_status_codes: false
        },
        field_operations: {
          view_field_assignments: true,
          assign_field_tasks: false,
          approve_field_visits: false
        },
        documents: {
          view_documents: true,
          upload_documents: true,
          delete_documents: false,
          approve_documents: false
        },
        audit: {
          view_audit_logs: false,
          export_audit_logs: false,
          delete_audit_logs: false
        },
        allocations: {
          view_allocations: true,
          create_allocations: false,
          edit_allocations: false,
          delete_allocations: false
        }
      },
      description: 'Field executive access for on-site operations'
    }
  ];

  for (const roleData of defaultRoles) {
    await this.findOneAndUpdate(
      { role_name: roleData.role_name },
      roleData,
      { upsert: true, new: true }
    );
  }
  
  console.log('✅ Default role privileges initialized successfully');
};

const RolePrivilege = mongoose.model('RolePrivilege', rolePrivilegeSchema);

module.exports = RolePrivilege;
