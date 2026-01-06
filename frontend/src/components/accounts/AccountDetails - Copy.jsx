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
import TimelineCollapse from './TimelineCollapse';
import FeedbackDialog from './FeedbackDialog';
import EditFeedbackDialog from './EditFeedbackDialog';
import FeedbackService from '../../services/FeedbackService';

// ICICI-Inspired Color Theme
const theme = {
  primary: '#FF6B35', // Vibrant Orange
  secondary: '#FFA500', // Bright Orange
  accent: '#FFD700', // Golden Yellow
  danger: '#E63946', // Red
  success: '#06D6A0', // Teal Green
  warning: '#F4A261', // Light Orange
  dark: '#2D3142', // Dark Gray
  light: '#FFF8F0', // Cream White
  gradient: 'linear-gradient(135deg, #FFD700 0%, #FF6B35 50%, #E63946 100%)',
  cardGradient: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)',
  tabGradient: 'linear-gradient(135deg, #FFA500 0%, #FF6B35 100%)',
};

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

  // Status code options from the screenshot
  const statusCodes = [
    { value: 'NC', label: 'NC - Not Connected' },
    { value: 'RNR', label: 'RNR - Ringing No Response' },
    { value: 'CB', label: 'CB - Customer Busy' },
    { value: 'PDC', label: 'PDC - Promise to Pay Confirmed' },
    { value: 'PTP', label: 'PTP - Promise to Pay' },
    { value: 'NI', label: 'NI - Not Interested' },
    { value: 'SETTLEMENT', label: 'SETTLEMENT - Settlement Discussed' },
    { value: 'PAYMENT', label: 'PAYMENT - Payment Made' },
    { value: 'FIELD_VISIT', label: 'FIELD VISIT - Field Visit Required' },
    { value: 'BROKEN_PTP', label: 'BROKEN PTP - Promise Broken' },
    { value: 'LEGAL', label: 'LEGAL - Legal Action' },
  ];

  useEffect(() => {
    fetchAccountDetails();
  }, [id]);

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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        background: theme.cardGradient,
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: theme.primary }} size={60} />
          <Typography sx={{ mt: 2, color: theme.dark, fontWeight: 'bold', fontSize: '1.1rem' }}>
            ⏳ Loading account details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !account) {
    return (
      <Box sx={{ p: 3, background: theme.cardGradient, minHeight: '100vh' }}>
        <Alert severity="error" sx={{ 
          borderRadius: '15px',
          border: `2px solid ${theme.danger}`,
          mb: 3
        }}>
          {error || 'Account not found'}
        </Alert>
        <Button 
          onClick={handleBackToAccounts} 
          sx={{ 
            background: theme.gradient,
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '20px',
            px: 4,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
            }
          }}
        >
          ← Back to Accounts
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: theme.light, minHeight: '100vh' }}>
      {/* Header */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBackToAccounts}
        sx={{
          mb: 3,
          background: theme.gradient,
          color: 'white',
          '&:hover': { 
            background: theme.gradient,
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
          },
          borderRadius: '25px',
          textTransform: 'none',
          px: 4,
          py: 1.5,
          fontWeight: 'bold',
          fontSize: '1rem',
          transition: 'all 0.3s ease',
        }}
      >
        Back to Accounts
      </Button>

      <Box sx={{
        p: 2,
        background: theme.gradient,
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)',
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold', 
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        }}>
          📄 Account Details
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', fontSize: '1rem', fontWeight: '500' }}>
          Account: <strong>{account.loanId}</strong> - <strong>{account.accountName}</strong>
        </Typography>
      </Box>

      {/* Timeline/Feedback History */}
      {account && <TimelineCollapse key={timelineKey} customerId={account._id} loanId={account.loanId} onRefresh={handleFeedbackSuccess} onEditFeedback={handleEditFeedback} />}

      <Paper sx={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(255, 107, 53, 0.2)',
        border: `3px solid ${theme.secondary}`,
      }}>
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            background: theme.tabGradient,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: 'white',
              py: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            },
            '& .Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white',
              height: '4px',
            },
          }}
        >
          <Tab label="💳 Loan Details" />
          <Tab label="👤 Personal Info" />
          <Tab label="📞 Contact Info" />
          <Tab label="👥 References" />
          <Tab label="📜 History" />
          <Tab label="🤝 Relationship" />
          <Tab label="💬 Feedback" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Loan Details Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ 
                background: theme.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3, 
                fontWeight: 800,
                fontSize: '1.5rem',
              }}>
                💳 Loan Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Loan Account Number
                  </Typography>
                  <Box sx={{ 
                    mt: 1, 
                    p: 1.5, 
                    background: theme.cardGradient,
                    borderRadius: '12px',
                    border: `2px solid ${theme.secondary}`,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                  }}>
                    <Typography sx={{ fontWeight: '600', color: theme.dark }}>{account.loanId || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Customer Name
                  </Typography>
                  <Box sx={{ 
                    mt: 1, 
                    p: 1.5, 
                    background: theme.cardGradient,
                    borderRadius: '12px',
                    border: `2px solid ${theme.secondary}`,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                  }}>
                    <Typography sx={{ fontWeight: '600', color: theme.dark }}>{account.accountName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Product Type
                  </Typography>
                  <Box sx={{ 
                    mt: 1, 
                    p: 1.5, 
                    background: theme.cardGradient,
                    borderRadius: '12px',
                    border: `2px solid ${theme.secondary}`,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                  }}>
                    <Typography sx={{ fontWeight: '600', color: theme.dark }}>{account.productType || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Total Outstanding
                  </Typography>
                  <Box sx={{ 
                    mt: 1, 
                    p: 1.5, 
                    background: theme.cardGradient,
                    borderRadius: '12px',
                    border: `2px solid ${theme.danger}`,
                    boxShadow: '0 2px 8px rgba(230, 57, 70, 0.15)',
                  }}>
                    <Typography sx={{ fontWeight: 'bold', color: theme.danger, fontSize: '1.1rem' }}>{formatCurrency(account.totalOutstanding)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Principal Outstanding
                  </Typography>
                  <Box sx={{ 
                    mt: 1, 
                    p: 1.5, 
                    background: theme.cardGradient,
                    borderRadius: '12px',
                    border: `2px solid ${theme.secondary}`,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                  }}>
                    <Typography sx={{ fontWeight: '600', color: theme.dark }}>{formatCurrency(account.principalOutstanding)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Interest Charges
                  </Typography>
                  <Box sx={{ 
                    mt: 1, 
                    p: 1.5, 
                    background: theme.cardGradient,
                    borderRadius: '12px',
                    border: `2px solid ${theme.secondary}`,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                  }}>
                    <Typography sx={{ fontWeight: '600', color: theme.dark }}>{formatCurrency(account.interestCharges)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Other Charges
                  </Typography>
                  <Box sx={{ 
                    mt: 1, 
                    p: 1.5, 
                    background: theme.cardGradient,
                    borderRadius: '12px',
                    border: `2px solid ${theme.secondary}`,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                  }}>
                    <Typography sx={{ fontWeight: '600', color: theme.dark }}>{formatCurrency(account.otherCharges)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Loan Amount
                  </Typography>
                  <Box sx={{ 
                    mt: 1, 
                    p: 1.5, 
                    background: theme.cardGradient,
                    borderRadius: '12px',
                    border: `2px solid ${theme.secondary}`,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                  }}>
                    <Typography sx={{ fontWeight: '600', color: theme.dark }}>{formatCurrency(account.loanAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Rate of Interest
                  </Typography>
                  <Box sx={{ 
                    mt: 1, 
                    p: 1.5, 
                    background: theme.cardGradient,
                    borderRadius: '12px',
                    border: `2px solid ${theme.secondary}`,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                  }}>
                    <Typography sx={{ fontWeight: '600', color: theme.dark }}>{account.rateOfInterest ? `${account.rateOfInterest}%` : 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Tenure
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.tenure ? `${account.tenure} months` : 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.emiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Total Repayable Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.totalRepayableAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Paid EMI Count
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.paidEmiCount || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Paid EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.paidEmiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Pending EMI Count
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.pendingEmiCount || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Pending EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.pendingEmiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Sanction Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatDate(account.sanctionDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Sanction Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.sanctionAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Disbursement Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatDate(account.disbursementDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Disbursement Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.disbursementAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    EMI Start Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatDate(account.emiStartDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Maturity Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatDate(account.maturityDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Last Payment Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatDate(account.lastPaymentDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Last Paid Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.lastPaidAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    DPD Bucket
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.dpdBucket || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Date of NPA
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatDate(account.dateOfNpa)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Account Status
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.accountStatus || 'N/A'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Personal Info Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 3, fontWeight: 600 }}>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Father Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.fatherName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Mother Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.motherName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Spouse Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.spouseName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Date of Birth
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatDate(account.dob)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Gender
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.gender || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    PAN Number
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.pan || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Aadhaar Number
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.aadhaarNumber || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Voter ID Number
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.voterId || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Driving Licence Number
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.drivingLicence || 'N/A'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Contact Info Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 3, fontWeight: 600 }}>
                Contact Information
              </Typography>

              {/* Resident Information Section */}
              <Box sx={{ mb: 4, p: 2, background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)', borderRadius: '12px', border: '2px solid #FFA500', boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FF6B35', mb: 2 }}>
                  📍 Resident Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Registered Mobile
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.registeredMobile || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Alternate Mobile
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.alternateMobile || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Email ID
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.emailId || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Residential Address
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.residentialAddress || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Location
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.location || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Pin Code
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.pinCode || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      State
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.state || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Working Information Section */}
              <Box sx={{ p: 2, background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)', borderRadius: '12px', border: '2px solid #FFA500', boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FF6B35', mb: 2 }}>
                  💼 Working Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Designation
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.designation || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Employer Name
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.employerName || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Employer Address
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.employerAddress || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Employer Location
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.employerLocation || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Employer Pin Code
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.employerPin || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Employer State
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.employerState || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Official Email ID
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.officialMailId || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Occupation Type
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.occupationType || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Employment Job Sector
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
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
              <Typography variant="h6" sx={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 3, fontWeight: 600 }}>
                References & Guarantor Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Father Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.fatherName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Mother Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.motherName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Spouse Name
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.spouseName || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Alternate Mobile
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
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
              <Typography variant="h6" sx={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 3, fontWeight: 600 }}>
                Repayment & Charges History
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Paid EMI Count
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.paidEmiCount || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Paid EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.paidEmiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Pending EMI Count
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{account.pendingEmiCount || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Pending EMI Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.pendingEmiAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Last Payment Date
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatDate(account.lastPaymentDate)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Last Paid Amount
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.lastPaidAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Interest Charges
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                    <Typography>{formatCurrency(account.interestCharges)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                    Other Charges
                  </Typography>
                  <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
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
              <Typography variant="h6" sx={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 3, fontWeight: 600 }}>
                Relationship Management
              </Typography>

              {/* Team & Assignments */}
              <Box sx={{ mb: 3, p: 2, background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)', borderRadius: '12px', border: '2px solid #FFA500', boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FF6B35', mb: 2 }}>
                  👥 Team & Assignments
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Allocation
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.allocation || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Caller Name
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.callerName || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Team Leader
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.teamLeader || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Manager
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.manager || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Account Status & Risk */}
              <Box sx={{ mb: 3, p: 2, background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)', borderRadius: '12px', border: '2px solid #FFA500', boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FF6B35', mb: 2 }}>
                  ⚠️ Account Status & Risk
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Account Status
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.accountStatus || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      DPD/Bucket
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.dpdBucket || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Date of NPA
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{formatDate(account.dateOfNpa)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Settlement Details */}
              <Box sx={{ mb: 3, p: 2, background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)', borderRadius: '12px', border: '2px solid #FFA500', boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FF6B35', mb: 2 }}>
                  💰 Settlement Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Settlement Type
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.settlementType || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Settlement Amount
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{formatCurrency(account.settlementAmount)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Installments
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.installments || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Paid Amount
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{formatCurrency(account.paidAmount)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Settlement Status
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.settlementStatus || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Field Visit Details */}
              <Box sx={{ p: 2, background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)', borderRadius: '12px', border: '2px solid #FFA500', boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FF6B35', mb: 2 }}>
                  🚗 Field Visit Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Last Field Visited Date
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{formatDate(account.lastFieldVisitedDate)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Field Status Codes
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.fieldStatusCodes || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" sx={{ color: theme.dark, fontWeight: 600 }}>
                      Field Remarks
                    </Typography>
                    <Box sx={{ mt: 1, p: 1.5, background: theme.cardGradient, borderRadius: '12px', border: `2px solid ${theme.secondary}`, boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)' }}>
                      <Typography>{account.fieldRemarks || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}

          {/* Feedback Tab */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h5" sx={{ 
                background: theme.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3, 
                fontWeight: 800,
                fontSize: '1.8rem',
              }}>
                💬 Feedback
              </Typography>

              {/* Add Feedback Section */}
              <Box sx={{ 
                mb: 3, 
                p: 4, 
                background: theme.cardGradient,
                borderRadius: '20px',
                border: `3px solid ${theme.secondary}`,
                boxShadow: '0 8px 24px rgba(255, 107, 53, 0.15)',
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  color: theme.dark, 
                  mb: 3,
                  fontSize: '1.3rem',
                }}>
                  ✨ Add Feedback
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: theme.primary, fontWeight: 'bold' }}>Status Code: *</InputLabel>
                      <Select
                        value={statusCode}
                        onChange={(e) => setStatusCode(e.target.value)}
                        label="Status Code: *"
                        sx={{ 
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.secondary,
                            borderWidth: '2px',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.primary,
                          },
                        }}
                      >
                        <MenuItem value="">-- Select Status --</MenuItem>
                        {statusCodes.map((code) => (
                          <MenuItem key={code.value} value={code.value}>
                            {code.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Follow-up Date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& fieldset': {
                            borderColor: theme.secondary,
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: theme.primary,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.primary,
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Promise Amount"
                      placeholder="Enter amount"
                      value={promiseAmount}
                      onChange={(e) => setPromiseAmount(e.target.value)}
                      sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& fieldset': {
                            borderColor: theme.secondary,
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: theme.primary,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.primary,
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Remarks: *"
                      placeholder="Enter feedback remarks..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& fieldset': {
                            borderColor: theme.secondary,
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: theme.primary,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.primary,
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleAddFeedback}
                      sx={{
                        background: theme.gradient,
                        color: 'white',
                        '&:hover': { 
                          background: theme.gradient,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(255, 107, 53, 0.4)',
                        },
                        px: 5,
                        py: 1.5,
                        borderRadius: '25px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      ✅ Add Feedback
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Timeline (Feedback History) */}
              <Box sx={{ 
                p: 4, 
                background: theme.cardGradient,
                borderRadius: '20px',
                border: `3px solid ${theme.secondary}`,
                boxShadow: '0 8px 24px rgba(255, 107, 53, 0.15)',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.dark, mb: 3, fontSize: '1.3rem' }}>
                  📋 Timeline (Feedback History)
                </Typography>
                
                {feedbackHistory.length === 0 ? (
                  <Box sx={{ 
                    p: 4, 
                    background: 'white',
                    borderRadius: '15px', 
                    textAlign: 'center',
                    border: `2px dashed ${theme.secondary}`,
                  }}>
                    <Typography sx={{ color: theme.warning, fontSize: '1.1rem', fontWeight: '500' }}>
                      📭 No activities yet
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ 
                    backgroundColor: 'white', 
                    borderRadius: '15px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}>
                    <Table>
                      <TableHead sx={{ background: theme.tabGradient }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', py: 2 }}>📅 Date & Time</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', py: 2 }}>🎬 Activity Type</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', py: 2 }}>📊 Status</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', py: 2 }}>📝 Remarks</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', py: 2 }}>👤 Created By</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', py: 2 }} align="center">⚙️ Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feedbackHistory.map((item, index) => (
                          <TableRow key={item._id || index} sx={{
                            '&:hover': {
                              backgroundColor: theme.light,
                            },
                          }}>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                {new Date(item.createdAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: '500' }}>{item.activityType || 'Feedback'}</Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={item.statusLabel || item.statusCode}
                                size="medium"
                                sx={{
                                  background: theme.gradient,
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.85rem',
                                  px: 1,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: '500', color: theme.dark }}>{item.remarks}</Typography>
                              {item.followUpDate && (
                                <Typography variant="caption" sx={{ display: 'block', color: theme.primary, fontWeight: '600', mt: 0.5 }}>
                                  📅 Follow-up: {new Date(item.followUpDate).toLocaleDateString()}
                                </Typography>
                              )}
                              {item.promiseAmount && (
                                <Typography variant="caption" sx={{ display: 'block', color: theme.success, fontWeight: '600', mt: 0.5 }}>
                                  💰 Amount: ₹{item.promiseAmount.toLocaleString()}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.dark }}>{item.createdBy}</Typography>
                              {item.userRole && (
                                <Typography variant="caption" sx={{ color: theme.warning, fontWeight: '500' }}>
                                  ({item.userRole})
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditFeedback(item)}
                                sx={{
                                  color: theme.primary,
                                  background: theme.light,
                                  border: `2px solid ${theme.secondary}`,
                                  '&:hover': { 
                                    backgroundColor: theme.secondary,
                                    color: 'white',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Box>
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









