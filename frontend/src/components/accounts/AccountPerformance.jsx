import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  Timer,
  Money,
  Speed,
  Star,
  Refresh,
} from '@mui/icons-material';

const AccountPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [performanceData, setPerformanceData] = useState({});

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPerformanceData({
        revenue: {
          current: 285475000,
          previous: 268420000,
          growth: 6.3
        },
        collections: {
          current: 92.5,
          target: 95.0,
          efficiency: 97.4
        },
        newAccounts: {
          current: 1247,
          target: 1200,
          growth: 3.9
        },
        customerSatisfaction: {
          current: 4.2,
          target: 4.0,
          trend: 'up'
        }
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPerformanceColor = (current, target) => {
    if (current >= target) return 'success.main';
    if (current >= target * 0.9) return 'warning.main';
    return 'error.main';
  };

  const performanceMetrics = [
    {
      title: 'Revenue Performance',
      icon: <Money />,
      current: performanceData.revenue?.current,
      previous: performanceData.revenue?.previous,
      growth: performanceData.revenue?.growth,
      format: 'currency',
      color: 'primary'
    },
    {
      title: 'Collection Efficiency',
      icon: <Speed />,
      current: performanceData.collections?.current,
      target: performanceData.collections?.target,
      efficiency: performanceData.collections?.efficiency,
      format: 'percentage',
      color: 'success'
    },
    {
      title: 'New Accounts',
      icon: <TrendingUp />,
      current: performanceData.newAccounts?.current,
      target: performanceData.newAccounts?.target,
      growth: performanceData.newAccounts?.growth,
      format: 'number',
      color: 'secondary'
    },
    {
      title: 'Customer Satisfaction',
      icon: <Star />,
      current: performanceData.customerSatisfaction?.current,
      target: performanceData.customerSatisfaction?.target,
      trend: performanceData.customerSatisfaction?.trend,
      format: 'rating',
      color: 'warning'
    }
  ];

  const kpiData = [
    { label: 'Account Activation Rate', value: 89.5, target: 85, unit: '%' },
    { label: 'Average Account Value', value: 125000, target: 120000, unit: '₹' },
    { label: 'Retention Rate', value: 94.2, target: 90, unit: '%' },
    { label: 'Cross-sell Success', value: 23.8, target: 25, unit: '%' },
    { label: 'Processing Time', value: 2.3, target: 3.0, unit: 'days' },
    { label: 'Digital Adoption', value: 76.4, target: 70, unit: '%' }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Performance Metrics & KPIs
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Performance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {performanceMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" component="div" fontWeight="bold">
                    {metric.title}
                  </Typography>
                  <Box sx={{ color: `${metric.color}.main` }}>
                    {metric.icon}
                  </Box>
                </Box>
                
                {loading ? (
                  <LinearProgress />
                ) : (
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold" color={`${metric.color}.main`}>
                      {metric.format === 'currency' && formatCurrency(metric.current)}
                      {metric.format === 'percentage' && `${metric.current}%`}
                      {metric.format === 'number' && metric.current?.toLocaleString()}
                      {metric.format === 'rating' && `${metric.current}/5`}
                    </Typography>
                    
                    {metric.growth && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {metric.growth > 0 ? (
                          <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                        ) : (
                          <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                        )}
                        <Typography 
                          variant="body2" 
                          color={metric.growth > 0 ? 'success.main' : 'error.main'}
                        >
                          {metric.growth}% vs previous period
                        </Typography>
                      </Box>
                    )}
                    
                    {metric.target && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Target: {metric.format === 'percentage' ? `${metric.target}%` : metric.target}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* KPI Dashboard */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
          Key Performance Indicators
        </Typography>
        <Grid container spacing={3}>
          {kpiData.map((kpi, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {kpi.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="h5" 
                      component="div" 
                      fontWeight="bold"
                      color={getPerformanceColor(kpi.value, kpi.target)}
                    >
                      {kpi.unit === '₹' ? formatCurrency(kpi.value) : `${kpi.value}${kpi.unit}`}
                    </Typography>
                    <Chip
                      label={
                        kpi.value >= kpi.target 
                          ? `+${((kpi.value - kpi.target) / kpi.target * 100).toFixed(1)}%`
                          : `-${((kpi.target - kpi.value) / kpi.target * 100).toFixed(1)}%`
                      }
                      color={kpi.value >= kpi.target ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((kpi.value / kpi.target) * 100, 100)}
                    sx={{ 
                      mt: 2,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: kpi.value >= kpi.target ? 'success.main' : 'error.main'
                      }
                    }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Target: {kpi.unit === '₹' ? formatCurrency(kpi.target) : `${kpi.target}${kpi.unit}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Performance Trends */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
          Performance Trends Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Top Performing Areas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip label="Digital Adoption: 76.4% (Target: 70%)" color="success" />
                  <Chip label="Retention Rate: 94.2% (Target: 90%)" color="success" />
                  <Chip label="Collection Efficiency: 97.4%" color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Areas for Improvement
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip label="Cross-sell Success: 23.8% (Target: 25%)" color="warning" />
                  <Chip label="Processing Time: 2.3 days (Target: 3.0 days)" color="success" />
                  <Chip label="New Account Growth: Need Focus" color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AccountPerformance;