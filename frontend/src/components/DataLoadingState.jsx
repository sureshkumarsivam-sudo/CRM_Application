import React from 'react';
import {
  Box,
  Alert,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  CloudOff as CloudOffIcon,
} from '@mui/icons-material';

const DataLoadingState = ({
  isLoading,
  error,
  data,
  onRetry,
  children,
  emptyMessage = "No data available",
  loadingMessage = "Loading...",
  showSkeleton = false,
  skeletonCount = 3,
  minHeight = 200,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight,
          p: 3 
        }}
      >
        {showSkeleton ? (
          <Box sx={{ width: '100%' }}>
            {[...Array(skeletonCount)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                height={60}
                sx={{ mb: 1, borderRadius: 1 }}
              />
            ))}
          </Box>
        ) : (
          <>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {loadingMessage}
            </Typography>
          </>
        )}
      </Box>
    );
  }

  // Error state
  if (error) {
    const isNetworkError = error.message?.toLowerCase().includes('network') || 
                          error.code === 'ERR_NETWORK' ||
                          error.code === 'ECONNREFUSED';

    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid #f44336' }}>
          {isNetworkError ? (
            <CloudOffIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          )}
          
          <Typography variant="h6" color="error" gutterBottom>
            {isNetworkError ? 'Connection Problem' : 'Error Loading Data'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {isNetworkError 
              ? 'Unable to connect to the server. Please check your connection and try again.'
              : error.message || 'An unexpected error occurred while loading data.'
            }
          </Typography>

          {process.env.NODE_ENV === 'development' && (
            <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
              <Typography variant="caption" component="pre">
                Debug Info: {JSON.stringify(error, null, 2)}
              </Typography>
            </Alert>
          )}
          
          {onRetry && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
        </Paper>
      </Box>
    );
  }

  // Empty state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight,
          p: 3 
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        {onRetry && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ mt: 2 }}
          >
            Refresh
          </Button>
        )}
      </Box>
    );
  }

  // Success state - render children
  return children;
};

export default DataLoadingState;