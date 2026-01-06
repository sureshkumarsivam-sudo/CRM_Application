import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Pagination,
  Stack,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import axios from 'axios';

const CustomersPageSimple = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const recordsPerPage = 50;

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
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN');
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

  // Calculate filtered statistics based on current customers array
  const calculateFilteredStats = (customersArray) => {
    if (!customersArray || customersArray.length === 0) {
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        totalSanctionAmount: 0,
        totalOverdueAmount: 0
      };
    }

    const totalCustomers = customersArray.length;
    const activeCustomers = customersArray.filter(customer => customer.status === 'Active').length;
    const totalSanctionAmount = customersArray.reduce((sum, customer) => {
      return sum + (Number(customer.sanctionAmount) || 0);
    }, 0);
    const totalOverdueAmount = customersArray.reduce((sum, customer) => {
      return sum + (Number(customer.totalOverDue) || 0);
    }, 0);

    return {
      totalCustomers,
      activeCustomers,
      totalSanctionAmount,
      totalOverdueAmount
    };
  };

  // Enhanced retry utility for network resilience
  const retryRequest = async (requestFn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        
        console.log(`Request failed, retrying in ${delay}ms... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  };

  // Load customers data with pagination and retry logic
  const loadCustomers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load customers with retry logic
      const customersResponse = await retryRequest(async () => {
        return await axios.get(`/api/customers?page=${page}&limit=${recordsPerPage}`, {
          timeout: 10000, // 10 second timeout
        });
      });
      
      console.log('Customers Response:', customersResponse.data);
      
      if (customersResponse.data && customersResponse.data.data) {
        setCustomers(customersResponse.data.data);
        setTotalRecords(customersResponse.data.pagination?.totalRecords || customersResponse.data.data.length);
        setRetryCount(0); // Reset retry count on success
      }

      // Load stats (only on first load) with retry logic
      if (page === 1) {
        try {
          const statsResponse = await retryRequest(async () => {
            return await axios.get('/api/customers/stats/dashboard', {
              timeout: 8000, // 8 second timeout
            });
          });
          
          console.log('Stats Response:', statsResponse.data);
          setStats(statsResponse.data || {});
        } catch (statsError) {
          console.log('Stats load failed (non-critical):', statsError);
          // Don't fail the whole load if stats fail
        }
      }

    } catch (err) {
      console.error('Load customers error:', err);
      
      // Enhanced error message based on error type
      let errorMessage = 'Failed to load customers';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
    setActiveTab(0);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedCustomer(null);
    setEditMode(false);
  };

  const handleEditCustomer = () => {
    setEditMode(true);
  };

  const handleSaveCustomer = async () => {
    try {
      // Here you would implement the save functionality
      console.log('Saving customer:', selectedCustomer);
      // await axios.put(`/api/customers/${selectedCustomer._id}`, selectedCustomer);
      setEditMode(false);
      // Refresh the customer list
      loadCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    loadCustomers(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load data on component mount
  useEffect(() => {
    loadCustomers(currentPage);
  }, []);

  // Auto-retry for network errors
  useEffect(() => {
    if (error && error.includes('Network') && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Auto-retry attempt ${retryCount + 1}/3`);
        setRetryCount(prev => prev + 1);
        loadCustomers(currentPage);
      }, 3000); // Wait 3 seconds before auto-retry

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, currentPage]);

  // Handle search with retry logic
  const handleSearch = async (searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1);
    
    if (searchValue.trim()) {
      // Search via API with retry logic
      try {
        setLoading(true);
        setError(null);
        
        const response = await retryRequest(async () => {
          return await axios.get(`/api/customers?search=${encodeURIComponent(searchValue)}&limit=100`, {
            timeout: 10000, // 10 second timeout
          });
        });
        
        if (response.data && response.data.data) {
          setCustomers(response.data.data);
          setTotalRecords(response.data.pagination?.totalRecords || response.data.data.length);
        }
      } catch (error) {
        console.error('Search error:', error);
        
        // Enhanced error message for search
        let errorMessage = 'Failed to search customers';
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          errorMessage = 'Search timed out. Please try a simpler search term.';
        } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          errorMessage = 'Network error during search. Please check your connection.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Reset to normal pagination
      loadCustomers(1);
    }
  };

  // For display purposes - when searching, show all results; when not searching, show current page
  const filteredCustomers = customers;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Customers...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we fetch your customer data
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>Error Loading Customers</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>{error}</Typography>
          {error.includes('Network') && (
            <Typography variant="body2" color="textSecondary">
              This usually resolves itself. Please check your connection and try again.
            </Typography>
          )}
        </Alert>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => loadCustomers(currentPage)}
            startIcon={<CircularProgress size={16} sx={{ display: loading ? 'block' : 'none' }} />}
            disabled={loading}
          >
            {loading ? 'Retrying...' : 'Retry'}
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => {
              setError(null);
              setCustomers([]);
              setSearchTerm('');
              setCurrentPage(1);
            }}
          >
            Reset
          </Button>
        </Box>
        
        {process.env.NODE_ENV === 'development' && (
          <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'gray' }}>
            Development tip: Check if both frontend (port 3002) and backend (port 5000) servers are running
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        Customer Management
      </Typography>
      
      {/* Stats Cards - Filtered Results */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Customers {searchTerm && '(Filtered)'}
              </Typography>
              <Typography variant="h4" color="primary">
                {calculateFilteredStats(customers).totalCustomers.toLocaleString()}
              </Typography>
              {searchTerm && (
                <Typography variant="caption" color="textSecondary">
                  Search: "{searchTerm}"
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Customers {searchTerm && '(Filtered)'}
              </Typography>
              <Typography variant="h4" color="success.main">
                {calculateFilteredStats(customers).activeCustomers.toLocaleString()}
              </Typography>
              {searchTerm && (
                <Typography variant="caption" color="textSecondary">
                  Active in results
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sanctions {searchTerm && '(Filtered)'}
              </Typography>
              <Typography variant="h4" color="info.main">
                {formatCurrency(calculateFilteredStats(customers).totalSanctionAmount)}
              </Typography>
              {searchTerm && (
                <Typography variant="caption" color="textSecondary">
                  Sum of filtered results
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overdue Amount {searchTerm && '(Filtered)'}
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(calculateFilteredStats(customers).totalOverdueAmount)}
              </Typography>
              {searchTerm && (
                <Typography variant="caption" color="textSecondary">
                  Sum of filtered overdue
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search customers by name, loan ID, email, or phone..."
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            if (value === '') {
              handleSearch('');
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchTerm);
            }
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            endAdornment: searchTerm && (
              <Button 
                size="small" 
                onClick={() => {
                  setSearchTerm('');
                  handleSearch('');
                }}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                Clear
              </Button>
            ),
          }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          💡 Press Enter to search or clear to reset
        </Typography>
      </Paper>

      {/* Results Info */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Showing {filteredCustomers.length} of {customers.length} customers on page {currentPage}
          {searchTerm && ` matching "${searchTerm}"`}
          {!searchTerm && (
            <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
              (Total: {totalRecords.toLocaleString()} records)
            </Typography>
          )}
        </Typography>
        {!searchTerm && (
          <Typography variant="body2" color="textSecondary">
            Page {currentPage} of {Math.ceil(totalRecords / recordsPerPage)}
          </Typography>
        )}
      </Stack>

      {/* Customers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Loan ID</strong></TableCell>
              <TableCell><strong>Customer Name</strong></TableCell>
              <TableCell><strong>DOB</strong></TableCell>
              <TableCell><strong>Gender</strong></TableCell>
              <TableCell><strong>Mobile</strong></TableCell>
              <TableCell><strong>City</strong></TableCell>
              <TableCell><strong>State</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Overdue</strong></TableCell>
              <TableCell align="right"><strong>Principal Due/Overdue</strong></TableCell>
              <TableCell><strong>Sanction Date</strong></TableCell>
              <TableCell align="center"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    {searchTerm ? 'No customers found matching your search' : 'No customers available'}
                  </Typography>
                  {searchTerm && (
                    <Button onClick={() => setSearchTerm('')} sx={{ mt: 1 }}>
                      Clear Search
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer, index) => (
                <TableRow 
                  key={customer.id || customer._id || index}
                  sx={{
                    backgroundColor: customer.totalOverDue > 0 ? 'rgba(255, 235, 238, 0.3)' : 'inherit',
                    borderLeft: customer.totalOverDue > 0 ? '4px solid #f44336' : 'none',
                    '&:hover': {
                      backgroundColor: customer.totalOverDue > 0 ? 'rgba(255, 235, 238, 0.5)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <TableCell>{customer.loanId || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {customer.accountName || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(customer.dob)}</TableCell>
                  <TableCell>{customer.gender || '-'}</TableCell>
                  <TableCell>{customer.mobileNo || '-'}</TableCell>
                  <TableCell>{customer.city || '-'}</TableCell>
                  <TableCell>{customer.state || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={customer.status || 'Unknown'}
                      size="small"
                      color={getStatusColor(customer.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={customer.totalOverDue > 0 ? 'error' : 'textSecondary'}
                      fontWeight={customer.totalOverDue > 0 ? 'bold' : 'normal'}
                    >
                      {formatCurrency(customer.totalOverDue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={customer.principalDueOverdue > 0 ? 'warning.main' : 'textSecondary'}
                      fontWeight={customer.principalDueOverdue > 0 ? 'bold' : 'normal'}
                    >
                      {formatCurrency(customer.principalDueOverdue)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(customer.sanctionDate)}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(customer)}
                      sx={{ minWidth: 120 }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!searchTerm && totalRecords > recordsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Pagination 
              count={Math.ceil(totalRecords / recordsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 'bold',
                },
              }}
            />
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
              Records {((currentPage - 1) * recordsPerPage) + 1} - {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords.toLocaleString()}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Footer Info */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="textSecondary">
          💡 <strong>Legend:</strong> Rows with red highlight indicate customers with overdue payments
          {!searchTerm && (
            <>
              <br />
              📄 <strong>Pagination:</strong> Use the page controls above to navigate through all {totalRecords.toLocaleString()} customer records ({recordsPerPage} per page)
            </>
          )}
        </Typography>
      </Box>

      {/* Customer Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { 
            minHeight: '85vh',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 2,
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
            color: '#333',
            borderRadius: '12px 12px 0 0',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 32, color: '#1976d2' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#333' }}>
                  {selectedCustomer?.accountName || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Loan ID: {selectedCustomer?.loanId || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={selectedCustomer?.status || 'Unknown'}
              color={getStatusColor(selectedCustomer?.status)}
              variant="outlined"
              sx={{
                fontWeight: 'bold',
              }}
            />
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ background: 'transparent', pt: 3 }}>
          {selectedCustomer && (
            <Box>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)} 
                sx={{ 
                  mb: 3,
                  '& .MuiTab-root': {
                    fontWeight: 'bold',
                    fontSize: '1rem',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#667eea',
                    height: 3,
                  }
                }}
              >
                <Tab label="📊 Overview" />
                <Tab label="📞 Contact & Address" />
                <Tab label="💰 Loan Details" />
                <Tab label="💳 Payment Info" />
              </Tabs>

              {/* Tab 1: Overview */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      border: '1px solid #dee2e6',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#495057' }}>
                          👤 Basic Information
                        </Typography>
                        <List dense>
                          <ListItem sx={{ mb: 1 }}>
                            <ListItemIcon><PersonIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
                            <ListItemText 
                              primary={<Typography sx={{ color: '#6c757d', fontWeight: 'bold' }}>Customer Name</Typography>}
                              secondary={<Typography sx={{ color: '#495057', fontSize: '1.1rem', fontWeight: '500' }}>{selectedCustomer.accountName || 'N/A'}</Typography>}
                            />
                          </ListItem>
                          <ListItem sx={{ mb: 1 }}>
                            <ListItemIcon><BankIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
                            <ListItemText 
                              primary={<Typography sx={{ color: '#6c757d', fontWeight: 'bold' }}>Loan ID</Typography>}
                              secondary={<Typography sx={{ color: '#495057', fontSize: '1.1rem', fontWeight: '500' }}>{selectedCustomer.loanId || 'N/A'}</Typography>}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              {selectedCustomer.status === 'Active' ? <CheckIcon sx={{ color: '#28a745' }} /> : <WarningIcon sx={{ color: '#ffc107' }} />}
                            </ListItemIcon>
                            <ListItemText 
                              primary={<Typography sx={{ color: '#6c757d', fontWeight: 'bold' }}>Status</Typography>}
                              secondary={
                                <Chip 
                                  label={selectedCustomer.status || 'Unknown'} 
                                  size="small" 
                                  color={getStatusColor(selectedCustomer.status)}
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 'bold'
                                  }}
                                />
                              } 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                      border: '1px solid #bbdefb',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#495057' }}>
                          💰 Financial Summary
                        </Typography>
                        <List dense>
                          <ListItem sx={{ mb: 1 }}>
                            <ListItemText 
                              primary={<Typography sx={{ color: '#6c757d', fontWeight: 'bold' }}>Sanction Amount</Typography>}
                              secondary={
                                <Typography variant="h5" sx={{ color: '#28a745', fontWeight: 'bold' }}>
                                  {formatCurrency(selectedCustomer.sanctionAmount)}
                                </Typography>
                              } 
                            />
                          </ListItem>
                          <ListItem sx={{ mb: 1 }}>
                            <ListItemText 
                              primary={<Typography sx={{ color: '#6c757d', fontWeight: 'bold' }}>Outstanding Amount</Typography>}
                              secondary={
                                <Typography variant="h5" sx={{ color: '#007bff', fontWeight: 'bold' }}>
                                  {formatCurrency(selectedCustomer.outstandingAmount)}
                                </Typography>
                              } 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary={<Typography sx={{ color: '#6c757d', fontWeight: 'bold' }}>Overdue Amount</Typography>}
                              secondary={
                                <Typography 
                                  variant="h5" 
                                  sx={{ 
                                    color: selectedCustomer.totalOverDue > 0 ? "#dc3545" : "#28a745",
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {formatCurrency(selectedCustomer.totalOverDue)}
                                </Typography>
                              } 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Tab 2: Contact & Address */}
              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      border: '1px solid #dee2e6',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
                          📞 Contact Information
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><EmailIcon /></ListItemIcon>
                            <ListItemText 
                              primary="Email" 
                              secondary={selectedCustomer.email || 'N/A'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><PhoneIcon /></ListItemIcon>
                            <ListItemText 
                              primary="Mobile Number" 
                              secondary={selectedCustomer.mobileNo || 'N/A'} 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                      border: '1px solid #ffcc02',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
                          🏠 Address Details
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><LocationIcon /></ListItemIcon>
                            <ListItemText 
                              primary="City" 
                              secondary={selectedCustomer.city || 'N/A'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="State" 
                              secondary={selectedCustomer.state || 'N/A'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Country" 
                              secondary={selectedCustomer.country || 'N/A'} 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Tab 3: Loan Details */}
              {activeTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                      border: '1px solid #c8e6c9',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#495057', fontWeight: 'bold' }}>
                          💰 Loan Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={4}>
                            <Paper sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'rgba(255,255,255,0.8)',
                              border: '1px solid #e0e0e0',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
                            }}>
                              <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 'bold' }}>
                                📅 Sanction Date
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#495057', fontWeight: 'bold' }}>
                                {formatDate(selectedCustomer.sanctionDate)}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Paper sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'rgba(255,255,255,0.8)',
                              border: '1px solid #e0e0e0',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
                            }}>
                              <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 'bold' }}>
                                🚀 First Disbursement
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#495057', fontWeight: 'bold' }}>
                                {formatDate(selectedCustomer.firstDisbursementDate)}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Paper sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: 2,
                            }}>
                              <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 'bold' }}>
                                ⏰ Tenure (Months)
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#495057', fontWeight: 'bold' }}>
                                {selectedCustomer.tenure || 'N/A'}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Paper sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: 2,
                            }}>
                              <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 'bold' }}>
                                📈 Interest Rate
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#495057', fontWeight: 'bold' }}>
                                {selectedCustomer.interestRate ? `${selectedCustomer.interestRate}%` : 'N/A'}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Paper sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: 2,
                            }}>
                              <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 'bold' }}>
                                💳 EMI Amount
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#28a745', fontWeight: 'bold' }}>
                                {formatCurrency(selectedCustomer.emiAmount)}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Paper sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              background: 'rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: 2,
                            }}>
                              <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 'bold' }}>
                                🏷️ Product Type
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#495057', fontWeight: 'bold' }}>
                                {selectedCustomer.productType || 'N/A'}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Tab 4: Payment Information */}
              {activeTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      background: selectedCustomer.totalOverDue > 0 
                        ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)'
                        : 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                      border: selectedCustomer.totalOverDue > 0 ? '1px solid #ef5350' : '1px solid #66bb6a',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#495057', fontWeight: 'bold' }}>
                          💳 Payment Status
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><PaymentIcon /></ListItemIcon>
                            <ListItemText 
                              primary="Days Past Due" 
                              secondary={
                                <Typography 
                                  color={selectedCustomer.daysPastDue > 0 ? "error" : "success.main"}
                                  fontWeight="bold"
                                >
                                  {selectedCustomer.daysPastDue || 0} days
                                </Typography>
                              } 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Last Payment Date" 
                              secondary={formatDate(selectedCustomer.lastPaymentDate)} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Next Payment Due" 
                              secondary={formatDate(selectedCustomer.nextPaymentDate)} 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                      border: '1px solid #bbdefb',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#495057', fontWeight: 'bold' }}>
                          ℹ️ Additional Information
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Branch Code" 
                              secondary={selectedCustomer.branchCode || 'N/A'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Account Type" 
                              secondary={selectedCustomer.accountType || 'N/A'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Created Date" 
                              secondary={formatDate(selectedCustomer.createdAt)} 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderTop: '1px solid #dee2e6',
          borderRadius: '0 0 12px 12px',
        }}>
          <Button 
            onClick={handleCloseDetails} 
            variant="outlined" 
            size="large"
            sx={{
              color: '#495057',
              borderColor: '#6c757d',
              '&:hover': {
                borderColor: '#495057',
                backgroundColor: 'rgba(108, 117, 125, 0.1)'
              }
            }}
          >
            Close
          </Button>
          {!editMode ? (
            <Button 
              variant="contained" 
              size="large"
              onClick={handleEditCustomer}
              sx={{
                backgroundColor: '#007bff',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#0056b3'
                }
              }}
            >
              ✏️ Edit Customer
            </Button>
          ) : (
            <>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => setEditMode(false)}
                sx={{
                  color: '#6c757d',
                  borderColor: '#6c757d',
                  '&:hover': {
                    borderColor: '#495057',
                    backgroundColor: 'rgba(108, 117, 125, 0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleSaveCustomer}
                sx={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#45a049'
                  }
                }}
              >
                💾 Save Changes
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersPageSimple;