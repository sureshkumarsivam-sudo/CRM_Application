import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Save,
  Refresh,
  Edit,
  Delete,
  Add,
  ExpandMore,
  Warning,
  CheckCircle,
  Info,
} from '@mui/icons-material';

const AccountConfiguration = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [expandedPanel, setExpandedPanel] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    autoSave: true,
    emailNotifications: true,
    smsNotifications: false,
    defaultView: 'summary',
    recordsPerPage: 50,
    autoRefresh: true,
    refreshInterval: 300,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    auditLogging: true,
    dataEncryption: true,
  });

  const [workflowSettings, setWorkflowSettings] = useState({
    autoAssignment: true,
    escalationRules: true,
    approvalWorkflow: false,
    reminderNotifications: true,
  });

  const systemConfigurations = [
    {
      category: 'Data Management',
      items: [
        { name: 'Backup Frequency', value: 'Daily', editable: true, critical: false },
        { name: 'Data Retention Period', value: '7 Years', editable: true, critical: true },
        { name: 'Archive Threshold', value: '2 Years', editable: true, critical: false },
        { name: 'Sync Interval', value: '15 Minutes', editable: true, critical: false },
      ]
    },
    {
      category: 'Performance Settings',
      items: [
        { name: 'Query Timeout', value: '30 Seconds', editable: true, critical: false },
        { name: 'Cache Duration', value: '5 Minutes', editable: true, critical: false },
        { name: 'Max Concurrent Users', value: '500', editable: true, critical: true },
        { name: 'Memory Limit', value: '4 GB', editable: false, critical: true },
      ]
    },
    {
      category: 'Integration Settings',
      items: [
        { name: 'API Rate Limit', value: '1000/hour', editable: true, critical: false },
        { name: 'Webhook Timeout', value: '10 Seconds', editable: true, critical: false },
        { name: 'External Service Sync', value: 'Enabled', editable: true, critical: false },
        { name: 'Third-party Access', value: 'Restricted', editable: true, critical: true },
      ]
    }
  ];

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleEditConfig = (config) => {
    setSelectedConfig(config);
    setOpenDialog(true);
  };

  const handleSaveConfig = () => {
    // Save configuration logic
    setOpenDialog(false);
    setSelectedConfig(null);
  };

  const handleGeneralSettingChange = (setting, value) => {
    setGeneralSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Account Configuration
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            sx={{ borderRadius: 2 }}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            sx={{ borderRadius: 2 }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Configuration Sections */}
      <Box sx={{ mb: 3 }}>
        
        {/* General Settings */}
        <Accordion 
          expanded={expandedPanel === 'general'} 
          onChange={handlePanelChange('general')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">General Settings</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Display Preferences
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Default View</InputLabel>
                        <Select
                          value={generalSettings.defaultView}
                          onChange={(e) => handleGeneralSettingChange('defaultView', e.target.value)}
                          label="Default View"
                        >
                          <MenuItem value="summary">Summary View</MenuItem>
                          <MenuItem value="detailed">Detailed View</MenuItem>
                          <MenuItem value="grid">Grid View</MenuItem>
                          <MenuItem value="list">List View</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Records Per Page</InputLabel>
                        <Select
                          value={generalSettings.recordsPerPage}
                          onChange={(e) => handleGeneralSettingChange('recordsPerPage', e.target.value)}
                          label="Records Per Page"
                        >
                          <MenuItem value={25}>25</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                          <MenuItem value={200}>200</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">Auto Save</Typography>
                      <Switch
                        checked={generalSettings.autoSave}
                        onChange={(e) => handleGeneralSettingChange('autoSave', e.target.checked)}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Auto Refresh</Typography>
                      <Switch
                        checked={generalSettings.autoRefresh}
                        onChange={(e) => handleGeneralSettingChange('autoRefresh', e.target.checked)}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Notification Settings
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2">Email Notifications</Typography>
                      <Switch
                        checked={generalSettings.emailNotifications}
                        onChange={(e) => handleGeneralSettingChange('emailNotifications', e.target.checked)}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2">SMS Notifications</Typography>
                      <Switch
                        checked={generalSettings.smsNotifications}
                        onChange={(e) => handleGeneralSettingChange('smsNotifications', e.target.checked)}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      size="small"
                      label="Refresh Interval (seconds)"
                      type="number"
                      value={generalSettings.refreshInterval}
                      onChange={(e) => handleGeneralSettingChange('refreshInterval', parseInt(e.target.value))}
                      disabled={!generalSettings.autoRefresh}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Security Settings */}
        <Accordion 
          expanded={expandedPanel === 'security'} 
          onChange={handlePanelChange('security')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security sx={{ color: 'error.main' }} />
              <Typography variant="h6" fontWeight="bold">Security Settings</Typography>
              <Chip label="Critical" size="small" color="error" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Changes to security settings require administrator approval and system restart.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Authentication
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2">Two-Factor Authentication</Typography>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Session Timeout (minutes)"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      size="small"
                      label="Password Expiry (days)"
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Data Protection
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2">Audit Logging</Typography>
                      <Switch
                        checked={securitySettings.auditLogging}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, auditLogging: e.target.checked }))}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2">Data Encryption</Typography>
                      <Switch
                        checked={securitySettings.dataEncryption}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, dataEncryption: e.target.checked }))}
                        disabled
                      />
                    </Box>

                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="caption">
                        Data encryption is mandatory and cannot be disabled for compliance reasons.
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Workflow Settings */}
        <Accordion 
          expanded={expandedPanel === 'workflow'} 
          onChange={handlePanelChange('workflow')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Notifications sx={{ color: 'success.main' }} />
              <Typography variant="h6" fontWeight="bold">Workflow Settings</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Automation Rules
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">Auto Assignment</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Automatically assign new accounts to available agents
                            </Typography>
                          </Box>
                          <Switch
                            checked={workflowSettings.autoAssignment}
                            onChange={(e) => setWorkflowSettings(prev => ({ ...prev, autoAssignment: e.target.checked }))}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">Escalation Rules</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Enable automatic escalation for overdue tasks
                            </Typography>
                          </Box>
                          <Switch
                            checked={workflowSettings.escalationRules}
                            onChange={(e) => setWorkflowSettings(prev => ({ ...prev, escalationRules: e.target.checked }))}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">Approval Workflow</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Require approval for high-value transactions
                            </Typography>
                          </Box>
                          <Switch
                            checked={workflowSettings.approvalWorkflow}
                            onChange={(e) => setWorkflowSettings(prev => ({ ...prev, approvalWorkflow: e.target.checked }))}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">Reminder Notifications</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Send automated reminder notifications
                            </Typography>
                          </Box>
                          <Switch
                            checked={workflowSettings.reminderNotifications}
                            onChange={(e) => setWorkflowSettings(prev => ({ ...prev, reminderNotifications: e.target.checked }))}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* System Configuration */}
        <Accordion 
          expanded={expandedPanel === 'system'} 
          onChange={handlePanelChange('system')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings sx={{ color: 'warning.main' }} />
              <Typography variant="h6" fontWeight="bold">System Configuration</Typography>
              <Chip label="Advanced" size="small" color="warning" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {systemConfigurations.map((category, index) => (
              <Paper key={index} sx={{ mb: 3, p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {category.category}
                </Typography>
                <List dense>
                  {category.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {item.name}
                            </Typography>
                            {item.critical && (
                              <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            Current: {item.value}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        {item.editable ? (
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleEditConfig(item)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            System Managed
                          </Typography>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Edit Configuration Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Configuration</DialogTitle>
        <DialogContent>
          {selectedConfig && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Configuration Name"
                value={selectedConfig.name}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Current Value"
                value={selectedConfig.value}
                onChange={(e) => setSelectedConfig(prev => ({ ...prev, value: e.target.value }))}
              />
              {selectedConfig.critical && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This is a critical configuration. Changes may affect system performance.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveConfig} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountConfiguration;