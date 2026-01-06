import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Star as StarIcon,
  Palette as PaletteIcon,
  AutoAwesome as AutoAwesomeIcon,
  Colorize as ColorizeIcon,
} from '@mui/icons-material';

const ThemeShowcase = () => {
  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        textAlign: 'center',
        p: 3,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 249, 196, 0.5) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(46, 139, 87, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}>
        <Typography 
          variant="h3" 
          gutterBottom
          className="glow-text"
          sx={{
            background: 'linear-gradient(45deg, #2E8B57, #66BB6A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            mb: 2,
          }}
        >
          ✨ New Glossy Theme
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          Glossy Green • Pale Yellow • Light Orange
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Color Palette Card */}
        <Grid item xs={12} md={6}>
          <Card className="glass-card hover-lift" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  background: 'linear-gradient(45deg, #2E8B57, #66BB6A)', 
                  mr: 2,
                  boxShadow: '0 4px 15px rgba(46, 139, 87, 0.4)',
                }}>
                  <PaletteIcon />
                </Avatar>
                <Typography variant="h5" fontWeight={600} color="primary">
                  Color Palette
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper 
                    sx={{ 
                      height: 60, 
                      background: 'linear-gradient(45deg, #2E8B57, #66BB6A)',
                      borderRadius: 2,
                      boxShadow: '0 4px 15px rgba(46, 139, 87, 0.4)',
                    }} 
                  />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    Glossy Green
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Paper 
                    sx={{ 
                      height: 60, 
                      background: 'linear-gradient(45deg, #FFF9C4, #FFFDE7)',
                      borderRadius: 2,
                      boxShadow: '0 4px 15px rgba(255, 249, 196, 0.4)',
                    }} 
                  />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    Pale Yellow
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Paper 
                    sx={{ 
                      height: 60, 
                      background: 'linear-gradient(45deg, #FFB74D, #FFCC80)',
                      borderRadius: 2,
                      boxShadow: '0 4px 15px rgba(255, 183, 77, 0.4)',
                    }} 
                  />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    Light Orange
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Interactive Elements */}
        <Grid item xs={12} md={6}>
          <Card className="glass-card hover-lift" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  background: 'linear-gradient(45deg, #FFB74D, #FFCC80)', 
                  color: '#000',
                  mr: 2,
                  boxShadow: '0 4px 15px rgba(255, 183, 77, 0.4)',
                }}>
                  <AutoAwesomeIcon />
                </Avatar>
                <Typography variant="h5" fontWeight={600} color="primary">
                  Interactive Elements
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Button 
                  variant="contained" 
                  className="glossy-button ripple"
                  sx={{ 
                    mr: 2, 
                    mb: 2,
                    background: 'linear-gradient(45deg, #2E8B57 30%, #66BB6A 90%)',
                  }}
                >
                  Primary Button
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    mr: 2, 
                    mb: 2,
                    borderColor: '#2E8B57',
                    color: '#2E8B57',
                    background: 'rgba(255, 249, 196, 0.3)',
                    '&:hover': {
                      borderColor: '#1B5E20',
                      background: 'rgba(255, 249, 196, 0.6)',
                    },
                  }}
                >
                  Outlined Button
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Chip 
                  label="Active Status" 
                  className="status-active" 
                  icon={<StarIcon />}
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  label="Warning Status" 
                  className="status-warning" 
                  sx={{ mr: 1, mb: 1 }} 
                />
                <Chip 
                  label="Inactive Status" 
                  className="status-inactive" 
                  sx={{ mr: 1, mb: 1 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Features Card */}
        <Grid item xs={12}>
          <Card className="glass-card hover-lift">
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  background: 'linear-gradient(45deg, #81C784, #4CAF50)', 
                  mr: 2,
                  boxShadow: '0 4px 15px rgba(129, 199, 132, 0.4)',
                }}>
                  <ColorizeIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={600} color="primary">
                  Theme Features
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Glassmorphism
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Beautiful frosted glass effects with backdrop blur and transparency
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Glossy Elements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shiny, reflective surfaces with gradient overlays and hover effects
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Smooth Animations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fluid transitions, hover effects, and micro-interactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Cohesive Design
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consistent color scheme throughout all components and pages
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThemeShowcase;