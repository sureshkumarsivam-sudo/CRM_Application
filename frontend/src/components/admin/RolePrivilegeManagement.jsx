import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Chip,
  Stack
} from '@mui/material';
import {
  Security as SecurityIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const RolePrivilegeManagement = () => {
  // State management
  const [selectedRole, setSelectedRole] = useState('');
  const [rolePrivileges, setRolePrivileges] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Available roles
  const roles = [
    'Super Admin',
    'Admin',
    'Team Lead',
    'Manager',
    'Caller',
    'Field Executive'
  ];

  // Define all available menus and their privileges
  const menuStructure = {
    'Dashboard': {
      menuKey: 'dashboard',
      icon: '📊',
      description: 'View and analyze dashboard metrics',
      privileges: [
        { key: 'view_dashboard', label: 'View Dashboard', description: 'Access to main dashboard' },
        { key: 'view_analytics', label: 'View Analytics', description: 'Access to analytics section' },
        { key: 'export_dashboard_reports', label: 'Export Reports', description: 'Download dashboard reports' }
      ]
    },
    'Accounts': {
      menuKey: 'accounts',
      icon: '💼',
      description: 'Manage customer accounts',
      privileges: [
        { key: 'view_accounts', label: 'View Accounts', description: 'View account list and details' },
        { key: 'create_accounts', label: 'Create Accounts', description: 'Add new accounts' },
        { key: 'edit_accounts', label: 'Edit Accounts', description: 'Modify existing accounts' },
        { key: 'delete_accounts', label: 'Delete Accounts', description: 'Remove accounts' },
        { key: 'lock_unlock_accounts', label: 'Lock/Unlock Accounts', description: 'Lock or unlock accounts' },
        { key: 'view_account_history', label: 'View History', description: 'View account audit trail' }
      ]
    },
    'Allocations': {
      menuKey: 'allocations',
      icon: '📋',
      description: 'Manage account allocations',
      privileges: [
        { key: 'view_allocations', label: 'View Allocations', description: 'View allocation list' },
        { key: 'create_allocations', label: 'Create Allocations', description: 'Assign accounts to users' },
        { key: 'edit_allocations', label: 'Edit Allocations', description: 'Modify allocations' },
        { key: 'delete_allocations', label: 'Delete Allocations', description: 'Remove allocations' },
        { key: 'manage_allocations', label: 'Manage Allocations', description: 'Full allocation management' }
      ]
    },
    'Collections': {
      menuKey: 'collections',
      icon: '💰',
      description: 'Manage payment collections',
      privileges: [
        { key: 'view_collections', label: 'View Collections', description: 'View collection records' },
        { key: 'create_ptp', label: 'Create PTP', description: 'Create promise to pay' },
        { key: 'edit_ptp', label: 'Edit PTP', description: 'Modify PTP records' },
        { key: 'delete_ptp', label: 'Delete PTP', description: 'Remove PTP records' },
        { key: 'approve_payments', label: 'Approve Payments', description: 'Approve payment transactions' },
        { key: 'upload_collection_data', label: 'Upload Data', description: 'Import collection data' },
        { key: 'export_collection_reports', label: 'Export Reports', description: 'Download collection reports' }
      ]
    },
    'Settlements': {
      menuKey: 'settlements',
      icon: '🤝',
      description: 'Manage settlement agreements',
      privileges: [
        { key: 'view_settlements', label: 'View Settlements', description: 'View settlement records' },
        { key: 'create_settlement_proposals', label: 'Create Proposals', description: 'Create settlement proposals' },
        { key: 'approve_settlements', label: 'Approve Settlements', description: 'Approve settlement agreements' },
        { key: 'cancel_settlements', label: 'Cancel Settlements', description: 'Cancel settlements' }
      ]
    },
    'Field Executive': {
      menuKey: 'field_executive',
      icon: '🚗',
      description: 'Manage field operations',
      privileges: [
        { key: 'view_field_assignments', label: 'View Assignments', description: 'View field assignments' },
        { key: 'assign_field_tasks', label: 'Assign Tasks', description: 'Assign field tasks' },
        { key: 'approve_field_visits', label: 'Approve Visits', description: 'Approve field visit reports' }
      ]
    },
    'Documents': {
      menuKey: 'documents',
      icon: '📄',
      description: 'Manage documents',
      privileges: [
        { key: 'view_documents', label: 'View Documents', description: 'View document library' },
        { key: 'upload_documents', label: 'Upload Documents', description: 'Upload new documents' },
        { key: 'delete_documents', label: 'Delete Documents', description: 'Remove documents' }
      ]
    },
    'Reports': {
      menuKey: 'reports',
      icon: '📈',
      description: 'Access and generate reports',
      privileges: [
        { key: 'view_reports', label: 'View Reports', description: 'Access report section' },
        { key: 'export_reports', label: 'Export Reports', description: 'Download reports' },
        { key: 'schedule_reports', label: 'Schedule Reports', description: 'Set up automated reports' }
      ]
    },
    'Settings': {
      menuKey: 'settings',
      icon: '⚙️',
      description: 'Configure system settings',
      privileges: [
        { key: 'view_settings', label: 'View Settings', description: 'Access settings page' },
        { key: 'edit_settings', label: 'Edit Settings', description: 'Modify system settings' },
        { key: 'configure_email', label: 'Configure Email', description: 'Set up email configuration' }
      ]
    },
    'Employees': {
      menuKey: 'employees',
      icon: '👥',
      description: 'Manage employee records',
      privileges: [
        { key: 'view_employees', label: 'View Employees', description: 'View employee list' },
        { key: 'create_employees', label: 'Create Employees', description: 'Add new employees' },
        { key: 'edit_employees', label: 'Edit Employees', description: 'Modify employee data' },
        { key: 'delete_employees', label: 'Delete Employees', description: 'Remove employees' }
      ]
    },
    'Audit': {
      menuKey: 'audit',
      icon: '🔍',
      description: 'View system audit logs',
      privileges: [
        { key: 'view_audit_logs', label: 'View Audit Logs', description: 'Access audit trail' }
      ]
    },
    'Admin': {
      menuKey: 'admin',
      icon: '🔐',
      description: 'Administrative functions',
      privileges: [
        { key: 'manage_status_codes', label: 'Manage Status Codes', description: 'Configure status codes' },
        { key: 'manage_process', label: 'Manage Process', description: 'Configure business processes' },
        { key: 'grant_privileges', label: 'Grant Privileges', description: 'Assign privileges to users/roles' },
        { key: 'revoke_privileges', label: 'Revoke Privileges', description: 'Remove privileges' },
        { key: 'manage_roles', label: 'Manage Roles', description: 'Configure user roles' }
      ]
    }
  };

  // Fetch role privileges
  const fetchRolePrivileges = async (role) => {
    if (!role) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/roles/privileges/${role}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // If role doesn't exist, initialize with empty privileges
        if (response.status === 404) {
          setRolePrivileges({
            menu_access: {},
            privileges: {}
          });
        } else {
          throw new Error(data.message || 'Failed to fetch privileges');
        }
      } else {
        setRolePrivileges(data.privileges);
      }
      
      setHasChanges(false);
    } catch (err) {
      console.error('Error fetching role privileges:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    if (role) {
      fetchRolePrivileges(role);
    }
  };

  // Handle menu access toggle
  const handleMenuAccessToggle = (menuKey) => {
    setRolePrivileges(prev => ({
      ...prev,
      menu_access: {
        ...prev.menu_access,
        [menuKey]: !prev.menu_access[menuKey]
      }
    }));
    setHasChanges(true);
  };

  // Handle privilege toggle
  const handlePrivilegeToggle = (privilegeKey) => {
    setRolePrivileges(prev => {
      const currentPrivileges = { ...prev.privileges };
      
      // Find which category this privilege belongs to
      for (const menuName in menuStructure) {
        const menu = menuStructure[menuName];
        const privilegeExists = menu.privileges.some(p => p.key === privilegeKey);
        
        if (privilegeExists) {
          if (!currentPrivileges[menuName]) {
            currentPrivileges[menuName] = {};
          }
          currentPrivileges[menuName][privilegeKey] = !currentPrivileges[menuName][privilegeKey];
          break;
        }
      }
      
      return {
        ...prev,
        privileges: currentPrivileges
      };
    });
    setHasChanges(true);
  };

  // Check if privilege is checked
  const isPrivilegeChecked = (menuName, privilegeKey) => {
    return rolePrivileges?.privileges?.[menuName]?.[privilegeKey] === true;
  };

  // Save privileges
  const handleSave = async () => {
    if (!selectedRole || !rolePrivileges) {
      setError('Please select a role and configure privileges');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5000/api/roles/privileges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          role_name: selectedRole,
          menu_access: rolePrivileges.menu_access,
          privileges: rolePrivileges.privileges,
          description: `Privileges for ${selectedRole} role`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save privileges');
      }

      setSuccess(`Privileges for ${selectedRole} saved successfully!`);
      setHasChanges(false);
      
      // Refresh privileges
      await fetchRolePrivileges(selectedRole);
    } catch (err) {
      console.error('Error saving privileges:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Select/Deselect all privileges in a menu
  const handleSelectAllInMenu = (menuName, selectAll) => {
    const menu = menuStructure[menuName];
    
    setRolePrivileges(prev => {
      const updatedPrivileges = { ...prev.privileges };
      
      if (!updatedPrivileges[menuName]) {
        updatedPrivileges[menuName] = {};
      }
      
      menu.privileges.forEach(privilege => {
        updatedPrivileges[menuName][privilege.key] = selectAll;
      });
      
      return {
        ...prev,
        privileges: updatedPrivileges
      };
    });
    setHasChanges(true);
  };

  // Count selected privileges in a menu
  const countSelectedPrivileges = (menuName) => {
    const menu = menuStructure[menuName];
    let count = 0;
    
    menu.privileges.forEach(privilege => {
      if (isPrivilegeChecked(menuName, privilege.key)) {
        count++;
      }
    });
    
    return count;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SecurityIcon sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Role Privilege Management
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Configure menu access and privileges for different user roles
        </Typography>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Role Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  label="Select Role"
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={!selectedRole || !hasChanges || saving}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                    }
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchRolePrivileges(selectedRole)}
                  disabled={!selectedRole || loading}
                >
                  Refresh
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Privileges Configuration */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : selectedRole && rolePrivileges ? (
        <Box>
          {Object.entries(menuStructure).map(([menuName, menu]) => {
            const isMenuAccessEnabled = rolePrivileges.menu_access?.[menu.menuKey] === true;
            const selectedCount = countSelectedPrivileges(menuName);
            const totalCount = menu.privileges.length;
            const allSelected = selectedCount === totalCount;
            const someSelected = selectedCount > 0 && selectedCount < totalCount;

            return (
              <Accordion
                key={menuName}
                defaultExpanded={isMenuAccessEnabled}
                sx={{
                  mb: 2,
                  '&:before': { display: 'none' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: '8px !important'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: isMenuAccessEnabled ? 'rgba(102, 126, 234, 0.05)' : 'white',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.08)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                    <Typography sx={{ fontSize: 28, mr: 2 }}>{menu.icon}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {menuName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {menu.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${selectedCount}/${totalCount}`}
                      size="small"
                      color={isMenuAccessEnabled ? 'primary' : 'default'}
                      sx={{ mr: 2 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isMenuAccessEnabled}
                          onChange={() => handleMenuAccessToggle(menu.menuKey)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label="Menu Access"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 2, pb: 3 }}>
                  <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSelectAllInMenu(menuName, true)}
                      disabled={!isMenuAccessEnabled}
                    >
                      Select All
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSelectAllInMenu(menuName, false)}
                      disabled={!isMenuAccessEnabled}
                    >
                      Deselect All
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {menu.privileges.map((privilege) => (
                      <Grid item xs={12} sm={6} md={4} key={privilege.key}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            height: '100%',
                            opacity: !isMenuAccessEnabled ? 0.5 : 1,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: isMenuAccessEnabled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isPrivilegeChecked(menuName, privilege.key)}
                                onChange={() => handlePrivilegeToggle(privilege.key)}
                                disabled={!isMenuAccessEnabled}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {privilege.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {privilege.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      ) : (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Select a role to configure privileges
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default RolePrivilegeManagement;
