import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Grid,
} from '@mui/material';
import { CheckCircle, Cancel, Send } from '@mui/icons-material';
import CancellationService from '../../services/CancellationService';
import SettlementService from '../../services/SettlementService';

const L1ReviewModal = ({ open, onClose, request, onSuccess }) => {
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!decision) {
      setError('Please select Approve or Reject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reviewedBy = {
        name: 'L1 Manager', // TODO: Replace with actual user from context/auth
        userId: 'manager123',
        role: 'Manager'
      };

      await CancellationService.l1Review(request._id, decision, comments, reviewedBy);

      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setDecision('');
      setComments('');

    } catch (err) {
      console.error('Error submitting L1 review:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

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
        L1 Manager Review - Cancellation Request
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Original Proposal Details */}
        <Typography variant="h6" sx={{ mb: 2, color: '#1A237E', fontWeight: 600 }}>
          Proposal Details
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Letter Number</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFAB40' }}>
              {request?.letterId}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Customer Name</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {request?.customerName}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Account Number</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {request?.accountNumber}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Proposal Type</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {request?.proposalId?.proposalType || 'N/A'}
            </Typography>
          </Grid>
          {request?.proposalId?.proposedAmount && (
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Proposed Amount</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {SettlementService.formatCurrency(request.proposalId.proposedAmount)}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Cancellation Request Details */}
        <Typography variant="h6" sx={{ mb: 2, color: '#1A237E', fontWeight: 600 }}>
          Cancellation Request Details
        </Typography>

        <Box sx={{ mb: 3, p: 2, backgroundColor: '#FFF3E0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Cancellation Reason
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
            {request?.cancellationReason}
          </Typography>

          {request?.cancellationReasonDetails && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reason Details
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                {request.cancellationReasonDetails}
              </Typography>
            </>
          )}

          {request?.additionalComments && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Additional Comments
              </Typography>
              <Typography variant="body1">
                {request.additionalComments}
              </Typography>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Requested By
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {request?.requestedBy?.name} ({request?.requestedBy?.role})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            on {CancellationService.formatDateTime(request?.requestedBy?.requestDate)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Manager Decision */}
        <Typography variant="h6" sx={{ mb: 2, color: '#1A237E', fontWeight: 600 }}>
          Manager Decision
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend" sx={{ fontWeight: 600, color: '#424242' }}>
            Select Decision *
          </FormLabel>
          <RadioGroup
            value={decision}
            onChange={(e) => {
              setDecision(e.target.value);
              setError('');
            }}
          >
            <FormControlLabel 
              value="Approve" 
              control={<Radio sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }} />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />
                  <Typography>Approve Cancellation</Typography>
                </Box>
              }
              disabled={loading}
            />
            <FormControlLabel 
              value="Reject" 
              control={<Radio sx={{ color: '#F44336', '&.Mui-checked': { color: '#F44336' } }} />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cancel sx={{ color: '#F44336', fontSize: 20 }} />
                  <Typography>Reject Cancellation</Typography>
                </Box>
              }
              disabled={loading}
            />
          </RadioGroup>
        </FormControl>

        {/* Manager Comments */}
        <TextField
          fullWidth
          label="Manager Comments (Optional)"
          multiline
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add any comments or reasons for your decision..."
          disabled={loading}
        />

        {/* Info Alert */}
        {decision === 'Approve' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              By approving this cancellation, it will be sent to Admin for final processing and account unlocking.
            </Typography>
          </Alert>
        )}

        {decision === 'Reject' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              By rejecting this cancellation, the letter will remain active and the account will stay locked.
            </Typography>
          </Alert>
        )}
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
          disabled={loading || !decision}
          sx={{
            background: decision === 'Approve' 
              ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' 
              : 'linear-gradient(135deg, #F44336 0%, #E57373 100%)',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: decision === 'Approve' 
                ? 'linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)' 
                : 'linear-gradient(135deg, #D32F2F 0%, #F44336 100%)',
            },
            '&.Mui-disabled': {
              background: '#E0E0E0',
              color: '#9E9E9E'
            }
          }}
        >
          {loading ? 'Submitting...' : 'Submit Decision'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default L1ReviewModal;
