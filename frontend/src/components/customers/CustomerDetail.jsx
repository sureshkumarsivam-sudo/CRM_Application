import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Alert,
  Skeleton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,

  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  AccountBalanceWallet as WalletIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import dayjs from 'dayjs';

import { useCustomer } from '../../hooks/useCustomers';

// Tab panel component
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useCustomer(id);
  const [activeTab, setActiveTab] = useState(0);

  const customer = data?.data;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : '-';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'NPA': return 'error';
      case 'Closed': return 'default';
      default: return 'info';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton height={60} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Skeleton height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading customer: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Customer not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/customers')}
          variant="outlined"
        >
          Back to Customers
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            {customer.accountName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" color="textSecondary">
              Loan ID: {customer.loanId}
            </Typography>
            <Chip
              label={customer.status}
              color={getStatusColor(customer.status)}
              variant="outlined"
            />
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/customers/${id}/edit`)}
        >
          Edit Customer
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ width: '100%', mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Overview" icon={<PersonIcon />} />
          <Tab label="Payment Details" icon={<PaymentIcon />} />
          <Tab label="Payment History" icon={<HistoryIcon />} />
          <Tab label="Timeline" icon={<AssignmentIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Panel 0: Overview */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h6">Personal Information</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                <ListItem>
                  <ListItemText
                    primary="Full Name"
                    secondary={customer.accountName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Date of Birth"
                    secondary={formatDate(customer.dob)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Gender"
                    secondary={customer.gender}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="PAN"
                    secondary={customer.pan || '-'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Aadhaar Number"
                    secondary={customer.aadhaarNumber || '-'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Nationality"
                    secondary={customer.nationality}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Education Level"
                    secondary={customer.educationLevel || '-'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <PhoneIcon />
                </Avatar>
                <Typography variant="h6">Contact Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone Number"
                    secondary={customer.phoneNo}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mobile Number"
                    secondary={customer.mobileNo}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={customer.email || '-'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Address"
                    secondary={customer.addressDetails}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="City"
                    secondary={customer.city}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="State"
                    secondary={customer.state}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="PIN Code"
                    secondary={customer.pin}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Employment Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Typography variant="h6">Employment Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Occupation"
                    secondary={customer.occupation || '-'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Profession"
                    secondary={customer.profession || '-'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Employer Type"
                    secondary={customer.employerType || '-'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Employer Name"
                    secondary={customer.employerName || '-'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Employer Address"
                    secondary={customer.employerAddress || '-'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Loan Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <AccountBalanceIcon />
                </Avatar>
                <Typography variant="h6">Loan Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Sanction Amount"
                    secondary={formatCurrency(customer.sanctionAmount)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Disbursement Amount"
                    secondary={formatCurrency(customer.disbursementAmount)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="EMI"
                    secondary={formatCurrency(customer.emi)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Tenure"
                    secondary={`${customer.tenure || 0} months`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Interest Rate"
                    secondary={`${customer.interestRate || 0}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Principal Due/Overdue"
                    secondary={formatCurrency(customer.principalDueOverDue)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Other Charges"
                    secondary={formatCurrency(customer.otherCharges)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Overdue"
                    secondary={
                      <Typography
                        color={customer.totalOverDue > 0 ? 'error' : 'textSecondary'}
                        fontWeight={customer.totalOverDue > 0 ? 'bold' : 'normal'}
                      >
                        {formatCurrency(customer.totalOverDue)}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Important Dates */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <CalendarIcon />
                </Avatar>
                <Typography variant="h6">Important Dates</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Sanction Date
                      </Typography>
                      <Typography variant="h6">
                        {formatDate(customer.sanctionDate)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Disbursement Date
                      </Typography>
                      <Typography variant="h6">
                        {formatDate(customer.disbursementDate)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        EMI Start Date
                      </Typography>
                      <Typography variant="h6">
                        {formatDate(customer.emiStartDate)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Maturity Date
                      </Typography>
                      <Typography variant="h6">
                        {formatDate(customer.maturityDate)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {customer.dateOfNPA && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                      <CardContent>
                        <Typography color="error" gutterBottom variant="body2">
                          Date of NPA
                        </Typography>
                        <Typography variant="h6" color="error">
                          {formatDate(customer.dateOfNPA)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information */}
        {(customer.team || customer.location || customer.parent) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {customer.team && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Team
                      </Typography>
                      <Typography variant="body1">
                        {customer.team}
                      </Typography>
                    </Grid>
                  )}
                  {customer.location && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {customer.location}
                      </Typography>
                    </Grid>
                  )}
                  {customer.parent && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Parent
                      </Typography>
                      <Typography variant="body1">
                        {customer.parent}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
        </Grid>
      </TabPanel>

      {/* Tab Panel 1: Payment Details */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* Payment Status Overview */}
          <Grid item xs={12}>
            <Card sx={{ 
              background: customer.totalOverDue > 0 
                ? 'linear-gradient(135deg, #ffebee 0%, #fff 100%)' 
                : 'linear-gradient(135deg, #e8f5e8 0%, #fff 100%)',
              border: customer.totalOverDue > 0 ? '2px solid #f44336' : '2px solid #4caf50'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: customer.totalOverDue > 0 ? 'error.main' : 'success.main', 
                    mr: 2,
                    width: 56,
                    height: 56
                  }}>
                    {customer.totalOverDue > 0 ? <WarningIcon fontSize="large" /> : <WalletIcon fontSize="large" />}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ 
                      color: customer.totalOverDue > 0 ? 'error.main' : 'success.main',
                      fontWeight: 'bold'
                    }}>
                      {customer.totalOverDue > 0 ? 'PAYMENT OVERDUE' : 'PAYMENT UP TO DATE'}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Current Payment Status
                    </Typography>
                  </Box>
                </Box>
                
                {customer.totalOverDue > 0 && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Outstanding Amount: {formatCurrency(customer.totalOverDue)}
                    </Typography>
                    <Typography variant="body2">
                      Immediate attention required for overdue payments
                    </Typography>
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(customer.sanctionAmount)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Sanction Amount
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(customer.disbursementAmount)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Disbursed Amount
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(customer.emi)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Monthly EMI
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ 
                      textAlign: 'center', 
                      p: 2,
                      bgcolor: customer.totalOverDue > 0 ? 'error.light' : 'success.light',
                      color: customer.totalOverDue > 0 ? 'error.contrastText' : 'success.contrastText'
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(customer.totalOverDue)}
                      </Typography>
                      <Typography variant="body2">
                        Total Overdue
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Payment Progress */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Loan Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={customer.disbursementAmount && customer.sanctionAmount 
                          ? (customer.disbursementAmount / customer.sanctionAmount) * 100 
                          : 0
                        }
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="textSecondary">
                        {customer.disbursementAmount && customer.sanctionAmount 
                          ? Math.round((customer.disbursementAmount / customer.sanctionAmount) * 100)
                          : 0
                        }%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Disbursement Progress
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Payment Breakdown */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PaymentIcon sx={{ mr: 1 }} />
                  Payment Breakdown
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Component</strong></TableCell>
                        <TableCell align="right"><strong>Amount</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Principal Due/Overdue</TableCell>
                        <TableCell align="right">
                          <Typography color={customer.principalDueOverDue > 0 ? 'error' : 'textPrimary'}>
                            {formatCurrency(customer.principalDueOverDue)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            size="small"
                            label={customer.principalDueOverDue > 0 ? 'Overdue' : 'Current'}
                            color={customer.principalDueOverDue > 0 ? 'error' : 'success'}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Other Charges</TableCell>
                        <TableCell align="right">
                          <Typography color={customer.otherCharges > 0 ? 'warning.main' : 'textPrimary'}>
                            {formatCurrency(customer.otherCharges)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            size="small"
                            label={customer.otherCharges > 0 ? 'Pending' : 'Clear'}
                            color={customer.otherCharges > 0 ? 'warning' : 'success'}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: customer.totalOverDue > 0 ? 'error.light' : 'success.light' }}>
                        <TableCell><strong>Total Outstanding</strong></TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color={customer.totalOverDue > 0 ? 'error' : 'success.main'}>
                            {formatCurrency(customer.totalOverDue)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={customer.totalOverDue > 0 ? 'ACTION REQUIRED' : 'UP TO DATE'}
                            color={customer.totalOverDue > 0 ? 'error' : 'success'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab Panel 2: Payment History */}
      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <HistoryIcon sx={{ mr: 1 }} />
              Payment History & Schedule
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Loan Details
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Tenure"
                          secondary={`${customer.tenure || 'N/A'} months`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Interest Rate"
                          secondary={`${customer.interestRate || 'N/A'}% per annum`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="EMI Amount"
                          secondary={formatCurrency(customer.emi)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="EMI Start Date"
                          secondary={formatDate(customer.emiStartDate)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Maturity Date"
                          secondary={formatDate(customer.maturityDate)}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Payment Summary
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Total Sanctioned"
                          secondary={formatCurrency(customer.sanctionAmount)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Amount Disbursed"
                          secondary={formatCurrency(customer.disbursementAmount)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Remaining Balance"
                          secondary={formatCurrency((customer.sanctionAmount || 0) - (customer.disbursementAmount || 0))}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Current Status"
                          secondary={
                            <Chip 
                              label={customer.status}
                              color={getStatusColor(customer.status)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Payment Schedule Preview */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Schedule Overview
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Based on EMI of {formatCurrency(customer.emi)} starting from {formatDate(customer.emiStartDate)}
                </Typography>
              </Alert>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Month</strong></TableCell>
                      <TableCell align="right"><strong>EMI Amount</strong></TableCell>
                      <TableCell align="center"><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Generate sample payment schedule */}
                    {Array.from({ length: Math.min(12, customer.tenure || 12) }, (_, index) => {
                      const isOverdue = index < 3 && customer.totalOverDue > 0; // Simulate some overdue payments
                      return (
                        <TableRow key={index} sx={{
                          backgroundColor: isOverdue ? 'error.light' : index % 2 === 0 ? 'grey.50' : 'white'
                        }}>
                          <TableCell>
                            EMI {index + 1}
                            <Typography variant="caption" display="block" color="textSecondary">
                              {customer.emiStartDate 
                                ? dayjs(customer.emiStartDate).add(index, 'month').format('MMM YYYY')
                                : '-'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color={isOverdue ? 'error' : 'textPrimary'}>
                              {formatCurrency(customer.emi)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={isOverdue ? 'OVERDUE' : index === 0 ? 'CURRENT' : 'UPCOMING'}
                              color={isOverdue ? 'error' : index === 0 ? 'warning' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab Panel 3: Timeline */}
      <TabPanel value={activeTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} />
              Customer Timeline
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Timeline>
              {/* Sanction */}
              {customer.sanctionDate && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <AccountBalanceIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Loan Sanctioned
                    </Typography>
                    <Typography color="textSecondary">
                      {formatDate(customer.sanctionDate)}
                    </Typography>
                    <Typography variant="body2">
                      Amount: {formatCurrency(customer.sanctionAmount)}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {/* Disbursement */}
              {customer.disbursementDate && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="success">
                      <WalletIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Amount Disbursed
                    </Typography>
                    <Typography color="textSecondary">
                      {formatDate(customer.disbursementDate)}
                    </Typography>
                    <Typography variant="body2">
                      Amount: {formatCurrency(customer.disbursementAmount)}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {/* EMI Start */}
              {customer.emiStartDate && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="info">
                      <PaymentIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      EMI Started
                    </Typography>
                    <Typography color="textSecondary">
                      {formatDate(customer.emiStartDate)}
                    </Typography>
                    <Typography variant="body2">
                      Monthly EMI: {formatCurrency(customer.emi)}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {/* NPA Date if exists */}
              {customer.dateOfNPA && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="error">
                      <WarningIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span" color="error">
                      NPA Classification
                    </Typography>
                    <Typography color="textSecondary">
                      {formatDate(customer.dateOfNPA)}
                    </Typography>
                    <Typography variant="body2" color="error">
                      Account classified as Non-Performing Asset
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {/* Last Contact */}
              {customer.lastContactDate && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="secondary">
                      <PhoneIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Last Contact
                    </Typography>
                    <Typography color="textSecondary">
                      {formatDate(customer.lastContactDate)}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {/* Next Follow-up */}
              {customer.nextFollowUpDate && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="warning">
                      <CalendarIcon />
                    </TimelineDot>
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Next Follow-up
                    </Typography>
                    <Typography color="textSecondary">
                      {formatDate(customer.nextFollowUpDate)}
                    </Typography>
                    <Chip 
                      size="small" 
                      label="Scheduled" 
                      color="warning" 
                      sx={{ mt: 1 }}
                    />
                  </TimelineContent>
                </TimelineItem>
              )}

              {/* Maturity Date */}
              {customer.maturityDate && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: 'grey.400' }}>
                      <TrendingUpIcon />
                    </TimelineDot>
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Loan Maturity
                    </Typography>
                    <Typography color="textSecondary">
                      {formatDate(customer.maturityDate)}
                    </Typography>
                    <Typography variant="body2">
                      Expected completion date
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
            </Timeline>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default CustomerDetail;