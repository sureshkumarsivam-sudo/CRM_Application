import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Button,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { useDashboardStats } from '../hooks/useCustomers';
import ConnectionStatus from './ConnectionStatus';
import DataLoadingState from './DataLoadingState';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useDashboardStats();

  const stats = data?.data;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Colors for pie chart - Updated to match orange theme
  const COLORS = ['#FFAB40', '#FFB74D', '#FFA726', '#FB8C00', '#FFAB40'];

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      overflow: 'auto'
    }}>
      <Box sx={{ 
        p: { xs: 2, sm: 2, md: 3 },
        maxWidth: '1600px',
        mx: 'auto'
      }}>
        {/* Connection Status */}
        <ConnectionStatus />

        {/* Header */}
        <Box sx={{ 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2.5,
          background: '#FFFFFF',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #E8EDF2',
        }}>
        <Box>
          <Typography 
            variant="h5" 
            sx={{
              color: '#2C3E50',
              fontWeight: 700,
              mb: 0.5,
              fontSize: '1.5rem',
            }}
          >
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#78909C', fontSize: '0.875rem' }}>
            Overview of collection performance and key metrics
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/customers/new')}
          sx={{
            background: 'linear-gradient(135deg, #5B9BD5 0%, #8BB7E0 100%)',
            borderRadius: 2,
            px: 2.5,
            py: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 2px 8px rgba(91, 155, 213, 0.25)',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #2B6DAA 0%, #5B9BD5 100%)',
              boxShadow: '0 4px 12px rgba(91, 155, 213, 0.35)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.25s',
          }}
        >
          Add Customer
        </Button>
      </Box>

      {/* Data Loading State with enhanced error handling */}
      <DataLoadingState
        isLoading={isLoading}
        error={error}
        data={stats}
        onRetry={refetch}
        loadingMessage="Loading dashboard statistics..."
        errorMessage="Failed to load dashboard data"
        emptyMessage="No dashboard data available"
        showSkeleton={true}
        skeletonProps={{
          height: 200,
          count: 4,
          sx: { mb: 2 }
        }}
      >
        {/* Dashboard Content */}
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Total Target */}
            <Grid item xs={6} sm={4} md={3} lg={2}>
              <Card sx={{ 
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                background: '#FFFFFF',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #E8EDF2',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transform: 'translateY(-3px)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #5B9BD5 0%, #8BB7E0 100%)',
                }
              }}>
                <CardContent sx={{ p: 2.5, pb: '16px !important', position: 'relative', zIndex: 1 }}>
                  {/* Icon Watermark */}
                  <Box sx={{ 
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    opacity: 0.08,
                    zIndex: 0
                  }}>
                    <TrendingUpIcon sx={{ fontSize: '56px', color: '#5B9BD5' }} />
                  </Box>
                  
                  {/* Content */}
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#78909C',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                        letterSpacing: '0.5px'
                      }}
                    >
                      TOTAL TARGET
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#2C3E50',
                        fontSize: '1.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      ₹4,350,000
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Collected */}
            <Grid item xs={6} sm={4} md={3} lg={2}>
              <Card sx={{ 
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                background: '#FFFFFF',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #E8EDF2',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transform: 'translateY(-3px)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #81C784 0%, #A5D6A7 100%)',
                }
              }}>
                <CardContent sx={{ p: 2.5, pb: '16px !important', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ 
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    opacity: 0.08,
                    zIndex: 0
                  }}>
                    <AccountBalanceIcon sx={{ fontSize: '56px', color: '#81C784' }} />
                  </Box>
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#78909C',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                        letterSpacing: '0.5px'
                      }}
                    >
                      TOTAL COLLECTED
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#2C3E50',
                        fontSize: '1.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      ₹1,534,201
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Yet To Do */}
            <Grid item xs={6} sm={4} md={3} lg={2}>
              <Card sx={{ 
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                background: '#FFFFFF',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #E8EDF2',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transform: 'translateY(-3px)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #FFB74D 0%, #FFCC80 100%)',
                }
              }}>
                <CardContent sx={{ p: 2.5, pb: '16px !important', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ 
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    opacity: 0.08,
                    zIndex: 0
                  }}>
                    <WarningIcon sx={{ fontSize: '56px', color: '#FFB74D' }} />
                  </Box>
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#78909C',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                        letterSpacing: '0.5px'
                      }}
                    >
                      YET TO DO
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#2C3E50',
                        fontSize: '1.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      ₹2,815,799
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Today PTP */}
            <Grid item xs={6} sm={4} md={3} lg={2}>
              <Card sx={{ 
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                background: '#FFFFFF',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #E8EDF2',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transform: 'translateY(-3px)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #70C1B3 0%, #A0D8D0 100%)',
                }
              }}>
                <CardContent sx={{ p: 2.5, pb: '16px !important', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ 
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    opacity: 0.08,
                    zIndex: 0
                  }}>
                    <TrendingUpIcon sx={{ fontSize: '56px', color: '#70C1B3' }} />
                  </Box>
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#78909C',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                        letterSpacing: '0.5px'
                      }}
                    >
                      TODAY PTP
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#2C3E50',
                        fontSize: '1.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      ₹96,943
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Today Collection */}
            <Grid item xs={6} sm={4} md={3} lg={2}>
              <Card sx={{ 
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                background: '#FFFFFF',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #E8EDF2',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transform: 'translateY(-3px)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #64B5F6 0%, #90CAF9 100%)',
                }
              }}>
                <CardContent sx={{ p: 2.5, pb: '16px !important', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ 
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    opacity: 0.08,
                    zIndex: 0
                  }}>
                    <AccountBalanceIcon sx={{ fontSize: '56px', color: '#64B5F6' }} />
                  </Box>
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#78909C',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                        letterSpacing: '0.5px'
                      }}
                    >
                      TODAY COLLECTION
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#2C3E50',
                        fontSize: '1.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      ₹64,691
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Yet To Collect Today */}
            <Grid item xs={6} sm={4} md={3} lg={2}>
              <Card sx={{ 
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                background: '#FFFFFF',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #E8EDF2',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transform: 'translateY(-3px)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #E57373 0%, #EF9A9A 100%)',
                }
              }}>
                <CardContent sx={{ p: 2.5, pb: '16px !important', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ 
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    opacity: 0.08,
                    zIndex: 0
                  }}>
                    <WarningIcon sx={{ fontSize: '56px', color: '#E57373' }} />
                  </Box>
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#78909C',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                        letterSpacing: '0.5px'
                      }}
                    >
                      YET TO COLLECT TODAY
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#2C3E50',
                        fontSize: '1.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      ₹32,252
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Team Wise Collection Report */}
          <Paper sx={{ 
            p: 0, 
            mb: 3, 
            borderRadius: 1, 
            overflow: 'hidden', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            width: '100%'
          }}>
            <Box sx={{ 
              p: 1.5, 
              background: '#fff',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <PeopleIcon sx={{ color: '#424242', fontSize: '1.25rem' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#424242', fontSize: '0.95rem' }}>
                Team Wise Collection Report
              </Typography>
            </Box>
            <Box sx={{ 
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#BDBDBD',
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: '#9E9E9E',
                }
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#F5F5F5',
              }
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0' }}>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      color: '#424242',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Team</th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      color: '#424242',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Process</th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      color: '#424242',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Target</th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      color: '#424242',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Total Collected</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#fff', borderBottom: '1px solid #F0F0F0', transition: 'all 0.2s ease' }} 
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '12px 16px', color: '#212121', fontSize: '0.875rem', fontWeight: 600 }}>SEKARTHAR</td>
                    <td style={{ padding: '12px 16px', color: '#616161', fontSize: '0.875rem' }}>SMFG-FIELD</td>
                    <td style={{ padding: '12px 16px', color: '#424242', fontSize: '0.875rem', fontWeight: 500 }}>₹850,000</td>
                    <td style={{ padding: '12px 16px', color: '#424242', fontSize: '0.875rem', fontWeight: 500 }}>₹0</td>
                  </tr>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#FAFAFA'}>
                    <td style={{ padding: '12px 16px', color: '#212121', fontSize: '0.875rem', fontWeight: 600 }}>YASODHA</td>
                    <td style={{ padding: '12px 16px', color: '#616161', fontSize: '0.875rem' }}>ROBI-KOTK</td>
                    <td style={{ padding: '12px 16px', color: '#424242', fontSize: '0.875rem', fontWeight: 500 }}>₹500,000</td>
                    <td style={{ padding: '12px 16px', color: '#424242', fontSize: '0.875rem', fontWeight: 500 }}>₹25,544</td>
                  </tr>
                  <tr style={{ background: '#fff', borderBottom: '1px solid #F0F0F0', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '12px 16px', color: '#212121', fontSize: '0.875rem', fontWeight: 600 }}>YASODHA</td>
                    <td style={{ padding: '12px 16px', color: '#616161', fontSize: '0.875rem' }}>DMI</td>
                    <td style={{ padding: '12px 16px', color: '#424242', fontSize: '0.875rem', fontWeight: 500 }}>₹100,000</td>
                    <td style={{ padding: '12px 16px', color: '#424242', fontSize: '0.875rem', fontWeight: 500 }}>₹4,896</td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Paper>

          {/* Original Summary Cards - Keep for data display */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={6} md={3}>
              <Card sx={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#FFAB40', mr: 1.5, width: 36, height: 36 }}>
                      <PeopleIcon sx={{ fontSize: '1.2rem' }} />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem' }}>
                        Total Customers
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#FFAB40', fontWeight: 600, fontSize: '1rem' }}>
                    {isLoading ? <Skeleton width={40} /> : stats?.summary?.totalCustomers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 1.5, width: 36, height: 36 }}>
                  <TrendingUpIcon sx={{ fontSize: '1.2rem' }} />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem' }}>
                    Active Customers
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {isLoading ? <Skeleton width={40} /> : stats?.summary?.activeCustomers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 1.5, width: 36, height: 36 }}>
                  <WarningIcon sx={{ fontSize: '1.2rem' }} />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem' }}>
                    Overdue Customers
                  </Typography>
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {isLoading ? <Skeleton width={40} /> : stats?.summary?.overdueCustomers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 1.5, width: 36, height: 36 }}>
                  <AccountBalanceIcon sx={{ fontSize: '1.2rem' }} />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="caption" sx={{ fontSize: '0.7rem' }}>
                    NPA Customers
                  </Typography>
                  <Typography variant="h6" color="error.main" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {isLoading ? <Skeleton width={40} /> : stats?.summary?.npaCustomers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Financial Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" gutterBottom color="primary" sx={{ fontSize: '0.875rem' }}>
                Total Sanction Amount
              </Typography>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                {isLoading ? (
                  <Skeleton width={120} />
                ) : (
                  formatCurrency(stats?.summary?.totalSanctionAmount)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" gutterBottom color="primary" sx={{ fontSize: '0.875rem' }}>
                Total Overdue Amount
              </Typography>
              <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                {isLoading ? (
                  <Skeleton width={120} />
                ) : (
                  formatCurrency(stats?.summary?.totalOverdueAmount)
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Customers by State Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 1.5, height: '100%', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Customers by State (All States)
            </Typography>
            {isLoading ? (
              <Skeleton height={350} />
            ) : stats?.customersByState?.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={stats.customersByState}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="_id" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="#1976d2"
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Customer Status Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 1.5, height: '100%', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Customer Status Distribution
            </Typography>
            {isLoading ? (
              <Skeleton height={220} />
            ) : stats?.summary ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: stats.summary.activeCustomers },
                      { name: 'Overdue', value: stats.summary.overdueCustomers },
                      { name: 'NPA', value: stats.summary.npaCustomers },
                      { 
                        name: 'Others', 
                        value: stats.summary.totalCustomers - stats.summary.activeCustomers - stats.summary.overdueCustomers - stats.summary.npaCustomers 
                      },
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.summary && [
                      { name: 'Active', value: stats.summary.activeCustomers },
                      { name: 'Overdue', value: stats.summary.overdueCustomers },
                      { name: 'NPA', value: stats.summary.npaCustomers },
                      { 
                        name: 'Others', 
                        value: stats.summary.totalCustomers - stats.summary.activeCustomers - stats.summary.overdueCustomers - stats.summary.npaCustomers 
                      },
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Customers */}
        <Grid item xs={12}>
          <Paper sx={{ p: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Recent Customers
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/customers')}
                sx={{ fontSize: '0.8rem' }}
              >
                View All
              </Button>
            </Box>
            {isLoading ? (
              <Box>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} height={60} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : stats?.recentCustomers?.length > 0 ? (
              <List>
                {stats.recentCustomers.map((customer, index) => (
                  <ListItem
                    key={customer.id}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {customer.accountName}
                          </Typography>
                          <Chip
                            label={customer.status}
                            size="small"
                            color={
                              customer.status === 'Active' ? 'success' :
                              customer.status === 'NPA' ? 'error' : 'default'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="body2" color="textSecondary">
                            Loan ID: {customer.loanId}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Sanction: {formatCurrency(customer.sanctionAmount)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Added: {dayjs(customer.createdAt).format('DD/MM/YYYY')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No recent customers found
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
        </>
      </DataLoadingState>
      </Box>
    </Box>
  );
};

export default Dashboard;
