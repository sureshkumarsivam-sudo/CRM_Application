import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  IconButton,
  Collapse,
  Typography,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { healthAPI, initializeAPI } from '../services/api';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      await healthAPI.check();
      setIsConnected(true);
      setShowAlert(false);
      setRetryCount(0);
      console.log('✅ Connection restored');
    } catch (error) {
      setIsConnected(false);
      setShowAlert(true);
      console.error('❌ Connection check failed:', error.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await checkConnection();
  };

  useEffect(() => {
    // Initial connection check
    checkConnection();

    // Set up periodic health checks
    const interval = setInterval(async () => {
      if (!isChecking) {
        await checkConnection();
      }
    }, 30000); // Check every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('🌐 Browser detected online');
      checkConnection();
    };

    const handleOffline = () => {
      console.log('📵 Browser detected offline');
      setIsConnected(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert && isConnected) {
    return null;
  }

  return (
    <Box sx={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 1300 }}>
      <Collapse in={showAlert}>
        <Alert
          severity="error"
          icon={<WifiOffIcon />}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleRetry}
                disabled={isChecking}
                startIcon={<RefreshIcon />}
              >
                {isChecking ? 'Checking...' : 'Retry'}
              </Button>
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setShowAlert(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
          }
        >
          <Typography variant="body2" fontWeight="bold">
            Connection Lost
          </Typography>
          <Typography variant="caption">
            Unable to connect to the server. Some features may not work properly.
            {retryCount > 0 && ` (Retry attempts: ${retryCount})`}
          </Typography>
        </Alert>
        {isChecking && <LinearProgress />}
      </Collapse>
    </Box>
  );
};

export default ConnectionStatus;