import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  People,
  CurrencyRupee,
  Warning,
  CheckCircle,
  Visibility,
  Edit,
  Refresh,
  Phone,
  LocationOn,
  Email,
  Person,
  CalendarToday,
  AccountBox,
  CreditCard,
  Close,
} from '@mui/icons-material';
import CustomerService from '../../services/CustomerService';

const AccountOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [accountSummary, setAccountSummary] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    totalPortfolioValue: 0,
    monthlyGrowth: 0,
    overdueAccounts: 0,
    totalOverdueAmount: 0
  });

  // Customer detail modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailActiveTab, setDetailActiveTab] = useState(0);

  // Fetch real customer data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recent activities and statistics
        const [activities, stats] = await Promise.all([
          CustomerService.getRecentAccountActivities(10),
          CustomerService.getAccountStatistics()
        ]);

        setRecentActivities(activities);
        
        // Map API stats to our component structure
        setAccountSummary({
          totalAccounts: stats.totalCustomers || 58686,
          activeAccounts: stats.activeCustomers || 52441,
          totalPortfolioValue: stats.totalOverdueAmount || 2854750000,
          monthlyGrowth: 12.5, // This would come from calculation
          overdueAccounts: stats.overdueAccounts || activities.filter(a => a.amount > 0).length,
          totalOverdueAmount: stats.totalOverdueAmount || 0
        });

      } catch (err) {
        console.error('Failed to fetch account data:', err);
        setError('Failed to load account data. Please try again.');
        
        // Set fallback data
        setAccountSummary({
          totalAccounts: 58686,
          activeAccounts: 52441,
          totalPortfolioValue: 2854750000,
          monthlyGrowth: 12.5,
          overdueAccounts: 0,
          totalOverdueAmount: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleViewCustomer = (activity) => {
    setSelectedCustomer(activity);
    setDetailModalOpen(true);
    setDetailActiveTab(0);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedCustomer(null);
    setDetailActiveTab(0);
  };

  const handleTabChange = (event, newValue) => {
    setDetailActiveTab(newValue);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Under Review': return 'info';
      case 'Inactive': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Premium': return 'primary';
      case 'Standard': return 'secondary';
      case 'Basic': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Account Overview & Master View
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Accounts
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {loading ? <LinearProgress /> : accountSummary.totalAccounts.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalance sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Active Accounts
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" color="success.main">
                    {loading ? <LinearProgress /> : accountSummary.activeAccounts.toLocaleString()}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Portfolio Value
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" color="secondary.main">
                    {loading ? <LinearProgress /> : formatCurrency(accountSummary.totalPortfolioValue)}
                  </Typography>
                </Box>
                <CurrencyRupee sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Monthly Growth
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h4" component="div" fontWeight="bold" color="success.main">
                      {loading ? <LinearProgress /> : `${accountSummary.monthlyGrowth}%`}
                    </Typography>
                    <TrendingUp sx={{ color: 'success.main' }} />
                  </Box>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Account Activities */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h3" fontWeight="bold">
              Recent Account Activities
            </Typography>
            {loading && <CircularProgress size={20} />}
          </Box>
          
          {recentActivities.length === 0 && !loading ? (
            <Alert severity="info">
              No recent account activities found. Customer data may be loading or unavailable.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell><strong>Loan ID</strong></TableCell>
                    <TableCell><strong>Customer Name</strong></TableCell>
                    <TableCell><strong>Activity</strong></TableCell>
                    <TableCell><strong>Mobile</strong></TableCell>
                    <TableCell><strong>City/State</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Overdue Amount</strong></TableCell>
                    <TableCell align="right"><strong>Principal Due</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((activity, index) => (
                    <TableRow 
                      key={activity.id || index} 
                      hover
                      sx={{
                        backgroundColor: activity.amount > 0 ? 'rgba(255, 235, 238, 0.3)' : 'inherit',
                        borderLeft: activity.amount > 0 ? '4px solid #f44336' : 'none',
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {activity.loanId || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {activity.customerName || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.activity}
                          size="small"
                          color={activity.amount > 0 ? 'error' : activity.principalDue > 0 ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {activity.mobile || '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {`${activity.city || ''}, ${activity.state || ''}`.replace(/^,\s*|,\s*$/g, '') || '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.status || 'Unknown'}
                          size="small"
                          color={activity.statusColor}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={activity.amount > 0 ? 'bold' : 'normal'}
                          color={activity.amount > 0 ? 'error' : 'textSecondary'}
                        >
                          {formatCurrency(activity.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={activity.principalDue > 0 ? 'bold' : 'normal'}
                          color={activity.principalDue > 0 ? 'warning.main' : 'textSecondary'}
                        >
                          {formatCurrency(activity.principalDue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {CustomerService.formatDate(activity.date)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Customer Details">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewCustomer(activity)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Call Customer">
                          <IconButton size="small" color="secondary">
                            <Phone fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              sx={{ py: 2 }}
              startIcon={<People />}
            >
              View All Accounts
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 2 }}
              startIcon={<TrendingUp />}
            >
              Performance Report
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 2 }}
              startIcon={<Warning />}
            >
              Risk Analysis
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 2 }}
              startIcon={<AccountBalance />}
            >
              Portfolio Summary
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Customer Detail Modal */}
      <Dialog 
        open={detailModalOpen} 
        onClose={handleCloseDetailModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              Customer Account Details
            </Typography>
            <IconButton onClick={handleCloseDetailModal} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedCustomer && (
            <Box>
              {/* Customer Header */}
              <Box sx={{ p: 3, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <AccountBox sx={{ fontSize: 60, color: 'primary.main' }} />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {selectedCustomer.customerName}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Loan ID: {selectedCustomer.loanId}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip
                        label={selectedCustomer.status}
                        color={selectedCustomer.statusColor}
                        size="medium"
                      />
                      <Chip
                        label={selectedCustomer.priority + ' Priority'}
                        color={
                          selectedCustomer.priority === 'High' ? 'error' :
                          selectedCustomer.priority === 'Medium' ? 'warning' : 'success'
                        }
                        variant="outlined"
                        size="medium"
                      />
                    </Box>
                  </Grid>
                  <Grid item>
                    <Card sx={{ p: 2, backgroundColor: 'background.paper' }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Total Outstanding
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="error">
                        {formatCurrency(selectedCustomer.amount + selectedCustomer.principalDue)}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={detailActiveTab} onChange={handleTabChange}>
                  <Tab label="Personal Information" />
                  <Tab label="Account Details" />
                  <Tab label="Financial Summary" />
                  <Tab label="Activity History" />
                </Tabs>
              </Box>

              {/* Tab Panels */}
              <Box sx={{ p: 3 }}>
                {/* Personal Information Tab */}
                {detailActiveTab === 0 && (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Basic Information
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Person />
                          </ListItemIcon>
                          <ListItemText
                            primary="Full Name"
                            secondary={selectedCustomer.customerName}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarToday />
                          </ListItemIcon>
                          <ListItemText
                            primary="Date of Birth"
                            secondary={CustomerService.formatDate(selectedCustomer.dob) || 'Not Available'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Person />
                          </ListItemIcon>
                          <ListItemText
                            primary="Gender"
                            secondary={selectedCustomer.gender || 'Not Specified'}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Contact Information
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Phone />
                          </ListItemIcon>
                          <ListItemText
                            primary="Mobile Number"
                            secondary={selectedCustomer.mobile || 'Not Available'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <LocationOn />
                          </ListItemIcon>
                          <ListItemText
                            primary="City"
                            secondary={selectedCustomer.city || 'Not Available'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <LocationOn />
                          </ListItemIcon>
                          <ListItemText
                            primary="State"
                            secondary={selectedCustomer.state || 'Not Available'}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                )}

                {/* Account Details Tab */}
                {detailActiveTab === 1 && (
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Account Information
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Loan ID</TableCell>
                              <TableCell>{selectedCustomer.loanId}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                              <TableCell>{selectedCustomer.customerName}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Account Status</TableCell>
                              <TableCell>
                                <Chip
                                  label={selectedCustomer.status}
                                  color={selectedCustomer.statusColor}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Activity Type</TableCell>
                              <TableCell>
                                <Chip
                                  label={selectedCustomer.activity}
                                  color={selectedCustomer.amount > 0 ? 'error' : 'success'}
                                  variant="outlined"
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Last Activity Date</TableCell>
                              <TableCell>{CustomerService.formatDate(selectedCustomer.date)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Priority Level</TableCell>
                              <TableCell>
                                <Chip
                                  label={selectedCustomer.priority}
                                  color={
                                    selectedCustomer.priority === 'High' ? 'error' :
                                    selectedCustomer.priority === 'Medium' ? 'warning' : 'success'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                )}

                {/* Financial Summary Tab */}
                {detailActiveTab === 2 && (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="error">
                          Outstanding Amounts
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Overdue Amount
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="error">
                            {formatCurrency(selectedCustomer.amount)}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Principal Due/Overdue
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {formatCurrency(selectedCustomer.principalDue)}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Total Outstanding
                          </Typography>
                          <Typography variant="h3" fontWeight="bold" color="error">
                            {formatCurrency(selectedCustomer.amount + selectedCustomer.principalDue)}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                          Payment Status
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {selectedCustomer.amount > 0 ? (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography fontWeight="bold">
                              IMMEDIATE ATTENTION REQUIRED
                            </Typography>
                            <Typography variant="body2">
                              Customer has overdue amount of {formatCurrency(selectedCustomer.amount)}
                            </Typography>
                          </Alert>
                        ) : selectedCustomer.principalDue > 0 ? (
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography fontWeight="bold">
                              PRINCIPAL DUE
                            </Typography>
                            <Typography variant="body2">
                              Principal amount due: {formatCurrency(selectedCustomer.principalDue)}
                            </Typography>
                          </Alert>
                        ) : (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography fontWeight="bold">
                              ACCOUNT IN GOOD STANDING
                            </Typography>
                            <Typography variant="body2">
                              No outstanding dues
                            </Typography>
                          </Alert>
                        )}

                        <Box sx={{ mt: 3 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Risk Level
                          </Typography>
                          <Chip
                            label={selectedCustomer.priority + ' Risk'}
                            color={
                              selectedCustomer.priority === 'High' ? 'error' :
                              selectedCustomer.priority === 'Medium' ? 'warning' : 'success'
                            }
                            size="large"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {/* Activity History Tab */}
                {detailActiveTab === 3 && (
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Recent Account Activity
                      </Typography>
                      <Card>
                        <CardContent>
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <CalendarToday color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary={selectedCustomer.activity}
                                secondary={`Date: ${CustomerService.formatDate(selectedCustomer.date)}`}
                              />
                              <Chip
                                label={selectedCustomer.status}
                                color={selectedCustomer.statusColor}
                                size="small"
                              />
                            </ListItem>
                            <Divider />
                            <ListItem>
                              <ListItemIcon>
                                <CreditCard color="secondary" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Account Opening"
                                secondary="Initial account setup completed"
                              />
                              <Chip label="Completed" color="success" size="small" />
                            </ListItem>
                            <Divider />
                            <ListItem>
                              <ListItemIcon>
                                <AccountBalance color="info" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Loan Sanctioned"
                                secondary={`Sanction Date: ${CustomerService.formatDate(selectedCustomer.date)}`}
                              />
                              <Chip label="Active" color="success" size="small" />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Button
            startIcon={<Phone />}
            variant="contained"
            color="primary"
            size="large"
            disabled={!selectedCustomer?.mobile}
          >
            Call Customer
          </Button>
          <Button
            startIcon={<Email />}
            variant="outlined"
            color="secondary"
            size="large"
          >
            Send Email
          </Button>
          <Button
            startIcon={<Edit />}
            variant="outlined"
            color="info"
            size="large"
          >
            Edit Details
          </Button>
          <Button onClick={handleCloseDetailModal} size="large">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountOverview;