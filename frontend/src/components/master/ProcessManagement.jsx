import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

const ProcessManagement = () => {
  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      <Paper sx={{ 
        p: 4, 
        textAlign: 'center',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <ConstructionIcon sx={{ fontSize: 80, color: '#FFA726', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
          Process Management
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 3, maxWidth: 600, mx: 'auto' }}>
          This module is currently under development. It will allow you to manage and configure 
          business processes for the CRM system.
        </Typography>
        <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
          Coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProcessManagement;
