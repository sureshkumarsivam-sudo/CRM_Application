import React, { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingFallback = ({ message = "Loading..." }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <LoadingFallback />}>
    {children}
  </Suspense>
);

export { LoadingFallback, LazyWrapper };
export default LazyWrapper;