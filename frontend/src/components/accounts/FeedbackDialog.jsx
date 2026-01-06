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
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import FeedbackService from '../../services/FeedbackService';
import MasterStatusCodeService from '../../services/MasterStatusCodeService';

const FeedbackDialog = ({ open, onClose, account, onSuccess }) => {
  const [statusCode, setStatusCode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [promiseAmount, setPromiseAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusCodes, setStatusCodes] = useState([]);
  const [loadingStatusCodes, setLoadingStatusCodes] = useState(false);

  // Fetch status codes from Status_Code collection
  useEffect(() => {
    const fetchStatusCodes = async () => {
      try {
        setLoadingStatusCodes(true);
        
        // Fetch only active status codes, sorted alphabetically
        const response = await MasterStatusCodeService.getStatusCodes({
          isActive: true,
          sortBy: 'code',
          sortOrder: 'asc',
          limit: 1000
        });
        
        if (response && response.success && Array.isArray(response.data)) {
          // Map to dropdown format: code – description
          const formattedCodes = response.data.map(status => ({
            value: status.code,
            label: `${status.code} – ${status.description}`
          }));
          setStatusCodes(formattedCodes);
        } else {
          setStatusCodes([]);
        }
      } catch (error) {
        console.error('Failed to load status codes:', error);
        setStatusCodes([]);
      } finally {
        setLoadingStatusCodes(false);
      }
    };

    if (open) {
      fetchStatusCodes();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!statusCode || !remarks.trim()) {
      alert('Please select a status code and enter remarks');
      return;
    }

    if (!account || !account._id || !account.loanId) {
      alert('Invalid account data');
      return;
    }

    try {
      setSubmitting(true);

      const selectedStatus = statusCodes.find(s => s.value === statusCode);
      
      const feedbackData = {
        customerId: account._id,
        loanId: account.loanId,
        statusCode: statusCode,
        statusLabel: selectedStatus?.label || statusCode,
        remarks: remarks.trim(),
        activityType: 'Feedback',
        followUpDate: followUpDate || undefined,
        promiseAmount: promiseAmount ? parseFloat(promiseAmount) : undefined,
        createdBy: 'Current User', // Replace with actual user from auth
        userRole: 'Admin' // Replace with actual role from auth
      };

      await FeedbackService.createFeedback(feedbackData);

      // Reset form
      setStatusCode('');
      setRemarks('');
      setFollowUpDate('');
      setPromiseAmount('');

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Failed to save feedback:', error);
      alert('Failed to save feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setStatusCode('');
      setRemarks('');
      setFollowUpDate('');
      setPromiseAmount('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
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
          Add Feedback
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
        {account && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Account Number
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {account.loanId || account.accountNumber || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Customer Name
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {account.customerName || account.name || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Status Code</InputLabel>
              <Select
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                label="Status Code"
                disabled={submitting}
              >
                {statusCodes.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={submitting}
              placeholder="Enter detailed remarks about the feedback..."
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Follow-up Date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              disabled={submitting}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Promise Amount"
              value={promiseAmount}
              onChange={(e) => setPromiseAmount(e.target.value)}
              disabled={submitting}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
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
          disabled={submitting}
          sx={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' },
            minWidth: '100px'
          }}
        >
          {submitting ? 'Saving...' : 'Save Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;

