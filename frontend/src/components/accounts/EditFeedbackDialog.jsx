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
import StatusCodeService from '../../services/StatusCodeService';

const EditFeedbackDialog = ({ open, onClose, feedback, onSuccess }) => {
  const [statusCode, setStatusCode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [promiseAmount, setPromiseAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusCodes, setStatusCodes] = useState([]);
  const [loadingStatusCodes, setLoadingStatusCodes] = useState(false);

  // Fetch status codes from database (CALLER + BOTH)
  useEffect(() => {
    const fetchStatusCodes = async () => {
      try {
        setLoadingStatusCodes(true);
        const codes = await StatusCodeService.getFormattedStatusCodes('CALLER');
        setStatusCodes(codes);
      } catch (error) {
        console.error('Failed to load status codes:', error);
        // Fallback to basic codes if API fails
        setStatusCodes([
          { value: 'NC', label: 'NC - Not Connected' },
          { value: 'RNR', label: 'RNR - Ringing No Response' },
          { value: 'CB', label: 'CB - Customer Busy' },
          { value: 'PTP', label: 'PTP - Promise to Pay' },
          { value: 'PAYMENT', label: 'PAYMENT - Payment Made' },
        ]);
      } finally {
        setLoadingStatusCodes(false);
      }
    };

    if (open) {
      fetchStatusCodes();
    }
  }, [open]);

  useEffect(() => {
    if (feedback && open) {
      setStatusCode(feedback.statusCode || '');
      setRemarks(feedback.remarks || '');
      setFollowUpDate(feedback.followUpDate ? new Date(feedback.followUpDate).toISOString().split('T')[0] : '');
      setPromiseAmount(feedback.promiseAmount || '');
    }
  }, [feedback, open]);

  const handleSubmit = async () => {
    if (!statusCode || !remarks.trim()) {
      alert('Please select a status code and enter remarks');
      return;
    }

    if (!feedback || !feedback._id) {
      alert('Invalid feedback data');
      return;
    }

    try {
      setSubmitting(true);

      const selectedStatus = statusCodes.find(s => s.value === statusCode);
      
      const updateData = {
        statusCode: statusCode,
        statusLabel: selectedStatus?.label || statusCode,
        remarks: remarks.trim(),
        followUpDate: followUpDate || undefined,
        promiseAmount: promiseAmount ? parseFloat(promiseAmount) : undefined,
      };

      await FeedbackService.updateFeedback(feedback._id, updateData);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Failed to update feedback:', error);
      alert('Failed to update feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
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
          border: '2px solid #FFAB40'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          backgroundColor: '#FFAB40',
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" component="div">
          Edit Feedback
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
        {feedback && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {new Date(feedback.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {feedback.createdBy || 'N/A'}
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
            backgroundColor: '#FFAB40',
            '&:hover': { backgroundColor: '#FB8C00' },
            minWidth: '100px'
          }}
        >
          {submitting ? 'Updating...' : 'Update Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditFeedbackDialog;
