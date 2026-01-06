import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Container,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
} from '@mui/icons-material';

const UnderDevelopment = () => {
  return (
    <Box sx={{ p: 3, backgroundColor: '#FFF8F0', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Paper
          sx={{
            mt: 8,
            p: 6,
            borderRadius: '16px',
            textAlign: 'center',
            backgroundColor: 'white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: '#FFE0B2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <ConstructionIcon sx={{ fontSize: 60, color: '#FF9A56' }} />
          </Box>
          
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
            Under Development
          </Typography>
          
          <Typography variant="h6" sx={{ color: '#FF9A56', mb: 2, fontWeight: 500 }}>
            Audit Trail
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
            This feature is currently under development and will be available soon.
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#999' }}>
            We're working hard to bring you this functionality. Please check back later.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default UnderDevelopment;
