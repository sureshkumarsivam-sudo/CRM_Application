import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Collapse,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  List as ListIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import PTPPaymentService from '../../services/PTPPaymentService';

const PTPPaymentTracker = () => {
  // State for PTP payments data
  const [ptpPayments, setPTPPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'All Status',
    paymentDate: 'All Dates',
    callerName: 'All Callers',
    amAndTL: 'All Team Leaders',
    process: 'All Processes'
  });

  // Filter options - now includes actual process values from screenshot
  const [filterOptions, setFilterOptions] = useState({
    statuses: ['All Status', 'PTP', 'COLLECTED', 'PDC', 'PART-PAYMENT', 'W-SETT'],
    callerNames: ['All Callers'],
    teamLeaders: ['All Team Leaders'],
    processes: ['All Processes', 'ASREC', 'DMI', 'BOB-WOFF', 'KOTAK-WOFF', 'SMFG-FIELD']
  });

  // Summary statistics
  const [summary, setSummary] = useState({
    totalRecords: 0,
    todayPTP: 0,
    collected: 0,
    pending: 0,
    totalAmount: 0
  });

  // Search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Tab state for status segregation
  const [activeTab, setActiveTab] = useState(0); // 0 = Collected, 1 = Other Status, 2 = Reminders

  // Sorting state
  const [orderBy, setOrderBy] = useState('paymentDate');
  const [order, setOrder] = useState('desc');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    accountNumber: '',
    customerName: '',
    ptpAmount: '',
    status: 'PTP',
    paymentDate: new Date().toISOString().split('T')[0],
    callerName: '',
    contactNumber: '',
    amAndTL: '',
    process: ''
  });

  useEffect(() => {
    loadPTPPayments(); // This will load sample data if API returns no data
    loadFilterOptions();
    loadSummary();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, ptpPayments, searchQuery, activeTab]);

  const loadSampleDataFromCustomers = async () => {
    try {
      // Import CustomerService to get sample customer data
      const { default: CustomerService } = await import('../../services/CustomerService');
      const response = await CustomerService.getCustomers();
      const customers = response.data || [];
      
      // Create sample PTP payment records from first 15 customers with varied statuses
      const samplePTPPayments = customers.slice(0, 15).map((customer, index) => {
        const processes = ['ASREC', 'DMI', 'BOB-WOFF', 'KOTAK-WOFF', 'SMFG-FIELD'];
        const statuses = ['PTP', 'COLLECTED', 'PDC', 'PART-PAYMENT', 'W-SETT', 'PTP', 'COLLECTED', 'PTP'];
        const teamLeaders = ['SUMITHRA', 'SIVASANKARI', 'YASODHA', 'KESAVAN J'];
        const callers = ['DEEPAN KUMAR D', 'KOLAKALLUR VIDYA SAGAR', 'PONSELVAN A', 'RITHIK SINGH'];
        
        return {
          _id: `sample-${index}`,
          accountNumber: customer.loanId || `ACC${Math.floor(Math.random() * 100000)}`,
          customerName: customer.customerName || `Sample Customer ${index + 1}`, // Ensure customerName is always present
          ptpAmount: customer.currentOutstanding || Math.floor(Math.random() * 100000) + 10000,
          status: statuses[index % statuses.length],
          paymentDate: new Date(2025, 9, 30 - (index % 10)).toISOString(),
          contactNumber: customer.mobileNumber || `98${Math.floor(Math.random() * 100000000)}`,
          callerName: callers[index % callers.length],
          amAndTL: teamLeaders[index % teamLeaders.length],
          process: processes[index % processes.length]
        };
      });
      
      console.log('Sample PTP Payments generated with customer names:', samplePTPPayments.length);
      console.log('First sample record:', samplePTPPayments[0]); // Debug log
      setPTPPayments(samplePTPPayments);
    } catch (err) {
      console.error('Error loading sample data:', err);
    }
  };

  const loadPTPPayments = async () => {
    console.log('🔄 loadPTPPayments called at', new Date().toISOString());
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Calling API: /api/ptp-payments with limit=1000');
      const startTime = performance.now();
      
      const response = await PTPPaymentService.getPTPPayments({ limit: 1000 });
      
      const endTime = performance.now();
      console.log(`⏱️ API Response time: ${(endTime - startTime).toFixed(2)}ms`);
      
      console.log('📦 API Response:', {
        success: response.success,
        dataLength: response.data?.length || 0,
        totalRecords: response.pagination?.totalRecords || 0,
        timestamp: response.meta?.timestamp
      });
      
      const apiData = response.data || [];
      
      // Verify data structure
      if (apiData.length > 0) {
        const sampleRecord = apiData[0];
        console.log('✅ Sample Record from API:');
        console.log('   - Account Number:', sampleRecord.accountNumber);
        console.log('   - Customer Name:', sampleRecord.customerName);
        console.log('   - PTP Amount:', sampleRecord.ptpAmount);
        console.log('   - Status:', sampleRecord.status);
        console.log('   - Payment Date:', sampleRecord.paymentDate);
        console.log('   - Fields present:', Object.keys(sampleRecord).join(', '));
        
        // Check for missing customer names (optional warning, not error)
        const missingNames = apiData.filter(p => !p.customerName || p.customerName.trim() === '');
        if (missingNames.length > 0) {
          console.warn(`⚠️ Warning: ${missingNames.length} records have missing customer names`);
          // Don't show error to user, just log it
        }
      } else {
        console.warn('⚠️ No data returned from API');
        console.log('📊 Loading sample data instead...');
        await loadSampleDataFromCustomers();
        return;
      }
      
      console.log('💾 Setting ptpPayments state with', apiData.length, 'records');
      setPTPPayments(apiData);
      console.log('✅ PTP Payments loaded successfully');
      
    } catch (err) {
      console.error('❌ Error loading PTP payments:');
      console.error('   Message:', err.message);
      console.error('   Response:', err.response?.data);
      console.error('   Status:', err.response?.status);
      console.error('   Full Error:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load PTP payments';
      setError(`API Error: ${errorMessage}. Check console for details.`);
      
      console.log('📊 Fallback: Loading sample data...');
      await loadSampleDataFromCustomers();
    } finally {
      setLoading(false);
      console.log('🏁 loadPTPPayments completed');
    }
  };

  const loadFilterOptions = async () => {
    try {
      const response = await PTPPaymentService.getFilterOptions();
      const apiOptions = response.data || {};
      
      // Merge API options with hardcoded process values
      setFilterOptions({
        statuses: apiOptions.statuses?.length > 0 ? apiOptions.statuses : ['All Status', 'PTP', 'COLLECTED', 'PDC', 'PART-PAYMENT', 'W-SETT'],
        callerNames: apiOptions.callerNames?.length > 1 ? apiOptions.callerNames : ['All Callers'],
        teamLeaders: apiOptions.teamLeaders?.length > 1 ? apiOptions.teamLeaders : ['All Team Leaders'],
        processes: ['All Processes', 'ASREC', 'DMI', 'BOB-WOFF', 'KOTAK-WOFF', 'SMFG-FIELD']
      });
    } catch (err) {
      console.error('Error loading filter options:', err);
      // Keep default values if API fails
    }
  };

  const loadSummary = async () => {
    try {
      const response = await PTPPaymentService.getSummary();
      setSummary(response.data || {});
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...ptpPayments];
    
    console.log('applyFilters called - activeTab:', activeTab, 'total payments:', ptpPayments.length);

    // Apply tab-based filter first (status segregation)
    if (activeTab === 0) {
      // Tab 1: Collected - show only COLLECTED status
      filtered = filtered.filter(p => p.status === 'COLLECTED');
      console.log('Tab 0 (Collected) - filtered count:', filtered.length);
    } else if (activeTab === 1) {
      // Tab 2: Other Status - show all except COLLECTED
      filtered = filtered.filter(p => p.status !== 'COLLECTED');
      console.log('Tab 1 (Other Status) - filtered count:', filtered.length);
    } else if (activeTab === 2) {
      // Tab 3: Reminders - show PTP, pending, and upcoming payments (not COLLECTED)
      filtered = filtered.filter(p => p.status !== 'COLLECTED');
      console.log('Tab 2 (Reminders) - filtered count:', filtered.length);
    }

    // Apply status filter (only applies to "Other Status" tab)
    if (activeTab === 1 && filters.status && filters.status !== 'All Status') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Apply caller name filter
    if (filters.callerName && filters.callerName !== 'All Callers') {
      filtered = filtered.filter(p => p.callerName === filters.callerName);
    }

    // Apply team leader filter
    if (filters.amAndTL && filters.amAndTL !== 'All Team Leaders') {
      filtered = filtered.filter(p => p.amAndTL === filters.amAndTL);
    }

    // Apply process filter
    if (filters.process && filters.process !== 'All Processes') {
      filtered = filtered.filter(p => p.process === filters.process);
    }

    // Apply payment date filter
    if (filters.paymentDate && filters.paymentDate !== 'All Dates') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.paymentDate === 'Today') {
        filtered = filtered.filter(p => {
          const paymentDate = new Date(p.paymentDate);
          paymentDate.setHours(0, 0, 0, 0);
          return paymentDate.getTime() === today.getTime();
        });
      } else if (filters.paymentDate === 'This Week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        filtered = filtered.filter(p => new Date(p.paymentDate) >= weekStart);
      } else if (filters.paymentDate === 'This Month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filtered = filtered.filter(p => new Date(p.paymentDate) >= monthStart);
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.accountNumber?.toLowerCase().includes(query) ||
        p.customerName?.toLowerCase().includes(query) ||
        p.callerName?.toLowerCase().includes(query) ||
        p.contactNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Apply sorting to filtered data
  const sortedPayments = React.useMemo(() => {
    const comparator = (a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle numeric fields
      if (orderBy === 'ptpAmount') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      // Handle date fields
      if (orderBy === 'paymentDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (bValue < aValue) {
        return order === 'asc' ? 1 : -1;
      }
      if (bValue > aValue) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    };

    return [...filteredPayments].sort(comparator);
  }, [filteredPayments, order, orderBy]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'All Status',
      paymentDate: 'All Dates',
      callerName: 'All Callers',
      amAndTL: 'All Team Leaders',
      process: 'All Processes'
    });
    setSearchQuery('');
  };

  const handleOpenDialog = (mode, payment = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && payment) {
      setSelectedPayment(payment);
      setFormData({
        accountNumber: payment.accountNumber || '',
        customerName: payment.customerName || '',
        ptpAmount: payment.ptpAmount || '',
        status: payment.status || 'PTP',
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
        callerName: payment.callerName || '',
        contactNumber: payment.contactNumber || '',
        amAndTL: payment.amAndTL || '',
        process: payment.process || ''
      });
    } else {
      setSelectedPayment(null);
      setFormData({
        accountNumber: '',
        customerName: '',
        ptpAmount: '',
        status: 'PTP',
        paymentDate: new Date().toISOString().split('T')[0],
        callerName: '',
        contactNumber: '',
        amAndTL: '',
        process: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPayment(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePayment = async () => {
    try {
      setLoading(true);
      
      if (dialogMode === 'add') {
        await PTPPaymentService.createPTPPayment({
          ...formData,
          createdBy: { name: 'Admin', userId: 'admin123', role: 'Admin' }
        });
        setSuccess('PTP payment added successfully');
      } else {
        await PTPPaymentService.updatePTPPayment(selectedPayment._id, {
          ...formData,
          modifiedBy: { name: 'Admin', userId: 'admin123', role: 'Admin' }
        });
        setSuccess('PTP payment updated successfully');
      }

      handleCloseDialog();
      loadPTPPayments();
      loadSummary();
    } catch (err) {
      setError(err.message || 'Failed to save PTP payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PTP payment?')) return;

    try {
      setLoading(true);
      await PTPPaymentService.deletePTPPayment(id);
      setSuccess('PTP payment deleted successfully');
      loadPTPPayments();
      loadSummary();
    } catch (err) {
      setError(err.message || 'Failed to delete PTP payment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (updatedPayment) => {
    try {
      setLoading(true);
      await PTPPaymentService.updatePTPPayment(updatedPayment._id, {
        ...updatedPayment,
        modifiedBy: { name: 'Admin', userId: 'admin123', role: 'Admin' }
      });
      setSuccess('Payment marked as collected successfully');
      loadPTPPayments();
      loadSummary();
    } catch (err) {
      setError(err.message || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadExcel = async () => {
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      const response = await PTPPaymentService.uploadExcel(uploadFile);
      setUploadResult(response.data);
      setSuccess(`File uploaded: ${response.data.imported} imported, ${response.data.updated} updated`);
      loadPTPPayments();
      loadSummary();
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      await PTPPaymentService.downloadExcel(filters);
      setSuccess('Excel file downloaded successfully');
    } catch (err) {
      setError(err.message || 'Failed to download Excel file');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = PTPPaymentService.getStatusColor(status);
    return colors;
  };

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Blue Header Section */}
      <Box sx={{ 
        backgroundColor: '#4A90E2',
        background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
        p: 3,
        mb: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFFFFF', textAlign: 'center' }}>
          PTP & PAYMENT TRACKER
        </Typography>
        <Typography variant="body2" sx={{ color: '#E3F2FD', textAlign: 'center', mt: 0.5 }}>
          Complete payment tracking and management
        </Typography>
      </Box>
      
      {/* Main Content Section */}
      <Paper sx={{ p: 3, mb: 3, mt: 0, borderRadius: 0, boxShadow: 'none' }}>
        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>

          <Box sx={{ 
            display: 'flex', 
            gap: 1.5,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px',
                px: 2.5,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: '0 2px 6px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6a3f8f 100%)',
                  boxShadow: '0 4px 10px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '& .MuiButton-startIcon': {
                  marginRight: '6px'
                }
              }}
            >
              Upload Excel
            </Button>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadExcel}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: '8px',
                px: 2.5,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: '0 2px 6px rgba(79, 172, 254, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #3d96e5 0%, #00d9e5 100%)',
                  boxShadow: '0 4px 10px rgba(79, 172, 254, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  boxShadow: 'none'
                },
                '& .MuiButton-startIcon': {
                  marginRight: '6px'
                }
              }}
            >
              Download Excel
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('add')}
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '8px',
                px: 2.5,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: '0 2px 6px rgba(240, 147, 251, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #e182ea 0%, #e3445a 100%)',
                  boxShadow: '0 4px 10px rgba(240, 147, 251, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '& .MuiButton-startIcon': {
                  marginRight: '6px'
                }
              }}
            >
              Add New Entry
            </Button>
          </Box>
        </Box>

        {/* Filters Section */}
        <Box sx={{ mb: 2 }}>
          <Button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            endIcon={filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ 
              mb: 1, 
              backgroundColor: '#FFB84D',
              color: 'white',
              '&:hover': { backgroundColor: '#FF9A56' },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Filters & Slicers (Advanced)
          </Button>

          <Collapse in={filtersExpanded}>
            {/* Quick Filter Chips */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`All Records (${summary.totalRecords})`}
                onClick={() => handleFilterChange('status', 'All Status')}
                sx={{
                  backgroundColor: filters.status === 'All Status' ? '#E0E0E0' : '#F5F5F5',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#D0D0D0' }
                }}
              />
              <Chip
                label={`Today PTP (${summary.todayPTP})`}
                onClick={() => handleFilterChange('paymentDate', 'Today')}
                sx={{
                  backgroundColor: filters.paymentDate === 'Today' ? '#E0E0E0' : '#F5F5F5',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#D0D0D0' }
                }}
              />
              <Chip
                label={`Collected Only (${summary.collected})`}
                onClick={() => handleFilterChange('status', 'COLLECTED')}
                sx={{
                  backgroundColor: filters.status === 'COLLECTED' ? '#C8E6C9' : '#F5F5F5',
                  color: filters.status === 'COLLECTED' ? '#2E7D32' : 'inherit',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#B2DFDB' }
                }}
              />
              <Chip
                label={`Pending Only (${summary.pending})`}
                onClick={() => handleFilterChange('status', 'PTP')}
                sx={{
                  backgroundColor: filters.status === 'PTP' ? '#FFE0B2' : '#F5F5F5',
                  color: filters.status === 'PTP' ? '#E65100' : 'inherit',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#FFCC80' }
                }}
              />
              <Chip
                label={`Today Collection (${filteredPayments.filter(p => p.status === 'COLLECTED').length})`}
                onClick={() => {
                  handleFilterChange('status', 'COLLECTED');
                  handleFilterChange('paymentDate', 'Today');
                }}
                sx={{
                  backgroundColor: '#00BCD4',
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#0097A7' }
                }}
              />
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>STATUS</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="STATUS"
                  >
                    {filterOptions.statuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>PAYMENT DATE</InputLabel>
                  <Select
                    value={filters.paymentDate}
                    onChange={(e) => handleFilterChange('paymentDate', e.target.value)}
                    label="PAYMENT DATE"
                  >
                    <MenuItem value="All Dates">All Dates</MenuItem>
                    <MenuItem value="Today">Today</MenuItem>
                    <MenuItem value="This Week">This Week</MenuItem>
                    <MenuItem value="This Month">This Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>CALLER NAME</InputLabel>
                  <Select
                    value={filters.callerName}
                    onChange={(e) => handleFilterChange('callerName', e.target.value)}
                    label="CALLER NAME"
                  >
                    {filterOptions.callerNames.map(name => (
                      <MenuItem key={name} value={name}>{name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>AM & TL</InputLabel>
                  <Select
                    value={filters.amAndTL}
                    onChange={(e) => handleFilterChange('amAndTL', e.target.value)}
                    label="AM & TL"
                  >
                    {filterOptions.teamLeaders.map(tl => (
                      <MenuItem key={tl} value={tl}>{tl}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>PROCESS</InputLabel>
                  <Select
                    value={filters.process}
                    onChange={(e) => handleFilterChange('process', e.target.value)}
                    label="PROCESS"
                  >
                    {filterOptions.processes.map(proc => (
                      <MenuItem key={proc} value={proc}>{proc}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="outlined"
              onClick={handleResetFilters}
              size="small"
              sx={{ 
                color: '#666',
                borderColor: '#CCC',
                '&:hover': { borderColor: '#999', backgroundColor: '#f9f9f9' }
              }}
            >
              Reset Filters
            </Button>
          </Collapse>
        </Box>

        {/* Search Box */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by account, customer, caller..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />
          }}
          sx={{ mb: 2, maxWidth: { xs: '100%', sm: '100%', md: 800, lg: 1000 } }}
        />

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #E8F1FD 0%, #F5F9FF 100%)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#2563EB' }}>{summary.totalRecords}</Typography>
                <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 600 }}>All Records ({summary.totalRecords})</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #E6F4F1 0%, #F2FBF9 100%)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#2563EB' }}>{summary.todayPTP}</Typography>
                <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 600 }}>Today PTP ({summary.todayPTP})</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8F2 100%)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#2563EB' }}>{summary.collected}</Typography>
                <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 600 }}>Collected Only ({summary.collected})</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #FFF4E6 0%, #FFF9F0 100%)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#2563EB' }}>{summary.pending}</Typography>
                <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 600 }}>Pending Only ({summary.pending})</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #F1EEFF 0%, #FAF9FF 100%)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB'
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#2563EB' }}>{filteredPayments.length}</Typography>
                <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 600 }}>Today Collection ({filteredPayments.length})</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Segregation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: activeTab === 0 ? '#4CAF50' : activeTab === 1 ? '#2196F3' : '#FF9800',
                height: 3,
              },
            }}
          >
            <Tab 
              icon={<CheckCircleIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Collected</span>
                  <Chip
                    label={ptpPayments.filter(p => p.status === 'COLLECTED').length}
                    size="small"
                    sx={{
                      backgroundColor: activeTab === 0 ? '#4CAF50' : '#E0E0E0',
                      color: activeTab === 0 ? 'white' : '#666',
                      fontWeight: 'bold',
                      height: 20,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              }
              sx={{
                textTransform: 'none',
                fontWeight: activeTab === 0 ? 700 : 400,
                fontSize: '0.95rem',
                color: activeTab === 0 ? '#4CAF50' : '#666',
                minHeight: 56,
                '&.Mui-selected': {
                  color: '#4CAF50',
                },
                '&:hover': {
                  backgroundColor: '#E8F5E9',
                },
              }}
            />
            <Tab 
              icon={<ListIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Other Status</span>
                  <Chip
                    label={ptpPayments.filter(p => p.status !== 'COLLECTED').length}
                    size="small"
                    sx={{
                      backgroundColor: activeTab === 1 ? '#2196F3' : '#E0E0E0',
                      color: activeTab === 1 ? 'white' : '#666',
                      fontWeight: 'bold',
                      height: 20,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              }
              sx={{
                textTransform: 'none',
                fontWeight: activeTab === 1 ? 700 : 400,
                fontSize: '0.95rem',
                color: activeTab === 1 ? '#2196F3' : '#666',
                minHeight: 56,
                '&.Mui-selected': {
                  color: '#2196F3',
                },
                '&:hover': {
                  backgroundColor: '#E3F2FD',
                },
              }}
            />
            <Tab 
              icon={<NotificationsIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Reminders</span>
                  <Chip
                    label={ptpPayments.filter(p => p.status !== 'COLLECTED').length}
                    size="small"
                    sx={{
                      backgroundColor: activeTab === 2 ? '#FF9800' : '#E0E0E0',
                      color: activeTab === 2 ? 'white' : '#666',
                      fontWeight: 'bold',
                      height: 20,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              }
              sx={{
                textTransform: 'none',
                fontWeight: activeTab === 2 ? 700 : 400,
                fontSize: '0.95rem',
                color: activeTab === 2 ? '#FF9800' : '#666',
                minHeight: 56,
                '&.Mui-selected': {
                  color: '#FF9800',
                },
                '&:hover': {
                  backgroundColor: '#FFF3E0',
                },
              }}
            />
          </Tabs>
        </Box>

        {/* Conditional Rendering: Reminders Cards or Table */}
        {activeTab === 2 ? (
          // Reminders Tab - Card View
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
              Payment Reminders
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              Track upcoming and overdue payments
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredPayments.length === 0 ? (
              <Alert severity="info">No payment reminders found</Alert>
            ) : (
              <Grid container spacing={2}>
                {sortedPayments.map((payment) => (
                  <Grid item xs={12} key={payment._id}>
                    <Card
                      sx={{
                        backgroundColor: '#FAFAFA',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          {/* Left Section - Customer Details */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 0.5, fontSize: '1rem' }}>
                              {payment.customerName} - {payment.accountNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 1.5 }}>
                              Amount: <strong style={{ color: '#1976D2' }}>₹{payment.ptpAmount?.toLocaleString()}</strong> | Date: <strong>{PTPPaymentService.formatDate(payment.paymentDate)}</strong> | Caller: <strong>{payment.callerName}</strong> | Contact: <strong>{payment.contactNumber}</strong>
                            </Typography>
                          </Box>

                          {/* Right Section - Action Buttons */}
                          <Box sx={{ display: 'flex', gap: 1.5, ml: 2 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                // Mark as collected
                                setSelectedPayment(payment);
                                setFormData({
                                  ...payment,
                                  status: 'COLLECTED'
                                });
                                handleUpdatePayment({ ...payment, status: 'COLLECTED' });
                              }}
                              sx={{
                                backgroundColor: '#17A2B8',
                                color: 'white',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                px: 2,
                                borderRadius: '6px',
                                boxShadow: '0 2px 6px rgba(23,162,184,0.3)',
                                '&:hover': {
                                  backgroundColor: '#138496',
                                  boxShadow: '0 3px 8px rgba(23,162,184,0.4)'
                                }
                              }}
                            >
                              Mark Collected
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenDialog('edit', payment)}
                              sx={{
                                color: '#666',
                                borderColor: '#CCC',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                px: 2,
                                borderRadius: '6px',
                                '&:hover': {
                                  borderColor: '#999',
                                  backgroundColor: '#F5F5F5'
                                }
                              }}
                            >
                              Edit
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (
          // Collected and Other Status Tabs - Table View
          <>
            {/* Records Count */}
            <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
              Showing {filteredPayments.length} of {activeTab === 0 ? ptpPayments.filter(p => p.status === 'COLLECTED').length : ptpPayments.filter(p => p.status !== 'COLLECTED').length} records in {activeTab === 0 ? '"Collected"' : '"Other Status"'} tab
            </Typography>

            {/* PTP Payments Table */}
        <TableContainer sx={{ maxHeight: 600, border: '1px solid #E0E0E0' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'accountNumber'}
                    direction={orderBy === 'accountNumber' ? order : 'asc'}
                    onClick={() => handleRequestSort('accountNumber')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: '#FFE0B2' },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    ACCOUNT NUMBER
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'customerName'}
                    direction={orderBy === 'customerName' ? order : 'asc'}
                    onClick={() => handleRequestSort('customerName')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: '#FFE0B2' },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    CUSTOMER NAME
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'ptpAmount'}
                    direction={orderBy === 'ptpAmount' ? order : 'asc'}
                    onClick={() => handleRequestSort('ptpAmount')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: '#FFE0B2' },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    PTP AMOUNT
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: '#FFE0B2' },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    STATUS
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'paymentDate'}
                    direction={orderBy === 'paymentDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('paymentDate')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: '#FFE0B2' },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    PAYMENT DATE
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'contactNumber'}
                    direction={orderBy === 'contactNumber' ? order : 'asc'}
                    onClick={() => handleRequestSort('contactNumber')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: '#FFE0B2' },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    CONTACT NUMBER
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'callerName'}
                    direction={orderBy === 'callerName' ? order : 'asc'}
                    onClick={() => handleRequestSort('callerName')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: '#FFE0B2' },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    CALLER NAME
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'amAndTL'}
                    direction={orderBy === 'amAndTL' ? order : 'asc'}
                    onClick={() => handleRequestSort('amAndTL')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: '#FFE0B2' },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    AM & TL
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  <TableSortLabel
                    active={orderBy === 'process'}
                    direction={orderBy === 'process' ? order : 'asc'}
                    onClick={() => handleRequestSort('process')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: '#FFE0B2' },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    PROCESS
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#FF9A56', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    No PTP payments found
                  </TableCell>
                </TableRow>
              ) : (
                sortedPayments.map((payment, index) => {
                  const statusColor = getStatusBadgeColor(payment.status);
                  return (
                    <TableRow
                      key={payment._id}
                      sx={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#F9F9F9',
                        '&:hover': { backgroundColor: '#E3F2FD' }
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.75rem' }}>{payment.accountNumber}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{payment.customerName}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        ₹{payment.ptpAmount?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          size="small"
                          sx={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.color,
                            border: `1px solid ${statusColor.border}`,
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {PTPPaymentService.formatDate(payment.paymentDate)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{payment.contactNumber}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{payment.callerName}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{payment.amAndTL}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{payment.process}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenDialog('edit', payment)}
                            sx={{
                              minWidth: 'auto',
                              px: 1,
                              py: 0.5,
                              backgroundColor: '#00BCD4',
                              '&:hover': { backgroundColor: '#0097A7' },
                              fontSize: '0.7rem'
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleDeletePayment(payment._id)}
                            sx={{
                              minWidth: 'auto',
                              px: 1,
                              py: 0.5,
                              backgroundColor: '#F44336',
                              '&:hover': { backgroundColor: '#D32F2F' },
                              fontSize: '0.7rem'
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
          </>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Entry' : 'Edit Entry'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={formData.accountNumber}
                onChange={(e) => handleFormChange('accountNumber', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.customerName}
                onChange={(e) => handleFormChange('customerName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="PTP Amount"
                type="number"
                value={formData.ptpAmount}
                onChange={(e) => handleFormChange('ptpAmount', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="PTP">PTP</MenuItem>
                  <MenuItem value="COLLECTED">COLLECTED</MenuItem>
                  <MenuItem value="PDC">PDC</MenuItem>
                  <MenuItem value="PART-PAYMENT">PART-PAYMENT</MenuItem>
                  <MenuItem value="W-SETT">W-SETT</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleFormChange('paymentDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                value={formData.contactNumber}
                onChange={(e) => handleFormChange('contactNumber', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Caller Name"
                value={formData.callerName}
                onChange={(e) => handleFormChange('callerName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="AM & TL"
                value={formData.amAndTL}
                onChange={(e) => handleFormChange('amAndTL', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Process</InputLabel>
                <Select
                  value={formData.process}
                  onChange={(e) => handleFormChange('process', e.target.value)}
                  label="Process"
                  required
                >
                  <MenuItem value="ASREC">ASREC</MenuItem>
                  <MenuItem value="DMI">DMI</MenuItem>
                  <MenuItem value="BOB-WOFF">BOB-WOFF</MenuItem>
                  <MenuItem value="KOTAK-WOFF">KOTAK-WOFF</MenuItem>
                  <MenuItem value="SMFG-FIELD">SMFG-FIELD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSavePayment}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#FF9800',
              '&:hover': { backgroundColor: '#F57C00' }
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Excel File</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setUploadFile(e.target.files[0])}
              style={{ marginBottom: 16 }}
            />
            {uploadResult && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Total: {uploadResult.totalRows} | Imported: {uploadResult.imported} | 
                  Updated: {uploadResult.updated} | Errors: {uploadResult.errors}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUploadExcel}
            variant="contained"
            disabled={!uploadFile || loading}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45A049' }
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PTPPaymentTracker;
