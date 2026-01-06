import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Card,
  CardContent,
  Tooltip,
  TablePagination,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import AdminSettingsService from '../../services/AdminSettingsService';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-settings-tabpanel-${index}`}
      aria-labelledby={`admin-settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // User Role Waiver Limits State
  const [waiverLimits, setWaiverLimits] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [waiverFormData, setWaiverFormData] = useState({
    maxWaiverPercentage: '',
    maxWaiverAmount: '',
    approvalRequired: false
  });

  // Global Waiver Policy State
  const [globalPolicy, setGlobalPolicy] = useState({
    minWaiverPercentage: 5,
    maxWaiverPercentage: 80,
    colorThresholds: {
      green: { min: 0, max: 40 },
      amber: { min: 40, max: 60 },
      red: { min: 60, max: 100 }
    }
  });

  // Installment Defaults State
  const [installmentDefaults, setInstallmentDefaults] = useState({
    minInstallmentCount: 1,
    maxInstallmentCount: 10
  });

  // Letter Templates State
  const [letterTemplates, setLetterTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({
    templateName: '',
    templateType: 'Settlement',
    content: '',
    status: 'Active'
  });

  // Audit Trail State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilters, setAuditFilters] = useState({
    settingType: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [auditPagination, setAuditPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      switch (activeTab) {
        case 0: // User Role Waiver Limits
          const limits = await AdminSettingsService.getWaiverLimits();
          setWaiverLimits(limits);
          break;
        case 1: // Global Waiver Policy
          const policy = await AdminSettingsService.getGlobalPolicy();
          setGlobalPolicy(policy);
          break;
        case 2: // Installment Defaults
          const defaults = await AdminSettingsService.getInstallmentDefaults();
          setInstallmentDefaults(defaults);
          break;
        case 3: // Letter Templates
          const templates = await AdminSettingsService.getLetterTemplates();
          setLetterTemplates(templates);
          break;
        case 4: // Audit Trail
          await loadAuditTrail();
          break;
        default:
          break;
      }
    } catch (error) {
      showSnackbar(error.message || 'Error loading data', 'error');
    }
  };

  const loadAuditTrail = async () => {
    try {
      const response = await AdminSettingsService.getAuditTrail(auditFilters);
      setAuditLogs(response.auditLogs);
      setAuditPagination(response.pagination);
    } catch (error) {
      showSnackbar(error.message || 'Error loading audit trail', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // ===== User Role Waiver Limits Handlers =====
  const handleEditWaiver = (limit) => {
    setEditingRole(limit.role);
    setWaiverFormData({
      maxWaiverPercentage: limit.maxWaiverPercentage,
      maxWaiverAmount: limit.maxWaiverAmount,
      approvalRequired: limit.approvalRequired
    });
  };

  const handleSaveWaiver = async () => {
    try {
      await AdminSettingsService.updateWaiverLimit(editingRole, waiverFormData);
      showSnackbar('Waiver limit updated successfully');
      setEditingRole(null);
      loadData();
    } catch (error) {
      showSnackbar(error.message || 'Error updating waiver limit', 'error');
    }
  };

  // ===== Global Waiver Policy Handlers =====
  const handleSaveGlobalPolicy = async () => {
    try {
      // Validation
      if (globalPolicy.minWaiverPercentage >= globalPolicy.maxWaiverPercentage) {
        showSnackbar('Minimum percentage must be less than maximum', 'error');
        return;
      }

      const { green, amber, red } = globalPolicy.colorThresholds;
      if (green.max !== amber.min || amber.max !== red.min) {
        showSnackbar('Color threshold ranges must not overlap', 'error');
        return;
      }

      await AdminSettingsService.saveGlobalPolicy(globalPolicy);
      showSnackbar('Global waiver policy updated successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error updating global policy', 'error');
    }
  };

  // ===== Installment Defaults Handlers =====
  const handleSaveInstallmentDefaults = async () => {
    try {
      if (installmentDefaults.minInstallmentCount < 1) {
        showSnackbar('Minimum installment count must be at least 1', 'error');
        return;
      }

      if (installmentDefaults.maxInstallmentCount <= installmentDefaults.minInstallmentCount) {
        showSnackbar('Maximum must be greater than minimum', 'error');
        return;
      }

      await AdminSettingsService.saveInstallmentDefaults(installmentDefaults);
      showSnackbar('Installment defaults updated successfully');
    } catch (error) {
      showSnackbar(error.message || 'Error updating installment defaults', 'error');
    }
  };

  // ===== Letter Templates Handlers =====
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setTemplateFormData({
      templateName: '',
      templateType: 'Settlement',
      content: '',
      status: 'Active'
    });
    setTemplateDialog(true);
  };

  const handleEditTemplate = async (template) => {
    setSelectedTemplate(template);
    setTemplateFormData({
      templateName: template.templateName,
      templateType: template.templateType,
      content: template.content,
      status: template.status
    });
    setTemplateDialog(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (selectedTemplate) {
        await AdminSettingsService.updateLetterTemplate(selectedTemplate._id, templateFormData);
        showSnackbar('Template updated successfully');
      } else {
        await AdminSettingsService.createLetterTemplate(templateFormData);
        showSnackbar('Template created successfully');
      }
      setTemplateDialog(false);
      loadData();
    } catch (error) {
      showSnackbar(error.message || 'Error saving template', 'error');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await AdminSettingsService.deleteLetterTemplate(id);
        showSnackbar('Template deleted successfully');
        loadData();
      } catch (error) {
        showSnackbar(error.message || 'Error deleting template', 'error');
      }
    }
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setPreviewDialog(true);
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #5B9BD5 0%, #8BB7E0 100%)',
          color: 'white',
          borderRadius: '8px 8px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Settings (Admin)
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                minHeight: 60,
                color: '#546E7A'
              },
              '& .Mui-selected': {
                color: '#5B9BD5 !important',
                fontWeight: 600
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#5B9BD5',
                height: 3
              }
            }}
          >
            <Tab label="User Waiver Limits" />
            <Tab label="Global Waiver Policy" />
            <Tab label="Installment Defaults" />
            <Tab label="Letter Templates" />
            <Tab label="Audit Trail" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        
        {/* Tab 1: User Role Waiver Limits */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" sx={{ mb: 3, color: '#5B9BD5', fontWeight: 600 }}>
            User Role Waiver Limits
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Max Waiver %</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Max Waiver Amount (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Approval Required</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waiverLimits.map((limit) => (
                  <TableRow key={limit.role} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{limit.role}</TableCell>
                    <TableCell>
                      {editingRole === limit.role ? (
                        <TextField
                          size="small"
                          type="number"
                          value={waiverFormData.maxWaiverPercentage}
                          onChange={(e) => setWaiverFormData({ 
                            ...waiverFormData, 
                            maxWaiverPercentage: Number(e.target.value) 
                          })}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                          }}
                          sx={{ width: 120 }}
                        />
                      ) : (
                        `${limit.maxWaiverPercentage}%`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRole === limit.role ? (
                        <TextField
                          size="small"
                          type="number"
                          value={waiverFormData.maxWaiverAmount}
                          onChange={(e) => setWaiverFormData({ 
                            ...waiverFormData, 
                            maxWaiverAmount: Number(e.target.value) 
                          })}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>
                          }}
                          sx={{ width: 150 }}
                        />
                      ) : (
                        `₹${limit.maxWaiverAmount.toLocaleString('en-IN')}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRole === limit.role ? (
                        <Switch
                          checked={waiverFormData.approvalRequired}
                          onChange={(e) => setWaiverFormData({ 
                            ...waiverFormData, 
                            approvalRequired: e.target.checked 
                          })}
                        />
                      ) : (
                        <Chip 
                          label={limit.approvalRequired ? 'Yes' : 'No'} 
                          color={limit.approvalRequired ? 'warning' : 'success'}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRole === limit.role ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveWaiver}
                            sx={{ backgroundColor: '#70C1B3' }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setEditingRole(null)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <IconButton
                          color="primary"
                          onClick={() => handleEditWaiver(limit)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 2: Global Waiver Policy */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" sx={{ mb: 3, color: '#5B9BD5', fontWeight: 600 }}>
            Global Waiver Policy
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Waiver Percentage"
                type="number"
                value={globalPolicy.minWaiverPercentage}
                onChange={(e) => setGlobalPolicy({ 
                  ...globalPolicy, 
                  minWaiverPercentage: Number(e.target.value) 
                })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Waiver Percentage"
                type="number"
                value={globalPolicy.maxWaiverPercentage}
                onChange={(e) => setGlobalPolicy({ 
                  ...globalPolicy, 
                  maxWaiverPercentage: Number(e.target.value) 
                })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Color Thresholds
              </Typography>
            </Grid>

            {/* Green Threshold */}
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#C8E6C9', border: '2px solid #66BB6A' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Green (0-40%) - Low Waiver
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Min"
                      size="small"
                      type="number"
                      value={globalPolicy.colorThresholds.green.min}
                      onChange={(e) => setGlobalPolicy({
                        ...globalPolicy,
                        colorThresholds: {
                          ...globalPolicy.colorThresholds,
                          green: { ...globalPolicy.colorThresholds.green, min: Number(e.target.value) }
                        }
                      })}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                    <TextField
                      label="Max"
                      size="small"
                      type="number"
                      value={globalPolicy.colorThresholds.green.max}
                      onChange={(e) => setGlobalPolicy({
                        ...globalPolicy,
                        colorThresholds: {
                          ...globalPolicy.colorThresholds,
                          green: { ...globalPolicy.colorThresholds.green, max: Number(e.target.value) }
                        }
                      })}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Amber Threshold */}
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#FFF9C4', border: '2px solid #FDD835' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Yellow (40-60%) - Moderate Waiver
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Min"
                      size="small"
                      type="number"
                      value={globalPolicy.colorThresholds.amber.min}
                      onChange={(e) => setGlobalPolicy({
                        ...globalPolicy,
                        colorThresholds: {
                          ...globalPolicy.colorThresholds,
                          amber: { ...globalPolicy.colorThresholds.amber, min: Number(e.target.value) }
                        }
                      })}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                    <TextField
                      label="Max"
                      size="small"
                      type="number"
                      value={globalPolicy.colorThresholds.amber.max}
                      onChange={(e) => setGlobalPolicy({
                        ...globalPolicy,
                        colorThresholds: {
                          ...globalPolicy.colorThresholds,
                          amber: { ...globalPolicy.colorThresholds.amber, max: Number(e.target.value) }
                        }
                      })}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Red Threshold */}
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#FFCDD2', border: '2px solid #EF5350' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Red (&gt;60%) - High Waiver
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Min"
                      size="small"
                      type="number"
                      value={globalPolicy.colorThresholds.red.min}
                      onChange={(e) => setGlobalPolicy({
                        ...globalPolicy,
                        colorThresholds: {
                          ...globalPolicy.colorThresholds,
                          red: { ...globalPolicy.colorThresholds.red, min: Number(e.target.value) }
                        }
                      })}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                    <TextField
                      label="Max"
                      size="small"
                      type="number"
                      value={globalPolicy.colorThresholds.red.max}
                      onChange={(e) => setGlobalPolicy({
                        ...globalPolicy,
                        colorThresholds: {
                          ...globalPolicy.colorThresholds,
                          red: { ...globalPolicy.colorThresholds.red, max: Number(e.target.value) }
                        }
                      })}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSaveGlobalPolicy}
                sx={{ 
                  mt: 2,
                  backgroundColor: '#5B9BD5',
                  '&:hover': { backgroundColor: '#4A8BC4' }
                }}
              >
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Installment Defaults */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" sx={{ mb: 3, color: '#5B9BD5', fontWeight: 600 }}>
            Installment Defaults
          </Typography>
          <Grid container spacing={3} maxWidth="md">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Installments"
                type="number"
                value={installmentDefaults.minInstallmentCount}
                onChange={(e) => setInstallmentDefaults({ 
                  ...installmentDefaults, 
                  minInstallmentCount: Number(e.target.value) 
                })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Installments"
                type="number"
                value={installmentDefaults.maxInstallmentCount}
                onChange={(e) => setInstallmentDefaults({ 
                  ...installmentDefaults, 
                  maxInstallmentCount: Number(e.target.value) 
                })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSaveInstallmentDefaults}
                sx={{ 
                  backgroundColor: '#5B9BD5',
                  '&:hover': { backgroundColor: '#4A8BC4' }
                }}
              >
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Letter Templates Management */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" sx={{ mb: 3, color: '#5B9BD5', fontWeight: 600 }}>
            Letter Templates Management
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Template Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {letterTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No templates found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  letterTemplates.map((template) => (
                    <TableRow key={template._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{template.templateName}</TableCell>
                      <TableCell>{template.templateType}</TableCell>
                      <TableCell>
                        <Chip 
                          label={template.status} 
                          color={template.status === 'Active' ? 'success' : template.status === 'Draft' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PreviewIcon />}
                          onClick={() => handlePreviewTemplate(template)}
                          sx={{ 
                            mr: 1,
                            textTransform: 'none',
                            backgroundColor: '#2196F3',
                            '&:hover': { backgroundColor: '#1976D2' }
                          }}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditTemplate(template)}
                          sx={{ 
                            textTransform: 'none',
                            backgroundColor: '#2196F3',
                            '&:hover': { backgroundColor: '#1976D2' }
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleCreateTemplate}
            sx={{ 
              mt: 3,
              textTransform: 'none',
              backgroundColor: '#2196F3',
              '&:hover': { backgroundColor: '#1976D2' }
            }}
          >
            Upload Template
          </Button>
        </TabPanel>

        {/* Tab 5: Audit Trail */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" sx={{ mb: 3, color: '#5B9BD5', fontWeight: 600 }}>
            Settings Audit Trail
          </Typography>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Setting Type</InputLabel>
                <Select
                  value={auditFilters.settingType}
                  label="Setting Type"
                  onChange={(e) => setAuditFilters({ ...auditFilters, settingType: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="User Role Waiver Limits">User Role Waiver Limits</MenuItem>
                  <MenuItem value="Global Waiver Policy">Global Waiver Policy</MenuItem>
                  <MenuItem value="Installment Defaults">Installment Defaults</MenuItem>
                  <MenuItem value="Letter Templates">Letter Templates</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={auditFilters.startDate}
                onChange={(e) => setAuditFilters({ ...auditFilters, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={auditFilters.endDate}
                onChange={(e) => setAuditFilters({ ...auditFilters, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={loadAuditTrail}
                sx={{ height: '100%' }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log._id} hover>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {log.modifiedBy.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.modifiedBy.role}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.action} 
                        color={
                          log.action === 'Created' ? 'success' : 
                          log.action === 'Updated' ? 'info' : 
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={auditPagination.total}
            page={auditPagination.page - 1}
            onPageChange={(e, newPage) => {
              setAuditFilters({ ...auditFilters, page: newPage + 1 });
              loadAuditTrail();
            }}
            rowsPerPage={auditPagination.limit}
            onRowsPerPageChange={(e) => {
              setAuditFilters({ ...auditFilters, limit: parseInt(e.target.value), page: 1 });
              loadAuditTrail();
            }}
          />
        </TabPanel>
      </Paper>

      {/* Template Dialog */}
      <Dialog 
        open={templateDialog} 
        onClose={() => setTemplateDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #5B9BD5 0%, #8BB7E0 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            <Typography variant="h6">
              {selectedTemplate ? `Edit Template - v${selectedTemplate.version || 1}` : 'Create New Template'}
            </Typography>
          </Box>
          <IconButton onClick={() => setTemplateDialog(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {/* Template Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={templateFormData.templateName}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, templateName: e.target.value })}
                  required
                  placeholder="e.g., Settlement Letter"
                />
              </Grid>

              {/* Template Type */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth required>
                  <InputLabel>Template Type</InputLabel>
                  <Select
                    value={templateFormData.templateType}
                    label="Template Type"
                    onChange={(e) => setTemplateFormData({ ...templateFormData, templateType: e.target.value })}
                  >
                    <MenuItem value="Settlement">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="Settlement" size="small" color="primary" />
                      </Box>
                    </MenuItem>
                    <MenuItem value="Closure">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="Closure" size="small" color="success" />
                      </Box>
                    </MenuItem>
                    <MenuItem value="NOC">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="NOC" size="small" color="info" />
                      </Box>
                    </MenuItem>
                    <MenuItem value="NDC">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="NDC" size="small" color="warning" />
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={templateFormData.status}
                    label="Status"
                    onChange={(e) => setTemplateFormData({ ...templateFormData, status: e.target.value })}
                  >
                    <MenuItem value="Active">
                      <Chip label="Active" size="small" color="success" />
                    </MenuItem>
                    <MenuItem value="Inactive">
                      <Chip label="Inactive" size="small" color="default" />
                    </MenuItem>
                    <MenuItem value="Draft">
                      <Chip label="Draft" size="small" color="warning" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Template Content Editor */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Template Content
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={14}
                  value={templateFormData.content}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, content: e.target.value })}
                  placeholder="Enter your template content here. Use placeholders like {{CustomerName}}, {{AccountNo}}, {{Amount}}, etc."
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      lineHeight: 1.6
                    }
                  }}
                />
              </Grid>

              {/* Quick Placeholder Buttons */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Quick Insert Placeholders:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    { label: 'Customer Name', value: '{{CustomerName}}' },
                    { label: 'Account No', value: '{{AccountNo}}' },
                    { label: 'Amount', value: '{{Amount}}' },
                    { label: 'Date', value: '{{Date}}' },
                    { label: 'Company Name', value: '{{CompanyName}}' },
                    { label: 'Address', value: '{{Address}}' },
                    { label: 'Phone', value: '{{Phone}}' },
                    { label: 'Email', value: '{{Email}}' }
                  ].map((placeholder) => (
                    <Button
                      key={placeholder.value}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setTemplateFormData({
                          ...templateFormData,
                          content: templateFormData.content + ' ' + placeholder.value
                        });
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      {placeholder.label}
                    </Button>
                  ))}
                </Box>
              </Grid>

              {/* Info Alert */}
              <Grid item xs={12}>
                <Alert severity="info" icon={false}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    💡 Template Tips:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.85rem' }}>
                    <li>Use <code>{'{{PlaceholderName}}'}</code> format for dynamic content</li>
                    <li>Placeholders will be automatically replaced with actual values when generating documents</li>
                    <li>Version control is automatic - each save creates a new version</li>
                    <li>Only "Active" templates can be used for document generation</li>
                  </Box>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#F5F7FA' }}>
          <Button 
            onClick={() => setTemplateDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveTemplate}
            startIcon={<SaveIcon />}
            disabled={!templateFormData.templateName || !templateFormData.content}
            sx={{ 
              backgroundColor: '#5B9BD5',
              '&:hover': { backgroundColor: '#4A8BC4' }
            }}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog} 
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #70C1B3 0%, #8FD4C7 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PreviewIcon />
            <Box>
              <Typography variant="h6">
                Template Preview
              </Typography>
              {selectedTemplate && (
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {selectedTemplate.templateName} - {selectedTemplate.templateType} (v{selectedTemplate.version || 1})
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={() => setPreviewDialog(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedTemplate && (
            <Box>
              {/* Template Info */}
              <Box sx={{ p: 2, backgroundColor: '#F5F7FA', borderBottom: '1px solid #E0E0E0' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Template Type
                    </Typography>
                    <Box>
                      <Chip 
                        label={selectedTemplate.templateType} 
                        size="small" 
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box>
                      <Chip 
                        label={selectedTemplate.status} 
                        size="small" 
                        color={selectedTemplate.status === 'Active' ? 'success' : selectedTemplate.status === 'Draft' ? 'warning' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Version
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      v{selectedTemplate.version || 1}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Last Modified
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {selectedTemplate.updatedAt ? formatDate(selectedTemplate.updatedAt) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Template Content */}
              <Box sx={{ p: 3 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E0E0E0',
                    borderRadius: 2,
                    minHeight: 300
                  }}
                >
                  <Typography
                    component="pre"
                    sx={{
                      fontFamily: 'inherit',
                      fontSize: '0.95rem',
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      margin: 0,
                      color: '#2C3E50'
                    }}
                  >
                    {selectedTemplate.content}
                  </Typography>
                </Paper>

                {/* Placeholders Used */}
                {selectedTemplate.content && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Placeholders in this template:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(() => {
                        const placeholderRegex = /\{\{(\w+)\}\}/g;
                        const matches = [...selectedTemplate.content.matchAll(placeholderRegex)];
                        const uniquePlaceholders = [...new Set(matches.map(m => m[1]))];
                        
                        return uniquePlaceholders.length > 0 ? (
                          uniquePlaceholders.map((placeholder) => (
                            <Chip
                              key={placeholder}
                              label={`{{${placeholder}}}`}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No placeholders found
                          </Typography>
                        );
                      })()}
                    </Box>
                  </Box>
                )}

                {/* Sample Preview with Example Data */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Sample with example data:
                  </Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      backgroundColor: '#E8F5E9',
                      border: '1px solid #A5D6A7',
                      borderRadius: 2
                    }}
                  >
                    <Typography
                      component="pre"
                      sx={{
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        margin: 0,
                        color: '#1B5E20'
                      }}
                    >
                      {selectedTemplate.content
                        .replace(/\{\{CustomerName\}\}/g, 'John Doe')
                        .replace(/\{\{AccountNo\}\}/g, 'ACC123456789')
                        .replace(/\{\{Amount\}\}/g, '₹50,000')
                        .replace(/\{\{Date\}\}/g, new Date().toLocaleDateString('en-IN'))
                        .replace(/\{\{CompanyName\}\}/g, 'Academic ERP Ltd.')
                        .replace(/\{\{Address\}\}/g, '123 Main Street, City')
                        .replace(/\{\{Phone\}\}/g, '+91 9876543210')
                        .replace(/\{\{Email\}\}/g, 'customer@example.com')
                      }
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#F5F7FA' }}>
          <Button onClick={() => setPreviewDialog(false)} variant="outlined">
            Close
          </Button>
          {selectedTemplate && (
            <Button 
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setPreviewDialog(false);
                handleEditTemplate(selectedTemplate);
              }}
              sx={{ 
                backgroundColor: '#5B9BD5',
                '&:hover': { backgroundColor: '#4A8BC4' }
              }}
            >
              Edit Template
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminSettings;
