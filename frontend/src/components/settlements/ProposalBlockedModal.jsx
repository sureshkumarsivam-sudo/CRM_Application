import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Cancel as CancelIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const ProposalBlockedModal = ({ open, onClose, reason, accountStatus }) => {
  const getModalConfig = () => {
    const statusLower = (accountStatus || '').toLowerCase();
    
    if (statusLower.includes('closed') || statusLower === 'closed ✓') {
      return {
        icon: <CancelIcon sx={{ fontSize: 64, color: '#f44336' }} />,
        title: 'Already Closed',
        message: 'This account is already closed. No new proposal can be created.',
        color: '#f44336',
        bgColor: '#ffebee'
      };
    }
    
    if (statusLower.includes('settlement done') || statusLower.includes('settled') || statusLower === 'settlement done ✓') {
      return {
        icon: <CancelIcon sx={{ fontSize: 64, color: '#ff9800' }} />,
        title: 'Already Settled',
        message: 'This account has already been settled. No new proposal can be created.',
        color: '#ff9800',
        bgColor: '#fff3e0'
      };
    }
    
    // Default fallback
    return {
      icon: <CancelIcon sx={{ fontSize: 64, color: '#f44336' }} />,
      title: 'Proposal Creation Blocked',
      message: reason || 'This account cannot create new proposals.',
      color: '#f44336',
      bgColor: '#ffebee'
    };
  };

  const config = getModalConfig();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pt: 4,
          pb: 2,
          background: `linear-gradient(135deg, ${config.bgColor} 0%, ${config.bgColor} 100%)`,
          borderBottom: `3px solid ${config.color}`
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {config.icon}
          <Typography variant="h5" sx={{ fontWeight: 700, color: config.color }}>
            ❌ {config.title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2, px: 4 }}>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            fontSize: '1.1rem',
            color: '#424242',
            lineHeight: 1.6
          }}
        >
          {config.message}
        </Typography>
        
        {accountStatus && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Account Status:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: config.color }}>
              {accountStatus}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: '#e3f2fd',
            borderRadius: 2,
            borderLeft: '4px solid #2196f3'
          }}
        >
          <Typography variant="body2" sx={{ color: '#1565c0' }}>
            <strong>Note:</strong> If you believe this is an error, please contact your system administrator or check the account status in the Accounts module.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          sx={{
            minWidth: 150,
            background: `linear-gradient(135deg, ${config.color} 0%, ${config.color} 100%)`,
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              background: `linear-gradient(135deg, ${config.color} 0%, ${config.color} 100%)`,
              opacity: 0.9
            }
          }}
        >
          OK, Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProposalBlockedModal;
