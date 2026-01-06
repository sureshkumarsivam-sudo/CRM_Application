import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import CustomerService from '../../services/CustomerService';
import StatusCodeService from '../../services/StatusCodeService';
import TimelineCollapse from './TimelineCollapse';
import FeedbackDialog from './FeedbackDialog';
import EditFeedbackDialog from './EditFeedbackDialog';
import FeedbackService from '../../services/FeedbackService';
import AccountChangesAudit from './AccountChangesAudit';
import PaymentHistoryAudit from './PaymentHistoryAudit';

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [statusCode, setStatusCode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [promiseAmount, setPromiseAmount] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [timelineKey, setTimelineKey] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Dynamic status codes from database
  const [statusCodes, setStatusCodes] = useState([]);
  const [loadingStatusCodes, setLoadingStatusCodes] = useState(false);

  useEffect(() => {
    fetchAccountDetails();
    fetchStatusCodes();
  }, [id]);

  const fetchStatusCodes = async () => {
    try {
      setLoadingStatusCodes(true);
      const codes = await StatusCodeService.getFormattedStatusCodes('CALLER');
      setStatusCodes(codes);
    } catch (error) {
      console.error('Failed to load status codes:', error);
      // Fallback to default codes if API fails
      setStatusCodes([
        { value: 'NC', label: 'NC - Not Connected' },
        { value: 'RNR', label: 'RNR - Ringing No Response' },
        { value: 'CB', label: 'CB - Customer Busy' },
        { value: 'PDC', label: 'PDC - Promise to Pay Confirmed' },
        { value: 'PTP', label: 'PTP - Promise to Pay' },
      ]);
    } finally {
      setLoadingStatusCodes(false);
    }
  };

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CustomerService.getCustomerById(id);
      console.log('Fetched account data:', data);
      
      // Ensure _id is set (use the URL id parameter if _id is missing)
      if (!data._id && id) {
        data._id = id;
        console.log('Added missing _id from URL parameter:', id);
      }
      
      setAccount(data);
      
      // Load feedback history from backend
      if (data._id) {
        console.log('Fetching feedback for customer ID:', data._id);
        const feedbackResponse = await FeedbackService.getFeedbackByCustomerId(data._id);
        console.log('Feedback response:', feedbackResponse);
        setFeedbackHistory(feedbackResponse.data || []);
      } else {
        console.error('Account data missing _id field:', data);
      }
    } catch (err) {
      console.error('Failed to fetch account details:', err);
      setError('Failed to load account details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBackToAccounts = () => {
    navigate('/accounts');
  };

  const handleAddFeedback = async () => {
    if (!statusCode || !remarks.trim()) {
      alert('Please select a status code and enter remarks');
      return;
    }

    // Validate account data
    if (!account || !account._id) {
      console.error('Account data missing:', account);
      alert('Account information is not loaded. Please refresh the page.');
      return;
    }

    try {
      const selectedStatus = statusCodes.find(s => s.value === statusCode);
      
      // Ensure we have a valid loanId (try multiple possible field names)
      const loanId = account.loanId || account.loan_id || account.accountNumber || account.loanAccountNumber || 'N/A';
      
      console.log('Account object:', account);
      console.log('Using loanId:', loanId);
      
      const feedbackData = {
        customerId: account._id,
        loanId: loanId,
        statusCode: statusCode,
        statusLabel: selectedStatus?.label || statusCode,
        remarks: remarks.trim(),
        activityType: 'Feedback',
        createdBy: 'Current User', // Replace with actual user from auth
        userRole: 'Admin' // Replace with actual role from auth
      };

      // Add optional fields if provided
      if (followUpDate) {
        feedbackData.followUpDate = followUpDate;
      }
      if (promiseAmount && promiseAmount.trim()) {
        feedbackData.promiseAmount = parseFloat(promiseAmount);
      }

      console.log('Submitting feedback data:', feedbackData);
      const response = await FeedbackService.createFeedback(feedbackData);
      console.log('Feedback created successfully:', response);

      // Refresh feedback history
      const updatedFeedback = await FeedbackService.getFeedbackByCustomerId(account._id);
      console.log('Updated feedback history:', updatedFeedback);
      setFeedbackHistory(updatedFeedback.data || []);
      
      setStatusCode('');
      setRemarks('');
      setFollowUpDate('');
      setPromiseAmount('');
      setTimelineKey(prev => prev + 1); // Force refresh TimelineCollapse
      alert('Feedback added successfully!');
    } catch (err) {
      console.error('Failed to add feedback:', err);
      console.error('Error details:', err.response?.data || err.message);
      alert('Failed to add feedback. Please try again.');
    }
  };

  const handleFeedbackSuccess = () => {
    // Refresh feedback history after dialog submission
    if (account && account._id) {
      FeedbackService.getFeedbackByCustomerId(account._id)
        .then(response => {
          setFeedbackHistory(response.data || []);
          setTimelineKey(prev => prev + 1);
        })
        .catch(err => console.error('Failed to refresh feedback:', err));
    }
  };

  const handleEditFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    handleFeedbackSuccess();
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return `₹${parseFloat(value).toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#FFAB40' }} />
      </Box>
    );
  }

  if (error || !account) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Account not found'}</Alert>
        <Button 
          onClick={handleBackToAccounts} 
          sx={{ 
            mt: 2,
            background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #FB8C00 0%, #FFAB40 100%)',
            }
          }}
        >
          Back to Accounts
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      {/* Header */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBackToAccounts}
        sx={{
          mb: 2,
          background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)',
          color: '#1A237E',
          '&:hover': { 
            background: 'linear-gradient(135deg, #FB8C00 0%, #FFAB40 100%)'
          },
          borderRadius: '8px',
          textTransform: 'none',
          px: 3,
        }}
      >
        Back to Accounts
      </Button>

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#1A237E' }}>
        Account Details
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#1A237E' }}>
        Account: {account.loanId} - {account.accountName}
      </Typography>

      {/* Timeline/Feedback History */}
      {account && <TimelineCollapse key={timelineKey} customerId={account._id} loanId={account.loanId} onRefresh={handleFeedbackSuccess} onEditFeedback={handleEditFeedback} />}

      <Paper sx={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: '2px solid #FFE0B2',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '15px',
              color: '#1A237E',
            },
            '& .Mui-selected': {
              color: '#FFAB40 !important',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#FFAB40',
              height: '3px',
            },
          }}
        >
          <Tab label="Loan Details" />
          <Tab label="Personal Info" />
          <Tab label="Contact Info" />
          <Tab label="References" />
          <Tab label="History" />
          <Tab label="Relationship" />
          <Tab label="Account Changes" />
          <Tab label="Payment History" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Loan Details Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#1A237E', mb: 3, fontWeight: 600 }}>
                Loan Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Loan Account Number
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.loanId || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Customer Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.accountName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Product Type
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.productType || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Total Outstanding
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.totalOutstanding)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Principal Outstanding
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.principalOutstanding)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Interest Charges
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.interestCharges)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Other Charges
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.otherCharges)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Loan Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.loanAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Rate of Interest
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.rateOfInterest ? `${account.rateOfInterest}%` : 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Tenure
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.tenure ? `${account.tenure} months` : 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.emiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Total Repayable Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.totalRepayableAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Paid EMI Count
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.paidEmiCount || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Paid EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.paidEmiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Pending EMI Count
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.pendingEmiCount || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Pending EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.pendingEmiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Sanction Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatDate(account.sanctionDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Sanction Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.sanctionAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Disbursement Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatDate(account.disbursementDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Disbursement Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.disbursementAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    EMI Start Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatDate(account.emiStartDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Maturity Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatDate(account.maturityDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Last Payment Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatDate(account.lastPaymentDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Last Paid Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.lastPaidAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    DPD Bucket
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.dpdBucket || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Date of NPA
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatDate(account.dateOfNpa)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Account Status
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.accountStatus || 'N/A'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Personal Info Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#1A237E', mb: 3, fontWeight: 600 }}>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Father Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.fatherName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Mother Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.motherName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Spouse Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.spouseName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Date of Birth
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatDate(account.dob)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Gender
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.gender || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    PAN Number
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.pan || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Aadhaar Number
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.aadhaarNumber || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Voter ID Number
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.voterId || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Driving Licence Number
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.drivingLicence || 'N/A'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Contact Info Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#1A237E', mb: 3, fontWeight: 600 }}>
                Contact Information
              </Typography>

              {/* Resident Information Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                  📍 Resident Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Registered Mobile
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.registeredMobile || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Alternate Mobile
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.alternateMobile || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Email ID
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.emailId || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Residential Address
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.residentialAddress || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Location
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.location || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Pin Code
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.pinCode || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      State
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.state || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Working Information Section */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                  💼 Working Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Designation
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.designation || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Employer Name
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.employerName || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Employer Address
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.employerAddress || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Employer Location
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.employerLocation || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Employer Pin Code
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.employerPin || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Employer State
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.employerState || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Official Email ID
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.officialMailId || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Occupation Type
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.occupationType || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Employment Job Sector
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.employmentJobSector || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}

          {/* References Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#1A237E', mb: 3, fontWeight: 600 }}>
                References & Guarantor Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Father Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.fatherName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Mother Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.motherName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Spouse Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.spouseName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Alternate Mobile
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.alternateMobile || 'N/A'}</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic', color: '#999' }}>
                Additional reference details not available in current dataset.
              </Typography>
            </Box>
          )}

          {/* History Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#1A237E', mb: 3, fontWeight: 600 }}>
                Repayment & Charges History
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Paid EMI Count
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.paidEmiCount || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Paid EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.paidEmiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Pending EMI Count
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{account.pendingEmiCount || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Pending EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.pendingEmiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Last Payment Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatDate(account.lastPaymentDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Last Paid Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.lastPaidAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Interest Charges
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.interestCharges)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                    Other Charges
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                    <Typography>{formatCurrency(account.otherCharges)}</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic', color: '#999' }}>
                Detailed payment history table not available in current dataset.
              </Typography>
            </Box>
          )}

          {/* Relationship Tab */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#1A237E', mb: 3, fontWeight: 600 }}>
                Relationship Management
              </Typography>

              {/* Team & Assignments */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                  👥 Team & Assignments
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Allocation
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.allocation || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Caller Name
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.callerName || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Team Leader
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.teamLeader || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Manager
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.manager || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Account Status & Risk */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                  ⚠️ Account Status & Risk
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Account Status
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.accountStatus || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      DPD/Bucket
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.dpdBucket || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Date of NPA
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{formatDate(account.dateOfNpa)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Settlement Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                  💰 Settlement Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Settlement Type
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.settlementType || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Settlement Amount
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{formatCurrency(account.settlementAmount)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Installments
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.installments || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Paid Amount
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{formatCurrency(account.paidAmount)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Settlement Status
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.settlementStatus || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Field Visit Details */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                  🚗 Field Visit Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Last Field Visited Date
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{formatDate(account.lastFieldVisitedDate)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Field Status Codes
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.fieldStatusCodes || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: '#1A237E', fontWeight: 600 }}>
                      Field Remarks
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#FFF8E1', borderRadius: '4px' }}>
                      <Typography>{account.fieldRemarks || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}

          {/* Account Changes Audit Tab */}
          {activeTab === 6 && account && (
            <AccountChangesAudit accountId={account._id} loanId={account.loanId} />
          )}

          {/* Payment History Audit Tab */}
          {activeTab === 7 && account && (
            <PaymentHistoryAudit accountId={account._id} loanId={account.loanId} />
          )}
        </Box>
      </Paper>

      {/* Edit Feedback Dialog */}
      <EditFeedbackDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        feedback={selectedFeedback}
        onSuccess={handleEditSuccess}
      />
    </Box>
  );
};

export default AccountDetails;







