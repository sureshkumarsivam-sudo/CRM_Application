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
  Divider,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  LockOpen,
  Email,
  Assignment,
  Archive,
  Refresh,
} from '@mui/icons-material';
import CancellationService from '../../services/CancellationService';
import SettlementService from '../../services/SettlementService';

const AdminFinalizeModal = ({ open, onClose, request, onSuccess }) => {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [finalizationResult, setFinalizationResult] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const finalizedBy = {
        name: 'Admin User', // TODO: Replace with actual user from context/auth
        userId: 'admin123',
        role: 'Admin'
      };

      const result = await CancellationService.adminFinalize(request._id, comments, finalizedBy);

      // Show success state with all actions performed
      setFinalizationResult(result);
      setShowSuccess(true);

      // Wait 2 seconds before closing to show success details
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        // Reset form
        setComments('');
        setShowSuccess(false);
        setFinalizationResult(null);
      }, 3000);

    } catch (err) {
      console.error('Error finalizing cancellation:', err);
      setError(err.response?.data?.message || 'Failed to finalize cancellation');
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
        background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
        color: 'white',
        fontWeight: 700,
        fontSize: '1.25rem'
      }}>
        Admin Finalization - Cancellation Request
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success State - Show Auto-Actions Performed */}
        {showSuccess && finalizationResult && (
          <Box>
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                ✅ Cancellation Finalized Successfully!
              </Typography>
              <Typography variant="body2">
                All auto-actions have been completed. Account is now unlocked.
              </Typography>
            </Alert>

            <Typography variant="h6" sx={{ mb: 2, color: '#1A237E', fontWeight: 600 }}>
              Auto-Actions Performed:
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#4CAF50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Letter Status Updated"
                  secondary={`Letter ${request.letterId} marked as CANCELLED`}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#4CAF50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Proposal Status Updated"
                  secondary="Proposal marked as CANCELLED"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <LockOpen sx={{ color: '#4CAF50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Account UNLOCKED"
                  secondary={`Account ${request.accountNumber} is now unlocked - New proposals can be created`}
                  primaryTypographyProps={{ fontWeight: 700, color: '#4CAF50' }}
                />
              </ListItem>

              {finalizationResult.emailNotifications && (
                <ListItem>
                  <ListItemIcon>
                    <Email sx={{ color: '#4CAF50' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Notifications Sent"
                    secondary={`${finalizationResult.emailNotifications.prepared} email notifications prepared for: ${finalizationResult.emailNotifications.recipients.join(', ')}`}
                  />
                </ListItem>
              )}

              <ListItem>
                <ListItemIcon>
                  <Assignment sx={{ color: '#4CAF50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Comprehensive Audit Log Created"
                  secondary="Full timeline and cancellation history recorded"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Archive sx={{ color: '#4CAF50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Previous Letter Archived"
                  secondary="Cancellation history maintained in audit trail"
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 2, p: 2, backgroundColor: '#E8F5E9', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                🎉 The user can now immediately create a NEW Settlement/Closure proposal for account {request.accountNumber}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Normal Finalization Interface */}
        {!showSuccess && (
          <Box>
            {/* Proposal Details */}
            <Typography variant="h6" sx={{ mb: 2, color: '#1A237E', fontWeight: 600 }}>
              Proposal Details
            </Typography>
        
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Letter Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#4CAF50' }}>
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

            {/* Cancellation Request Info */}
            <Typography variant="h6" sx={{ mb: 2, color: '#1A237E', fontWeight: 600 }}>
              Cancellation Request
            </Typography>

            <Box sx={{ mb: 2, p: 2, backgroundColor: '#FFF3E0', borderRadius: 1 }}>
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
                  <Typography variant="body1" sx={{ mb: 2 }}>
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
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* L1 Review Details */}
            <Typography variant="h6" sx={{ mb: 2, color: '#1A237E', fontWeight: 600 }}>
              L1 Manager Review
            </Typography>

            {/* L1 Review Details */}
            <Typography variant="h6" sx={{ mb: 2, color: '#1A237E', fontWeight: 600 }}>
              L1 Manager Review
            </Typography>

            <Box sx={{ mb: 3, p: 2, backgroundColor: '#E8F5E9', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Reviewed By
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {request?.l1Review?.reviewedBy?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request?.l1Review?.reviewedBy?.role}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Review Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {CancellationService.formatDateTime(request?.l1Review?.reviewDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Decision
                  </Typography>
                  <Chip
                    icon={<CheckCircle />}
                    label="Approved"
                    sx={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Grid>
                {request?.l1Review?.comments && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Manager Comments
                    </Typography>
                    <Typography variant="body1">
                      {request.l1Review.comments}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Admin Comments */}
            <Typography variant="h6" sx={{ mb: 2, color: '#1A237E', fontWeight: 600 }}>
              Admin Finalization
            </Typography>

            <TextField
              fullWidth
              label="Admin Notes (Optional)"
              multiline
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any final comments or notes for audit/compliance..."
              disabled={loading}
              sx={{ mb: 2 }}
            />

            {/* Auto-Actions Alert */}
            <Alert severity="success" icon={<LockOpen />}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                <strong>System Auto-Actions:</strong> Finalizing will automatically:
              </Typography>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li><Typography variant="body2">Update letter status to "CANCELLED" with timestamp</Typography></li>
                <li><Typography variant="body2">Update proposal status to "CANCELLED"</Typography></li>
                <li><Typography variant="body2">Mark payment tracking as "Archived"</Typography></li>
                <li><Typography variant="body2"><strong>UNLOCK ACCOUNT</strong> - Remove all locks</Typography></li>
                <li><Typography variant="body2">Create comprehensive audit log with full timeline</Typography></li>
                <li><Typography variant="body2">Send confirmation emails to Customer, Initiator, and Manager</Typography></li>
                <li><Typography variant="body2">Archive previous letter completely</Typography></li>
                <li><Typography variant="body2"><strong>Enable immediate creation of new proposals</strong></Typography></li>
              </ul>
            </Alert>
          </Box>
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
          {showSuccess ? 'Close' : 'Cancel'}
        </Button>
        {!showSuccess && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <LockOpen />}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)',
              },
              '&.Mui-disabled': {
                background: '#E0E0E0',
                color: '#9E9E9E'
              }
            }}
          >
            {loading ? 'Finalizing...' : 'Finalize Cancellation'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AdminFinalizeModal;
