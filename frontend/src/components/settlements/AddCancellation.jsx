import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
  Card,
  CardContent,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import SettlementService from '../../services/SettlementService';
import CancellationService from '../../services/CancellationService';

const AddCancellation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeProposals, setActiveProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    cancellationReason: '',
    cancellationReasonDetails: '',
    additionalComments: ''
  });

  const cancellationReasons = [
    'Customer requested cancellation',
    'Account settled through other means',
    'Customer default/unable to pay',
    'Administrative correction needed',
    'Other'
  ];

  useEffect(() => {
    loadActiveProposals();
  }, []);

  const loadActiveProposals = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch proposals that can be cancelled
      const validStatuses = ['Pending L1', 'L1 Approved', 'Pending L2', 'Active', 'Broken Settlement'];
      const response = await SettlementService.getProposals({ limit: 1000 });
      
      if (response && response.proposals) {
        // Filter proposals that are cancellable (any valid status, regardless of lock)
        const cancellable = response.proposals.filter(p => 
          validStatuses.includes(p.status)
        );
        setActiveProposals(cancellable);
      }
    } catch (err) {
      console.error('Error loading active proposals:', err);
      setError('Failed to load active proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSelect = (event, value) => {
    setSelectedProposal(value);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!selectedProposal) {
      setError('Please select a proposal/letter');
      return false;
    }

    if (!formData.cancellationReason) {
      setError('Please select a cancellation reason');
      return false;
    }

    if (formData.cancellationReason === 'Other' && !formData.cancellationReasonDetails.trim()) {
      setError('Please provide details for the cancellation reason');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setConfirmDialogOpen(false);

    try {
      const requestData = {
        proposalId: selectedProposal._id,
        letterId: selectedProposal.letterId || selectedProposal._id,
        customerId: selectedProposal.customerId,
        accountNumber: selectedProposal.accountNumber,
        customerName: selectedProposal.customerName,
        cancellationReason: formData.cancellationReason,
        cancellationReasonDetails: formData.cancellationReasonDetails,
        additionalComments: formData.additionalComments,
        requestedBy: {
          name: 'Current User', // TODO: Get from auth context
          userId: 'user123',
          role: 'Telecaller'
        }
      };

      const response = await CancellationService.createCancellationRequest(requestData);

      if (response) {
        setSuccess('Cancellation request submitted successfully! L1 Manager will review it.');
        // Reset form
        setSelectedProposal(null);
        setFormData({
          cancellationReason: '',
          cancellationReasonDetails: '',
          additionalComments: ''
        });
        // Reload proposals
        loadActiveProposals();
      }
    } catch (err) {
      console.error('Error submitting cancellation request:', err);
      setError(err.response?.data?.message || 'Failed to submit cancellation request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'success',
      'Pending L1': 'warning',
      'L1 Approved': 'info',
      'Pending L2': 'warning',
      'Broken Settlement': 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CancelIcon sx={{ fontSize: 40, color: '#F44336', mr: 2 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
              Request Letter Cancellation
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Initiate cancellation request for settlement/closure letters
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
          <Typography variant="body2" fontWeight={600}>Cancellation Workflow:</Typography>
          <Typography variant="body2">
            1. You submit request → 2. L1 Manager reviews → 3. Admin finalizes → 4. Account unlocked
          </Typography>
        </Alert>

        {/* Error/Success Messages */}
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

        {/* Form */}
        <Grid container spacing={3}>
          {/* Step 1: Select Proposal */}
          <Grid item xs={12}>
            <Card sx={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', border: '2px solid #A5D6A7', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976D2' }}>
                  Step 1: Select Active Letter/Proposal
                </Typography>
                
                <Autocomplete
                  options={activeProposals}
                  getOptionLabel={(option) => 
                    `${option.letterId || option._id} - ${option.customerName} (${option.accountNumber})`
                  }
                  value={selectedProposal}
                  onChange={handleProposalSelect}
                  loading={loading}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Letter/Proposal *"
                      placeholder="Search by Letter ID, Customer Name, or Account Number"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight={600}>
                            {option.letterId || option._id}
                          </Typography>
                          <Chip 
                            label={option.status} 
                            size="small" 
                            color={getStatusColor(option.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {option.customerName} • {option.accountNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Amount: ₹{(option.proposedAmount || 0).toLocaleString()} • 
                          Type: {option.proposalType}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Selected Proposal Details */}
          {selectedProposal && (
            <Grid item xs={12}>
              <Card sx={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', border: '2px solid #90CAF9', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976D2' }}>
                    Selected Proposal Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Letter ID</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedProposal.letterId || selectedProposal._id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedProposal.status} 
                        size="small" 
                        color={getStatusColor(selectedProposal.status)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedProposal.customerName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Account Number</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedProposal.accountNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Proposal Type</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedProposal.proposalType}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Proposed Amount</Typography>
                      <Typography variant="body1" fontWeight={600} color="error">
                        ₹{(selectedProposal.proposedAmount || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Step 2: Cancellation Details */}
          {selectedProposal && (
            <Grid item xs={12}>
              <Card sx={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', border: '2px solid #FFCC80', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976D2' }}>
                    Step 2: Provide Cancellation Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Cancellation Reason</InputLabel>
                        <Select
                          value={formData.cancellationReason}
                          onChange={(e) => handleInputChange('cancellationReason', e.target.value)}
                          label="Cancellation Reason"
                        >
                          {cancellationReasons.map(reason => (
                            <MenuItem key={reason} value={reason}>
                              {reason}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {formData.cancellationReason === 'Other' && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          required
                          multiline
                          rows={2}
                          label="Cancellation Reason Details"
                          value={formData.cancellationReasonDetails}
                          onChange={(e) => handleInputChange('cancellationReasonDetails', e.target.value)}
                          placeholder="Please provide specific details..."
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Additional Comments (Optional)"
                        value={formData.additionalComments}
                        onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                        placeholder="Any additional information..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Action Buttons */}
          {selectedProposal && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedProposal(null);
                    setFormData({
                      cancellationReason: '',
                      cancellationReasonDetails: '',
                      additionalComments: ''
                    });
                  }}
                  disabled={loading}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CancelIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #F44336 0%, #E53935 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #E53935 0%, #D32F2F 100%)'
                    }
                  }}
                >
                  Submit Cancellation Request
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1 }} />
            Confirm Cancellation Request
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will lock the account until the cancellation is finalized by Admin.
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to submit a cancellation request for:
          </Typography>
          
          <Box sx={{ backgroundColor: '#F5F5F5', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2"><strong>Letter ID:</strong> {selectedProposal?.letterId}</Typography>
            <Typography variant="body2"><strong>Customer:</strong> {selectedProposal?.customerName}</Typography>
            <Typography variant="body2"><strong>Reason:</strong> {formData.cancellationReason}</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            The request will be sent to L1 Manager for review.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSubmit} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            Confirm Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddCancellation;
