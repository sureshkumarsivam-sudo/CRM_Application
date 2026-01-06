import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Cancel, Send } from '@mui/icons-material';
import CancellationService from '../../services/CancellationService';

const CancellationRequestModal = ({ open, onClose, proposal, onSuccess }) => {
  const [formData, setFormData] = useState({
    cancellationReason: '',
    cancellationReasonDetails: '',
    additionalComments: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.cancellationReason) {
      setError('Please select a cancellation reason');
      return;
    }

    if (formData.cancellationReason === 'Other' && !formData.cancellationReasonDetails.trim()) {
      setError('Please provide details for "Other" reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        proposalId: proposal._id,
        letterId: proposal.letterId,
        customerId: proposal.customerId,
        accountNumber: proposal.accountNumber,
        customerName: proposal.customerName,
        cancellationReason: formData.cancellationReason,
        cancellationReasonDetails: formData.cancellationReasonDetails,
        additionalComments: formData.additionalComments,
        requestedBy: {
          name: 'Current User', // TODO: Replace with actual user from context/auth
          userId: 'user123',
          role: 'Caller'
        }
      };

      const result = await CancellationService.createCancellationRequest(requestData);
      
      if (onSuccess) {
        onSuccess(result);
      }

      // Reset form
      setFormData({
        cancellationReason: '',
        cancellationReasonDetails: '',
        additionalComments: ''
      });

      onClose();

    } catch (err) {
      console.error('Error submitting cancellation request:', err);
      setError(err.response?.data?.message || 'Failed to submit cancellation request');
    } finally {
      setLoading(false);
    }
  };

  const reasonOptions = CancellationService.getCancellationReasonOptions();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #FFAB40 0%, #FFB74D 100%)',
        color: 'white',
        fontWeight: 700,
        fontSize: '1.25rem'
      }}>
        Request Letter Cancellation
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Letter & Proposal Info - Read Only */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#F5F5F5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Letter Number
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, color: '#FFAB40' }}>
            {proposal?.letterId || 'N/A'}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Customer Name
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
            {proposal?.customerName || 'N/A'}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Account Number
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {proposal?.accountNumber || 'N/A'}
          </Typography>
        </Box>

        {/* Cancellation Reason Dropdown */}
        <TextField
          select
          fullWidth
          label="Cancellation Reason *"
          value={formData.cancellationReason}
          onChange={(e) => handleChange('cancellationReason', e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
        >
          {reasonOptions.map((reason) => (
            <MenuItem key={reason} value={reason}>
              {reason}
            </MenuItem>
          ))}
        </TextField>

        {/* Details for "Other" reason */}
        {formData.cancellationReason === 'Other' && (
          <TextField
            fullWidth
            label="Please specify the reason *"
            multiline
            rows={2}
            value={formData.cancellationReasonDetails}
            onChange={(e) => handleChange('cancellationReasonDetails', e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
          />
        )}

        {/* Additional Comments */}
        <TextField
          fullWidth
          label="Additional Comments (Optional)"
          multiline
          rows={3}
          value={formData.additionalComments}
          onChange={(e) => handleChange('additionalComments', e.target.value)}
          placeholder="Any additional information regarding this cancellation request..."
          disabled={loading}
        />

        {/* Information Alert */}
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Please Note:</strong> Once submitted, this request will be sent to your L1 Manager for review. 
            The letter status will be changed to "Cancellation Requested" and the account will remain locked 
            until the cancellation is processed.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<Cancel />}
          disabled={loading}
          sx={{
            borderColor: '#9E9E9E',
            color: '#424242',
            '&:hover': {
              borderColor: '#757575',
              backgroundColor: '#F5F5F5'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Send />}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #FFAB40 0%, #FFB74D 100%)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #FF9800 0%, #FFAB40 100%)',
            },
            '&.Mui-disabled': {
              background: '#E0E0E0',
              color: '#9E9E9E'
            }
          }}
        >
          {loading ? 'Submitting...' : 'Submit Cancellation Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancellationRequestModal;
