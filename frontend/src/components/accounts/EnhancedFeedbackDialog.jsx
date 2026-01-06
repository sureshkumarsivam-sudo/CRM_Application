import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Box,
  Alert,
  Chip,
  Paper,
  Divider,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import MasterStatusCodeService from '../../services/MasterStatusCodeService';

const API_BASE_URL = 'http://localhost:5000/api';

const EnhancedFeedbackDialog = ({ open, onClose, account, userRole = 'TELECALLER', onSuccess }) => {
  // State management
  const [statusCodes, setStatusCodes] = useState([]);
  const [selectedStatusCode, setSelectedStatusCode] = useState(null);
  const [statusCodeDetails, setStatusCodeDetails] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [promiseAmount, setPromiseAmount] = useState('');
  const [gpsLocation, setGpsLocation] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load status codes based on user role
  useEffect(() => {
    if (open) {
      loadStatusCodes();
      if (userRole === 'FE' || userRole === 'FIELD_EXECUTIVE') {
        captureGPSLocation();
      }
    }
  }, [open, userRole]);

  // Load status codes from API using MasterStatusCodeService
  const loadStatusCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only active status codes from Status_Code collection, sorted alphabetically
      const response = await MasterStatusCodeService.getStatusCodes({
        isActive: true,
        sortBy: 'code',
        sortOrder: 'asc',
        limit: 1000 // Get all active codes
      });
      
      // Validate response
      if (!response || !response.success || !Array.isArray(response.data)) {
        throw new Error('Invalid response from server');
      }
      
      // Map the data from MongoDB Status_Code collection
      const statusCodesData = response.data.map(status => ({
        code: status.code, // MongoDB field: code
        statusName: status.description, // MongoDB field: description
        description: status.description,
        category: status.category, // MongoDB field: category (Positive/Neutral/Negative)
        nextActionTrigger: status.nextActionTrigger,
        responsible: status.responsible,
        responsibleTeam: status.responsible,
        autoEscalation: status.autoEscalationLogic,
        autoEscalationLogic: status.autoEscalationLogic,
        remarksRequired: true,
        automation: {
          createFollowUpTask: status.nextActionTrigger?.toLowerCase().includes('follow') || false,
          sendEmail: false,
          sendSMS: false,
          escalate: status.autoEscalationLogic ? true : false
        },
        addressStatus: null,
        _id: status._id
      }));
      
      setStatusCodes(statusCodesData);
      
    } catch (err) {
      console.error('Error loading status codes:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load status codes';
      setError(`Failed to load status codes: ${errorMsg}`);
      setStatusCodes([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle status code selection
  const handleStatusCodeChange = async (code) => {
    setSelectedStatusCode(code);
    
    // Find full details of selected status code
    const statusDetails = statusCodes.find(s => s.code === code);
    setStatusCodeDetails(statusDetails);

    // Auto-clear/set fields based on status requirements
    if (statusDetails) {
      // Clear remarks if not required
      if (!statusDetails.remarksRequired) {
        // Don't clear, but show it's optional
      }
      
      // Auto-enable follow-up fields for certain statuses
      if (statusDetails.automation.createFollowUpTask) {
        // Set default follow-up date (2 days from now)
        const followUpDefault = new Date();
        followUpDefault.setDate(followUpDefault.getDate() + 2);
        setFollowUpDate(followUpDefault.toISOString().split('T')[0]);
      }
    }
  };

  // Capture GPS location for Field Executives
  const captureGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.warn('GPS capture failed:', error);
        }
      );
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const categoryUpper = category?.toUpperCase() || '';
    const colors = {
      POSITIVE: '#4CAF50',
      NEUTRAL: '#2196F3',
      NEGATIVE: '#F44336',
      CONTACT_ESTABLISHED: '#4CAF50',
      NON_CONTACT: '#FF9800',
      REFUSAL: '#F44336',
      ADMINISTRATIVE: '#9C27B0'
    };
    return colors[categoryUpper] || '#757575';
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryUpper = category?.toUpperCase() || '';
    if (['POSITIVE', 'CONTACT_ESTABLISHED'].includes(categoryUpper)) {
      return <CheckCircleIcon sx={{ color: getCategoryColor(category) }} />;
    }
    if (['NEGATIVE', 'REFUSAL'].includes(categoryUpper)) {
      return <ErrorIcon sx={{ color: getCategoryColor(category) }} />;
    }
    if (['NON_CONTACT'].includes(categoryUpper)) {
      return <WarningIcon sx={{ color: getCategoryColor(category) }} />;
    }
    return <InfoIcon sx={{ color: getCategoryColor(category) }} />;
  };

  // Validate form
  const validateForm = () => {
    if (!selectedStatusCode) {
      setError('Please select a status code');
      return false;
    }

    if (statusCodeDetails?.remarksRequired && !remarks.trim()) {
      setError('Remarks are required for this status');
      return false;
    }

    if (statusCodeDetails?.automation.createFollowUpTask && !followUpDate) {
      setError('Follow-up date is required for this status');
      return false;
    }

    if (['PTP', 'FE_PTP'].includes(selectedStatusCode) && !promiseAmount) {
      setError('Promise amount is required for PTP status');
      return false;
    }

    return true;
  };

  // Submit feedback
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const feedbackData = {
        customerId: account._id,
        loanId: account.loanId || account.accountNumber,
        customerName: account.customerName || account.name,
        statusCode: selectedStatusCode,
        statusName: statusCodeDetails.statusName,
        category: statusCodeDetails.category,
        remarks: remarks.trim(),
        followUpDate: followUpDate || null,
        followUpTime: followUpTime || null,
        promiseAmount: promiseAmount ? parseFloat(promiseAmount) : null,
        gpsLocation: gpsLocation,
        attachments: attachments,
        userRole: userRole,
        createdBy: 'Current User', // Replace with actual user
        
        // Automation flags from status code matrix
        automation: statusCodeDetails.automation,
        nextActionTrigger: statusCodeDetails.nextActionTrigger,
        responsibleTeam: statusCodeDetails.responsibleTeam,
        autoEscalation: statusCodeDetails.autoEscalation,
        addressStatus: statusCodeDetails.addressStatus
      };

      // Call API to save feedback and trigger automation
      const response = await axios.post(`${API_BASE_URL}/feedback`, feedbackData);

      // Show success message
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset form
      handleClose();
    } catch (err) {
      console.error('Error saving feedback:', err);
      setError(err.response?.data?.message || 'Failed to save feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!submitting) {
      setSelectedStatusCode(null);
      setStatusCodeDetails(null);
      setRemarks('');
      setFollowUpDate('');
      setFollowUpTime('');
      setPromiseAmount('');
      setGpsLocation(null);
      setAttachments([]);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '15px',
          border: '2px solid #1E40AF'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" component="div">
          {userRole === 'FE' || userRole === 'FIELD_EXECUTIVE' ? 'Field Executive Feedback' : 'Telecaller Feedback'}
        </Typography>
        <IconButton
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {/* Account Information */}
        {account && (
          <Paper sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Account Number</Typography>
                <Typography variant="body1" fontWeight="bold">{account.loanId || account.accountNumber || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                <Typography variant="body1" fontWeight="bold">{account.customerName || account.name || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Outstanding</Typography>
                <Typography variant="body1" fontWeight="bold" color="error">
                  ₹{(account.totalOutstanding || account.currentOutstanding || 0).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Status Code Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth required error={!selectedStatusCode && error}>
              <InputLabel>Select Status Code *</InputLabel>
              <Select
                value={selectedStatusCode || ''}
                onChange={(e) => handleStatusCodeChange(e.target.value)}
                label="Select Status Code *"
                disabled={submitting || loading}
              >
                {loading && (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading status codes...
                  </MenuItem>
                )}
                {!loading && statusCodes.length === 0 && (
                  <MenuItem disabled>
                    <Typography color="error">No status codes available</Typography>
                  </MenuItem>
                )}
                {statusCodes.map((status) => (
                  <MenuItem 
                    key={status.code} 
                    value={status.code}
                    sx={{ 
                      borderLeft: `4px solid ${getCategoryColor(status.category)}`,
                      mb: 0.5
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      {getCategoryIcon(status.category)}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="bold">
                          {status.code} – {status.statusName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Category: {status.category} | Responsible: {status.responsible}
                        </Typography>
                      </Box>
                      <Chip 
                        label={status.category} 
                        size="small" 
                        sx={{ 
                          backgroundColor: getCategoryColor(status.category),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {!selectedStatusCode && error && (
                <FormHelperText>Please select a status code</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Status Code Details Panel */}
          {statusCodeDetails && (
            <Grid item xs={12}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  backgroundColor: '#F9FAFB',
                  border: `2px solid ${getCategoryColor(statusCodeDetails.category)}`
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: getCategoryColor(statusCodeDetails.category) }}>
                  Status Details & Automation Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                      <Chip 
                        label={statusCodeDetails.category}
                        icon={getCategoryIcon(statusCodeDetails.category)}
                        sx={{ 
                          backgroundColor: getCategoryColor(statusCodeDetails.category),
                          color: 'white',
                          fontWeight: 'bold',
                          mt: 0.5
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Responsible Team</Typography>
                      <Typography variant="body1" fontWeight="bold">{statusCodeDetails.responsibleTeam}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Next Action Trigger</Typography>
                      <Typography variant="body1">{statusCodeDetails.nextActionTrigger}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Remarks Required</Typography>
                      <Typography variant="body1" fontWeight="bold" color={statusCodeDetails.remarksRequired ? 'error' : 'success.main'}>
                        {statusCodeDetails.remarksRequired ? 'Yes - Mandatory' : 'No - Optional'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Auto-Escalation</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {statusCodeDetails.autoEscalation?.enabled 
                          ? `Yes - To ${statusCodeDetails.autoEscalation.escalateTo} in ${statusCodeDetails.autoEscalation.timeInHours}h`
                          : 'No'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Automation Workflows */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Automated Workflows Triggered:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {statusCodeDetails.automation.createFollowUpTask && (
                        <Chip label="📅 Create Follow-up Task" size="small" color="primary" />
                      )}
                      {statusCodeDetails.automation.sendSMS && (
                        <Chip label="📱 Send SMS" size="small" color="primary" />
                      )}
                      {statusCodeDetails.automation.triggerSettlementWorkflow && (
                        <Chip label="💰 Settlement Workflow" size="small" color="success" />
                      )}
                      {statusCodeDetails.automation.triggerEscalationWorkflow && (
                        <Chip label="⚠️ Escalation Workflow" size="small" color="warning" />
                      )}
                      {statusCodeDetails.automation.createDisputeCase && (
                        <Chip label="⚖️ Dispute Case" size="small" color="error" />
                      )}
                      {statusCodeDetails.automation.assignToFieldVisit && (
                        <Chip label="🚶 Field Visit Assignment" size="small" color="info" />
                      )}
                      {statusCodeDetails.automation.triggerSkipTracing && (
                        <Chip label="🔍 Skip Tracing" size="small" color="warning" />
                      )}
                      {statusCodeDetails.automation.createDataCorrectionTask && (
                        <Chip label="🔧 Data Correction" size="small" color="info" />
                      )}
                      {statusCodeDetails.automation.updateAddressStatus && (
                        <Chip label="🏠 Address Status Update" size="small" color="secondary" />
                      )}
                      {statusCodeDetails.automation.lockAllocation && (
                        <Chip label="🔒 Lock Allocation" size="small" color="error" />
                      )}
                      {statusCodeDetails.automation.createPTPReminder && (
                        <Chip label="⏰ PTP Reminder" size="small" color="success" />
                      )}
                      {statusCodeDetails.automation.generateReceipt && (
                        <Chip label="🧾 Generate Receipt" size="small" color="success" />
                      )}
                      {statusCodeDetails.automation.updateOutstanding && (
                        <Chip label="💵 Update Outstanding" size="small" color="success" />
                      )}
                    </Box>
                  </Grid>

                  {/* Address Status for FE */}
                  {statusCodeDetails.addressStatus && statusCodeDetails.addressStatus !== 'NONE' && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        Address Status will be updated to: <strong>{statusCodeDetails.addressStatus}</strong>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Remarks Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required={statusCodeDetails?.remarksRequired}
              multiline
              rows={4}
              label={`Remarks ${statusCodeDetails?.remarksRequired ? '*' : '(Optional)'}`}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={submitting}
              placeholder="Enter detailed remarks about the feedback..."
              error={statusCodeDetails?.remarksRequired && !remarks.trim() && error}
              helperText={statusCodeDetails?.remarksRequired && !remarks.trim() && error ? 'Remarks are required for this status' : ''}
            />
          </Grid>

          {/* Follow-up Date & Time (conditional) */}
          {statusCodeDetails?.automation.createFollowUpTask && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Follow-up Date *"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Follow-up Time (Optional)"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  disabled={submitting}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {/* Promise Amount (conditional) */}
          {['PTP', 'FE_PTP', 'SETT_REQ', 'SETT_ACCEPTED'].includes(selectedStatusCode) && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Promise/Settlement Amount *"
                value={promiseAmount}
                onChange={(e) => setPromiseAmount(e.target.value)}
                disabled={submitting}
                InputProps={{ 
                  inputProps: { min: 0, step: 1 },
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>
          )}

          {/* GPS Location Display for FE */}
          {(userRole === 'FE' || userRole === 'FIELD_EXECUTIVE') && gpsLocation && (
            <Grid item xs={12}>
              <Alert severity="success">
                📍 GPS Location Captured: {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
                {' '}(Accuracy: {gpsLocation.accuracy.toFixed(0)}m)
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || loading}
          sx={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' },
            minWidth: '150px'
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Save Feedback & Trigger Actions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedFeedbackDialog;
