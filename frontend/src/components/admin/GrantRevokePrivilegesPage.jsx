import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Switch,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Security as SecurityIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const GrantRevokePrivilegesPage = () => {
  // State management
  const [selectedRole, setSelectedRole] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [userPrivileges, setUserPrivileges] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: null,
    userName: '',
    privilegeKey: '',
    privilegeName: '',
    currentValue: false,
    newValue: false
  });
  
  // Save all changes confirmation
  const [saveAllDialog, setSaveAllDialog] = useState(false);
  const [changesSummary, setChangesSummary] = useState([]);
  
  // Available roles
  const roles = [
    'Super Admin',
    'Admin',
    'Team Lead',
    'Manager',
    'Caller',
    'Field Executive'
  ];
  
  // Privilege categories for better organization
  const privilegeCategories = {
    'Dashboard': ['view_dashboard', 'view_analytics', 'export_dashboard_reports'],
    'User Management': ['view_users', 'create_users', 'edit_users', 'delete_users', 'approve_users', 'manage_roles', 'grant_privileges', 'revoke_privileges'],
    'Collections': ['view_collections', 'create_ptp', 'edit_ptp', 'delete_ptp', 'approve_payments', 'upload_collection_data', 'export_collection_reports'],
    'Accounts': ['view_accounts', 'create_accounts', 'edit_accounts', 'delete_accounts', 'lock_unlock_accounts', 'view_account_history'],
    'Customers': ['view_customers', 'create_customers', 'edit_customers', 'delete_customers', 'export_customer_data'],
    'Employees': ['view_employees', 'create_employees', 'edit_employees', 'delete_employees', 'manage_allocations'],
    'Settlements': ['view_settlements', 'create_settlement_proposals', 'approve_settlements', 'cancel_settlements'],
    'Reports': ['view_reports', 'export_reports', 'schedule_reports'],
    'Settings': ['view_settings', 'edit_settings', 'configure_email', 'view_audit_logs', 'manage_status_codes'],
    'Field Operations': ['view_field_assignments', 'assign_field_tasks', 'approve_field_visits']
  };
  
  // Format privilege key to readable name
  const formatPrivilegeName = (key) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Fetch users by role
  const fetchUsersByRole = async (role) => {
    if (!role) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/users?role=${role}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
      
      // Initialize user privileges state
      const privilegesMap = {};
      data.users.forEach(user => {
        privilegesMap[user._id] = user.customPrivileges || {};
      });
      setUserPrivileges(privilegesMap);
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all privileges
  const fetchPrivileges = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/roles/privileges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch privileges');
      }
      
      setPrivileges(data.privileges || []);
    } catch (err) {
      console.error('Error fetching privileges:', err);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchPrivileges();
  }, []);
  
  // Load users when role changes
  useEffect(() => {
    if (selectedRole) {
      fetchUsersByRole(selectedRole);
    } else {
      setUsers([]);
      setFilteredUsers([]);
    }
  }, [selectedRole]);
  
  // Filter users by search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.employeeId.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);
  
  // Handle privilege toggle
  const handlePrivilegeToggle = (userId, privilegeKey, currentValue) => {
    const user = users.find(u => u._id === userId);
    
    // Prevent admin from revoking their own critical permissions
    const currentUserId = JSON.parse(localStorage.getItem('userData'))._id;
    const criticalPrivileges = ['grant_privileges', 'revoke_privileges', 'manage_roles'];
    
    if (userId === currentUserId && criticalPrivileges.includes(privilegeKey) && currentValue) {
      setError('You cannot revoke your own critical permissions!');
      return;
    }
    
    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      userId,
      userName: user.fullName,
      privilegeKey,
      privilegeName: formatPrivilegeName(privilegeKey),
      currentValue,
      newValue: !currentValue
    });
  };
  
  // Confirm privilege change
  const confirmPrivilegeChange = () => {
    const { userId, privilegeKey, newValue } = confirmDialog;
    
    setUserPrivileges(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [privilegeKey]: newValue
      }
    }));
    
    // Track changes
    trackChange(userId, privilegeKey, !newValue, newValue);
    
    setConfirmDialog({ ...confirmDialog, open: false });
    setSuccess(`Privilege ${newValue ? 'granted' : 'revoked'} successfully (unsaved)`);
  };
  
  // Track changes for summary
  const trackChange = (userId, privilegeKey, oldValue, newValue) => {
    const user = users.find(u => u._id === userId);
    const change = {
      userId,
      userName: user.fullName,
      privilegeKey,
      privilegeName: formatPrivilegeName(privilegeKey),
      oldValue,
      newValue
    };
    
    setChangesSummary(prev => {
      // Remove any existing change for this user/privilege combination
      const filtered = prev.filter(c => !(c.userId === userId && c.privilegeKey === privilegeKey));
      return [...filtered, change];
    });
  };
  
  // Save all changes
  const handleSaveAll = () => {
    if (changesSummary.length === 0) {
      setError('No changes to save');
      return;
    }
    setSaveAllDialog(true);
  };
  
  // Confirm save all
  const confirmSaveAll = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/users/privileges/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          changes: changesSummary.map(change => ({
            userId: change.userId,
            privilegeKey: change.privilegeKey,
            value: change.newValue
          }))
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save changes');
      }
      
      setSuccess(`Successfully updated privileges for ${changesSummary.length} changes`);
      setChangesSummary([]);
      setSaveAllDialog(false);
      
      // Refresh user data
      await fetchUsersByRole(selectedRole);
      
    } catch (err) {
      console.error('Error saving changes:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  // Check if user has privilege
  const hasPrivilege = (userId, privilegeKey) => {
    return userPrivileges[userId]?.[privilegeKey] || false;
  };
  
  // Get privilege count for user
  const getPrivilegeCount = (userId) => {
    const userPrivs = userPrivileges[userId] || {};
    return Object.values(userPrivs).filter(v => v === true).length;
  };
  
  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: '#4A90E2',
        background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
        p: 3,
        mb: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <SecurityIcon sx={{ fontSize: 40, color: 'white' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
              Grant / Revoke Privileges
            </Typography>
            <Typography variant="body2" sx={{ color: '#E3F2FD' }}>
              Role-Based Access Control Management
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Paper sx={{ p: 3, m: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        {/* Filters and Search */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Select Role"
              >
                <MenuItem value="">
                  <em>Select a role</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6B7280' }} />
                  </InputAdornment>
                )
              }}
              disabled={!selectedRole}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              disabled={changesSummary.length === 0 || saving}
              sx={{
                height: '56px',
                background: changesSummary.length > 0
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: changesSummary.length > 0
                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    : 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)'
                }
              }}
            >
              Save All ({changesSummary.length})
            </Button>
          </Grid>
        </Grid>
        
        {/* Summary Cards */}
        {selectedRole && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #E8F1FD 0%, #F5F9FF 100%)',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <CardContent>
                  <Typography variant="h4" sx={{ color: '#2563EB', fontWeight: 700 }}>
                    {filteredUsers.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 600 }}>
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #F1EEFF 0%, #FAF9FF 100%)',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <CardContent>
                  <Typography variant="h4" sx={{ color: '#2563EB', fontWeight: 700 }}>
                    {Object.keys(privilegeCategories).reduce((sum, cat) => sum + privilegeCategories[cat].length, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 600 }}>
                    Total Privileges
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #FFF4E6 0%, #FFF9F0 100%)',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <CardContent>
                  <Typography variant="h4" sx={{ color: '#2563EB', fontWeight: 700 }}>
                    {changesSummary.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 600 }}>
                    Pending Changes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* No Role Selected */}
        {!selectedRole && !loading && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <SecurityIcon sx={{ fontSize: 80, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              Select a Role to Begin
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Choose a role from the dropdown above to view and manage user privileges
            </Typography>
          </Box>
        )}
        
        {/* Users and Privileges Table */}
        {selectedRole && !loading && filteredUsers.length > 0 && (
          <TableContainer sx={{ 
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            maxHeight: 600
          }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    backgroundColor: '#F9FAFB',
                    fontWeight: 700,
                    color: '#1F2937',
                    borderBottom: '2px solid #E5E7EB',
                    minWidth: 200
                  }}>
                    User Details
                  </TableCell>
                  {Object.keys(privilegeCategories).map((category) => (
                    <TableCell 
                      key={category}
                      align="center"
                      sx={{ 
                        backgroundColor: '#F9FAFB',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderBottom: '2px solid #E5E7EB',
                        minWidth: 120
                      }}
                    >
                      <Tooltip title={privilegeCategories[category].map(formatPrivilegeName).join(', ')}>
                        <Box>
                          {category}
                          <Typography variant="caption" display="block" sx={{ color: '#6B7280' }}>
                            ({privilegeCategories[category].length})
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                          {user.fullName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {user.email}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ color: '#9CA3AF' }}>
                          ID: {user.employeeId}
                        </Typography>
                        <Chip 
                          label={`${getPrivilegeCount(user._id)} privileges`}
                          size="small"
                          sx={{ 
                            mt: 0.5,
                            backgroundColor: '#E8F1FD',
                            color: '#2563EB',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </TableCell>
                    {Object.keys(privilegeCategories).map((category) => (
                      <TableCell key={category} align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                          {privilegeCategories[category].map((privilegeKey) => (
                            <Tooltip key={privilegeKey} title={formatPrivilegeName(privilegeKey)}>
                              <Switch
                                checked={hasPrivilege(user._id, privilegeKey)}
                                onChange={() => handlePrivilegeToggle(user._id, privilegeKey, hasPrivilege(user._id, privilegeKey))}
                                size="small"
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#10B981'
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#10B981'
                                  }
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* No Users Found */}
        {selectedRole && !loading && filteredUsers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <InfoIcon sx={{ fontSize: 80, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              No Users Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              No users with role "{selectedRole}" found in the system
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: '#F59E0B' }} />
          Confirm Privilege Change
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to {confirmDialog.newValue ? 'grant' : 'revoke'} the following privilege?
          </Typography>
          <Box sx={{ 
            p: 2,
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid #E5E7EB'
          }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>User:</strong> {confirmDialog.userName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Privilege:</strong> {confirmDialog.privilegeName}
            </Typography>
            <Typography variant="body2">
              <strong>Action:</strong>{' '}
              <Chip 
                label={confirmDialog.newValue ? 'GRANT' : 'REVOKE'}
                size="small"
                color={confirmDialog.newValue ? 'success' : 'error'}
              />
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            sx={{ color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmPrivilegeChange}
            variant="contained"
            color={confirmDialog.newValue ? 'success' : 'error'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Save All Dialog */}
      <Dialog
        open={saveAllDialog}
        onClose={() => setSaveAllDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SaveIcon sx={{ color: '#2563EB' }} />
          Confirm Save All Changes
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to save {changesSummary.length} privilege changes. Please review:
          </Typography>
          <TableContainer sx={{ 
            maxHeight: 400,
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#F9FAFB' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#F9FAFB' }}>Privilege</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#F9FAFB' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changesSummary.map((change, index) => (
                  <TableRow key={index}>
                    <TableCell>{change.userName}</TableCell>
                    <TableCell>{change.privilegeName}</TableCell>
                    <TableCell>
                      <Chip
                        label={change.newValue ? 'GRANT' : 'REVOKE'}
                        size="small"
                        color={change.newValue ? 'success' : 'error'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSaveAllDialog(false)}
            disabled={saving}
            sx={{ color: '#6B7280' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmSaveAll}
            variant="contained"
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }
            }}
          >
            {saving ? <CircularProgress size={24} /> : 'Save All Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GrantRevokePrivilegesPage;
