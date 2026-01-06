import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip
} from '@mui/material';
import {
  Lock as LockIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const AccountLockModal = ({ open, onClose, lockInfo }) => {
  if (!lockInfo) return null;

  const { reason, letterId, status, proposalType, lockDate } = lockInfo;

  // Define messages based on lock reason
  const getMessage = () => {
    switch (reason) {
      case 'Under Processing':
        return {
          title: 'Account Locked - Under Processing',
          message: 'This account already has a settlement proposal that is currently under approval process.',
          icon: <InfoIcon sx={{ fontSize: 60, color: '#FF9800' }} />,
          severity: 'warning'
        };
      case 'Approved':
        return {
          title: 'Account Locked - Already Approved',
          message: 'This account has an approved settlement proposal. A new proposal cannot be created until the current process is completed.',
          icon: <LockIcon sx={{ fontSize: 60, color: '#F44336' }} />,
          severity: 'error'
        };
      case 'Under Settlement Period':
        return {
          title: 'Account Locked - Settlement Active',
          message: 'This account is currently under an active settlement period with pending installments. New proposals cannot be created until the settlement is completed or cancelled.',
          icon: <LockIcon sx={{ fontSize: 60, color: '#F44336' }} />,
          severity: 'error'
        };
      case 'Invalid Proposal':
        return {
          title: 'Account Locked - Invalid Proposal',
          message: 'This account has an invalid proposal that needs to be resolved before creating a new one.',
          icon: <WarningIcon sx={{ fontSize: 60, color: '#FF9800' }} />,
          severity: 'warning'
        };
      case 'Cancellation In Progress':
        return {
          title: 'Account Locked - Cancellation Pending',
          message: 'A letter cancellation is currently in progress for this account. Please wait for the cancellation to complete before creating a new proposal.',
          icon: <InfoIcon sx={{ fontSize: 60, color: '#2196F3' }} />,
          severity: 'info'
        };
      default:
        return {
          title: 'Account Locked',
          message: 'This account is currently locked and cannot accept new proposals.',
          icon: <LockIcon sx={{ fontSize: 60, color: '#9E9E9E' }} />,
          severity: 'warning'
        };
    }
  };

  const messageInfo = getMessage();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pt: 3,
        pb: 1,
        background: 'linear-gradient(135deg, #FFAB40 0%, #FFD180 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {messageInfo.icon}
          <Typography variant="h5" fontWeight="600">
            {messageInfo.title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Alert severity={messageInfo.severity} sx={{ mb: 3 }}>
          {messageInfo.message}
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current Proposal Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Letter ID:
                </Typography>
                <Chip 
                  label={letterId} 
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: '#e3f2fd',
                    color: '#1976d2'
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Proposal Type:
                </Typography>
                <Chip 
                  label={proposalType} 
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: proposalType === 'Settlement' ? '#e1f5fe' : '#fce4ec',
                    color: proposalType === 'Settlement' ? '#0277bd' : '#c2185b'
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Chip 
                  label={status} 
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: '#fff3e0',
                    color: '#e65100'
                  }}
                />
              </Box>

              {lockDate && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Locked Since:
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {new Date(lockDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            <strong>Note:</strong> To create a new proposal, please wait for the current proposal to be completed, rejected, or cancelled.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            background: 'linear-gradient(135deg, #FFAB40 0%, #FFD180 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountLockModal;
