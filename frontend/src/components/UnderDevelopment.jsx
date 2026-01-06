import React from 'react';
import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import { Construction as ConstructionIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UnderDevelopment = ({ 
  title = "Feature Under Development", 
  description = "This feature is currently being developed and will be available soon.",
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ConstructionIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>For Developers:</strong> This component is being developed. 
            Check the console for any import or compilation errors.
          </Typography>
        </Alert>
        
        {showBackButton && (
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default UnderDevelopment;