import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Analytics,
  GetApp,
  Visibility,
  TrendingUp,
  PieChart,
  BarChart,
  Assessment,
  DateRange,
  FilterList,
} from '@mui/icons-material';

const AccountAnalytics = () => {
  const [reportType, setReportType] = useState('summary');
  const [timeRange, setTimeRange] = useState('month');

  const analyticsData = [
    {
      category: 'Account Distribution',
      metrics: [
        { label: 'Premium Accounts', value: 12450, percentage: 21.2 },
        { label: 'Standard Accounts', value: 35680, percentage: 60.8 },
        { label: 'Basic Accounts', value: 10556, percentage: 18.0 }
      ]
    },
    {
      category: 'Geographic Distribution',
      metrics: [
        { label: 'Mumbai', value: 15670, percentage: 26.7 },
        { label: 'Delhi', value: 13480, percentage: 23.0 },
        { label: 'Bangalore', value: 11250, percentage: 19.2 },
        { label: 'Chennai', value: 8930, percentage: 15.2 },
        { label: 'Others', value: 9356, percentage: 15.9 }
      ]
    },
    {
      category: 'Age Group Analysis',
      metrics: [
        { label: '18-25 years', value: 8750, percentage: 14.9 },
        { label: '26-35 years', value: 18940, percentage: 32.3 },
        { label: '36-45 years', value: 16780, percentage: 28.6 },
        { label: '46-55 years', value: 10890, percentage: 18.6 },
        { label: '55+ years', value: 3326, percentage: 5.6 }
      ]
    }
  ];

  const reportTemplates = [
    {
      name: 'Monthly Account Summary',
      type: 'summary',
      description: 'Comprehensive monthly overview of all accounts',
      lastGenerated: '2024-10-20',
      frequency: 'Monthly'
    },
    {
      name: 'Performance Analytics',
      type: 'performance',
      description: 'KPI and performance metrics analysis',
      lastGenerated: '2024-10-19',
      frequency: 'Weekly'
    },
    {
      name: 'Customer Segmentation',
      type: 'segmentation',
      description: 'Account segmentation and behavioral analysis',
      lastGenerated: '2024-10-18',
      frequency: 'Quarterly'
    },
    {
      name: 'Risk Assessment Report',
      type: 'risk',
      description: 'Account risk analysis and portfolio health',
      lastGenerated: '2024-10-17',
      frequency: 'Monthly'
    },
    {
      name: 'Revenue Trend Analysis',
      type: 'revenue',
      description: 'Revenue patterns and growth analytics',
      lastGenerated: '2024-10-16',
      frequency: 'Monthly'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Analytics & Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Report Type"
            >
              <MenuItem value="summary">Summary</MenuItem>
              <MenuItem value="detailed">Detailed</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
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
            variant="contained"
            startIcon={<GetApp />}
            sx={{ borderRadius: 2 }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Analytics Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {analyticsData.map((section, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PieChart sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h3" fontWeight="bold">
                    {section.category}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {section.metrics.map((metric, idx) => (
                    <Box key={idx}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          {metric.label}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {metric.value.toLocaleString()} ({metric.percentage}%)
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: 8, 
                          backgroundColor: 'grey.200', 
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: `${metric.percentage}%`, 
                            height: '100%', 
                            backgroundColor: `hsl(${idx * 60}, 70%, 50%)`,
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Report Templates */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" component="h3" fontWeight="bold">
              Available Reports & Templates
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
              sx={{ borderRadius: 2 }}
            >
              Create Custom Report
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell><strong>Report Name</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Frequency</strong></TableCell>
                  <TableCell><strong>Last Generated</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportTemplates.map((report, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BarChart sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" fontWeight="bold">
                          {report.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {report.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.frequency}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {report.lastGenerated}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Report">
                        <IconButton size="small" color="primary">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small" color="secondary">
                          <GetApp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Analytics Insights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
              Key Insights
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      Growth Opportunity
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Premium account segment shows 23% growth potential in Mumbai and Delhi regions.
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Analytics sx={{ color: 'info.main', fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="bold" color="info.main">
                      Demographic Trend
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    26-35 age group represents 32.3% of accounts with highest engagement rates.
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <FilterList sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      Attention Required
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Basic account retention rate needs improvement - consider upgrade incentives.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
              Scheduled Reports
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { name: 'Weekly Performance Summary', nextRun: '2024-10-27', status: 'Active' },
                { name: 'Monthly Revenue Report', nextRun: '2024-11-01', status: 'Active' },
                { name: 'Quarterly Risk Assessment', nextRun: '2024-12-31', status: 'Scheduled' }
              ].map((schedule, index) => (
                <Card variant="outlined" key={index}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {schedule.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Next run: {schedule.nextRun}
                        </Typography>
                      </Box>
                      <Chip
                        label={schedule.status}
                        size="small"
                        color={schedule.status === 'Active' ? 'success' : 'info'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<DateRange />}
                fullWidth
                sx={{ mt: 2 }}
              >
                Schedule New Report
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountAnalytics;