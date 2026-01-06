import React from 'react';
import { Box, Typography } from '@mui/material';

const CustomerListTest = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Customer List Test
      </Typography>
      <Typography variant="body1">
        This is a test to see if the component renders properly.
      </Typography>
    </Box>
  );
};

export default CustomerListTest;