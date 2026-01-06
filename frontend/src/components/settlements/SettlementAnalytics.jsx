import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const SettlementAnalytics = ({ dashboardStats }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Settlement Analytics
      </Typography>
      <Typography color="text.secondary">
        Advanced analytics and reports coming soon...
      </Typography>
    </Paper>
  );
};

export default SettlementAnalytics;
