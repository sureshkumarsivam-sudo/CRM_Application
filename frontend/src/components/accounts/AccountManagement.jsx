import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  ListItemText,
  Collapse,
  Menu,
  Badge,
  Popover,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';
import CustomerService from '../../services/CustomerService';
import FeedbackDialog from './FeedbackDialog';

// Account Management Component

const AccountManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(50); // Changed from 10 to 50
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    activeAccounts: 0,
    writtenOffAccounts: 0,
    settledAccounts: 0,
  });
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [overwriteMode, setOverwriteMode] = useState(false);
  const [orderBy, setOrderBy] = useState('loanId');
  const [order, setOrder] = useState('asc');
  
  // Filter states
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    productType: [],
    accountStatus: [],
    allocation: [],
    callerName: [],
    teamLeader: [],
    manager: [],
  });
  
  // Column filter popover states
  const [columnFilterAnchors, setColumnFilterAnchors] = useState({
    productType: null,
    accountStatus: null,
    allocation: null,
    callerName: null,
    teamLeader: null,
    manager: null,
  });
  
  // All available filter options (populated from data)
  const [filterOptions, setFilterOptions] = useState({
    productType: [],
    accountStatus: [],
    allocation: [],
    callerName: [],
    teamLeader: [],
    manager: [],
  });

  // Feedback dialog state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedAccountForFeedback, setSelectedAccountForFeedback] = useState(null);

  useEffect(() => {
    fetchAccounts();
    fetchAllFilterOptions(); // Fetch all filter options on mount
  }, [page, searchQuery]);

  // Fetch all unique filter options from all records
  const fetchAllFilterOptions = async () => {
    try {
      const options = await CustomerService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      // If API fails, fallback to empty arrays
      setFilterOptions({
        productType: [],
        accountStatus: [],
        allocation: [],
        callerName: [],
        teamLeader: [],
        manager: [],
      });
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await CustomerService.getCustomers({
        page,
        limit: rowsPerPage,
        search: searchQuery
      });

      setAccounts(response.data || []);
      setTotalAccounts(response.pagination?.totalRecords || 0);
      
      // Calculate stats
      const data = response.data || [];
      const totalOut = data.reduce((sum, acc) => sum + (acc.totalOutstanding || acc.totalOverDue || 0), 0);
      const active = data.filter(acc => (acc.accountStatus || acc.status || '').toUpperCase() === 'ACTIVE').length;
      const writtenOff = data.filter(acc => (acc.accountStatus || acc.status || '').includes('WRIT')).length;
      const settled = data.filter(acc => (acc.accountStatus || acc.status || '').toUpperCase() === 'SETTLED').length;
      
      setStats({
        totalOutstanding: totalOut,
        activeAccounts: active,
        writtenOffAccounts: writtenOff,
        settledAccounts: settled,
      });
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError('Failed to load account data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(1); // Reset to first page when filter changes
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      productType: [],
      accountStatus: [],
      allocation: [],
      callerName: [],
      teamLeader: [],
      manager: [],
    });
    setPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(filter => filter.length > 0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleViewAccount = (account) => {
    // Navigate to account details page
    navigate(`/accounts/${account._id}`);
  };

  // Feedback handlers
  const handleFeedbackClick = (account) => {
    setSelectedAccountForFeedback(account);
    setFeedbackDialogOpen(true);
  };

  const handleFeedbackSuccess = () => {
    // Optionally refresh accounts list
    fetchAccounts();
  };

  // Filter menu handlers
  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  // Column filter popover handlers
  const handleColumnFilterOpen = (event, column) => {
    setColumnFilterAnchors(prev => ({
      ...prev,
      [column]: event.currentTarget
    }));
  };

  const handleColumnFilterClose = (column) => {
    setColumnFilterAnchors(prev => ({
      ...prev,
      [column]: null
    }));
  };

  const handleColumnFilterChange = (column, value) => {
    setFilters(prev => {
      const currentValues = prev[column];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [column]: newValues
      };
    });
    setPage(1); // Reset to first page when filter changes
  };

  const handleColumnFilterSelectAll = (column) => {
    setFilters(prev => ({
      ...prev,
      [column]: filterOptions[column]
    }));
    setPage(1);
  };

  const handleColumnFilterClearAll = (column) => {
    setFilters(prev => ({
      ...prev,
      [column]: []
    }));
    setPage(1);
  };

  // File upload handlers
  const handleUploadClick = () => {
    setUploadDialogOpen(true);
    setUploadFile(null);
    setUploadProgress('');
    setUploadResult(null);
    setOverwriteMode(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setUploadFile(file);
      setUploadProgress('');
      setUploadResult(null);
    } else {
      setUploadProgress('Please select a valid CSV file');
    }
  };

  const handleUploadConfirm = async () => {
    if (!uploadFile) {
      setUploadProgress('Please select a file');
      return;
    }

    setUploadProgress('Uploading...');
    try {
      const result = await CustomerService.uploadCSV(uploadFile, overwriteMode);
      setUploadResult(result);
      setUploadProgress('Upload completed');
      
      // Refresh the account list
      fetchAccounts();
      
      // Clear selection
      setSelectedAccounts([]);
    } catch (error) {
      setUploadProgress(`Upload failed: ${error.message}`);
    }
  };

  const handleUploadClose = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
    setUploadProgress('');
    setUploadResult(null);
  };

  // Selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all filtered accounts (not just all accounts)
      const allIds = filteredAndSortedAccounts.map(account => account._id);
      setSelectedAccounts(allIds);
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleSelectOne = (accountId) => {
    const selectedIndex = selectedAccounts.indexOf(accountId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedAccounts, accountId];
    } else {
      newSelected = selectedAccounts.filter(id => id !== accountId);
    }

    setSelectedAccounts(newSelected);
  };

  const isSelected = (accountId) => selectedAccounts.indexOf(accountId) !== -1;

  // Delete handlers
  const handleDeleteClick = () => {
    if (selectedAccounts.length === 0) return;
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await CustomerService.bulkDeleteCustomers(selectedAccounts);
      
      // Refresh the account list
      setDeleteDialogOpen(false);
      setSelectedAccounts([]);
      await fetchAccounts();
    } catch (error) {
      setError(error.message || 'Failed to delete accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteSingle = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      setLoading(true);
      await CustomerService.deleteCustomer(accountId);
      
      // Refresh the account list
      setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
      await fetchAccounts();
    } catch (error) {
      setError(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE':
        return 'success';
      case 'CLOSED':
        return 'default';
      case 'WRITTEN OFF':
      case 'WRITTE OFF':
        return 'error';
      case 'SETTLED':
        return 'secondary';
      case 'UNDER LITIGATION':
        return 'warning';
      case 'UNDER PROGRESS':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusStyle = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'WRITTEN OFF':
      case 'WRITTE OFF':
        return { backgroundColor: '#FFE0B2', color: '#FB8C00', fontWeight: 'bold' };
      case 'SETTLED':
        return { backgroundColor: '#FFCC80', color: '#EF6C00', fontWeight: 'bold' };
      case 'UNDER LITIGATION':
        return { backgroundColor: '#FFF3E0', color: '#FFAB40', fontWeight: 'bold' };
      case 'ACTIVE':
        return { backgroundColor: '#FFAB40', color: '#1A237E', fontWeight: 'bold' };
      case 'CLOSED':
        return { backgroundColor: '#FFB74D', color: '#FB8C00', fontWeight: 'bold' };
      default:
        return { backgroundColor: '#FFF8E1', color: '#FFAB40', fontWeight: 'bold' };
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Apply filters and sorting
  const filteredAndSortedAccounts = React.useMemo(() => {
    // First, apply filters
    let filtered = [...accounts];
    
    // Apply product type filter
    if (filters.productType.length > 0) {
      filtered = filtered.filter(acc => filters.productType.includes(acc.productType));
    }
    
    // Apply account status filter
    if (filters.accountStatus.length > 0) {
      filtered = filtered.filter(acc => 
        filters.accountStatus.includes(acc.accountStatus) || 
        filters.accountStatus.includes(acc.status)
      );
    }
    
    // Apply allocation filter
    if (filters.allocation.length > 0) {
      filtered = filtered.filter(acc => filters.allocation.includes(acc.allocation));
    }
    
    // Apply caller name filter
    if (filters.callerName.length > 0) {
      filtered = filtered.filter(acc => filters.callerName.includes(acc.callerName));
    }
    
    // Apply team leader filter
    if (filters.teamLeader.length > 0) {
      filtered = filtered.filter(acc => filters.teamLeader.includes(acc.teamLeader));
    }
    
    // Apply manager filter
    if (filters.manager.length > 0) {
      filtered = filtered.filter(acc => filters.manager.includes(acc.manager));
    }
    
    // Then, apply sorting
    const comparator = (a, b) => {
      let aValue = a[orderBy] || '';
      let bValue = b[orderBy] || '';

      // Handle numeric fields
      if (['totalOutstanding', 'principalOutstanding', 'totalOverDue', 'principalDueOverDue'].includes(orderBy)) {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
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

    return filtered.sort(comparator);
  }, [accounts, filters, order, orderBy]);

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      background: '#F7F9FC',
      minHeight: 'calc(100vh - 64px)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
        width: '100%',
        maxWidth: '100%'
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 700,
          color: '#1A237E',
          letterSpacing: '-0.5px'
        }}>
          Account Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleUploadClick}
            sx={{
              background: '#1976D2',
              color: 'white',
              '&:hover': { 
                background: '#1565C0',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            Upload CSV
          </Button>
        </Box>
      </Box>      {/* Search Bar */}
      <Paper sx={{ 
        p: 2.5, 
        mb: 3, 
        borderRadius: '12px', 
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '100%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #E0E0E0',
        boxSizing: 'border-box'
      }}>
        <TextField
          fullWidth
          placeholder="Search by Account Number, Customer Name, Email, Phone, City, State..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#1976D2' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small" sx={{ color: '#757575' }}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: '#FAFAFA',
              '& fieldset': {
                borderColor: '#E0E0E0',
              },
              '&:hover fieldset': {
                borderColor: '#1976D2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976D2',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#757575',
              opacity: 1,
            }
          }}
        />
      </Paper>

      <Typography variant="body1" sx={{ mb: 2, color: '#424242', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
        Showing {filteredAndSortedAccounts.length} of {totalAccounts} accounts
        {hasActiveFilters() && ' (filtered)'}
        {hasActiveFilters() && (
          <>
            <Chip 
              label={`${Object.values(filters).reduce((sum, f) => sum + f.length, 0)} filters active`}
              size="small"
              sx={{ backgroundColor: '#E3F2FD', color: '#1976D2', fontWeight: 600, border: '1px solid #BBDEFB' }}
            />
            <Button
              variant="text"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{
                color: '#1976D2',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { backgroundColor: '#E3F2FD' }
              }}
            >
              Clear All Filters
            </Button>
          </>
        )}
      </Typography>

      {/* Divider */}
      <Box sx={{ borderBottom: '1px solid #E0E0E0', mb: 3 }} />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Accounts Table */}
      <Paper sx={{ 
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden', 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #E0E0E0',
        boxSizing: 'border-box'
      }}>
        <TableContainer sx={{ 
          maxHeight: '1200px',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}>
          <Table stickyHeader sx={{ 
            tableLayout: 'auto',
            width: '100%',
            minWidth: 'unset'
          }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', py: 0.75 }}>
                  <Checkbox
                    indeterminate={selectedAccounts.length > 0 && selectedAccounts.length < filteredAndSortedAccounts.length}
                    checked={filteredAndSortedAccounts.length > 0 && selectedAccounts.length === filteredAndSortedAccounts.length}
                    onChange={handleSelectAll}
                    sx={{
                      color: '#757575',
                      '&.Mui-checked': { color: '#1976D2' },
                      '&.MuiCheckbox-indeterminate': { color: '#1976D2' }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.75, whiteSpace: 'normal', width: 'auto' }}>
                  <TableSortLabel
                    active={orderBy === 'loanId'}
                    direction={orderBy === 'loanId' ? order : 'asc'}
                    onClick={() => handleRequestSort('loanId')}
                    sx={{
                      color: '#424242 !important',
                      '&.MuiTableSortLabel-root': { color: '#424242' },
                      '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                      '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                      '&.Mui-active': { color: '#1976D2 !important' },
                      '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                    }}
                  >
                    Loan Account Number
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.75, whiteSpace: 'normal', width: 'auto' }}>
                  <TableSortLabel
                    active={orderBy === 'parent'}
                    direction={orderBy === 'parent' ? order : 'asc'}
                    onClick={() => handleRequestSort('parent')}
                    sx={{
                      color: '#424242 !important',
                      '&.MuiTableSortLabel-root': { color: '#424242' },
                      '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                      '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                      '&.Mui-active': { color: '#1976D2 !important' },
                      '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                    }}
                  >
                    Parent Id
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.75, whiteSpace: 'normal', width: 'auto' }}>
                  <TableSortLabel
                    active={orderBy === 'accountName'}
                    direction={orderBy === 'accountName' ? order : 'asc'}
                    onClick={() => handleRequestSort('accountName')}
                    sx={{
                      color: '#424242 !important',
                      '&.MuiTableSortLabel-root': { color: '#424242' },
                      '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                      '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                      '&.Mui-active': { color: '#1976D2 !important' },
                      '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                    }}
                  >
                    Customer Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.75, whiteSpace: 'normal', width: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <TableSortLabel
                      active={orderBy === 'productType'}
                      direction={orderBy === 'productType' ? order : 'asc'}
                      onClick={() => handleRequestSort('productType')}
                      sx={{
                        color: '#424242 !important',
                        '&.MuiTableSortLabel-root': { color: '#424242' },
                        '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                        '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                        '&.Mui-active': { color: '#1976D2 !important' },
                        '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                      }}
                    >
                      Product Type
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'productType')}
                      sx={{ 
                        color: filters.productType.length > 0 ? '#1976D2' : '#757575',
                        '&:hover': { backgroundColor: '#E3F2FD' }
                      }}
                    >
                      <Badge badgeContent={filters.productType.length} color="primary">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.5, whiteSpace: 'normal', width: 'auto' }} align="right">
                  <TableSortLabel
                    active={orderBy === 'totalOutstanding'}
                    direction={orderBy === 'totalOutstanding' ? order : 'asc'}
                    onClick={() => handleRequestSort('totalOutstanding')}
                    sx={{
                      color: '#424242 !important',
                      '&.MuiTableSortLabel-root': { color: '#424242' },
                      '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                      '& .MuiTableSortLabel-icon': { color: '#424242 !important' }
                    }}
                  >
                    Total Outstanding
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.5, whiteSpace: 'normal', width: 'auto' }} align="right">
                  <TableSortLabel
                    active={orderBy === 'principalOutstanding'}
                    direction={orderBy === 'principalOutstanding' ? order : 'asc'}
                    onClick={() => handleRequestSort('principalOutstanding')}
                    sx={{
                      color: '#424242 !important',
                      '&.MuiTableSortLabel-root': { color: '#424242' },
                      '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                      '& .MuiTableSortLabel-icon': { color: '#424242 !important' }
                    }}
                  >
                    Principal Outstanding
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.5, whiteSpace: 'normal', width: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <TableSortLabel
                      active={orderBy === 'accountStatus'}
                      direction={orderBy === 'accountStatus' ? order : 'asc'}
                      onClick={() => handleRequestSort('accountStatus')}
                      sx={{
                        color: '#424242 !important',
                        '&.MuiTableSortLabel-root': { color: '#424242' },
                        '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                        '& .MuiTableSortLabel-icon': { color: '#424242 !important' }
                      }}
                    >
                      Account Status
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'accountStatus')}
                      sx={{ 
                        color: filters.accountStatus.length > 0 ? '#FFE0B2' : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 224, 178, 0.1)' }
                      }}
                    >
                      <Badge badgeContent={filters.accountStatus.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.5, whiteSpace: 'normal', width: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <TableSortLabel
                      active={orderBy === 'allocation'}
                      direction={orderBy === 'allocation' ? order : 'asc'}
                      onClick={() => handleRequestSort('allocation')}
                      sx={{
                        color: '#424242 !important',
                        '&.MuiTableSortLabel-root': { color: '#424242' },
                        '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                        '& .MuiTableSortLabel-icon': { color: '#424242 !important' }
                      }}
                    >
                      Allocation
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'allocation')}
                      sx={{ 
                        color: filters.allocation.length > 0 ? '#FFE0B2' : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 224, 178, 0.1)' }
                      }}
                    >
                      <Badge badgeContent={filters.allocation.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.5, whiteSpace: 'normal', width: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <TableSortLabel
                      active={orderBy === 'callerName'}
                      direction={orderBy === 'callerName' ? order : 'asc'}
                      onClick={() => handleRequestSort('callerName')}
                      sx={{
                        color: '#424242 !important',
                        '&.MuiTableSortLabel-root': { color: '#424242' },
                        '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                      '& .MuiTableSortLabel-icon': { color: '#424242 !important' }
                    }}
                  >
                    Caller Name
                  </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'callerName')}
                      sx={{ 
                        color: filters.callerName.length > 0 ? '#FFE0B2' : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 224, 178, 0.1)' }
                      }}
                    >
                      <Badge badgeContent={filters.callerName.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.5, whiteSpace: 'normal', width: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <TableSortLabel
                      active={orderBy === 'teamLeader'}
                      direction={orderBy === 'teamLeader' ? order : 'asc'}
                      onClick={() => handleRequestSort('teamLeader')}
                      sx={{
                        color: '#424242 !important',
                        '&.MuiTableSortLabel-root': { color: '#424242' },
                        '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                        '& .MuiTableSortLabel-icon': { color: '#424242 !important' }
                      }}
                    >
                      Team Leader
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'teamLeader')}
                      sx={{ 
                        color: filters.teamLeader.length > 0 ? '#FFE0B2' : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 224, 178, 0.1)' }
                      }}
                    >
                      <Badge badgeContent={filters.teamLeader.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.5, whiteSpace: 'normal', width: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <TableSortLabel
                      active={orderBy === 'manager'}
                      direction={orderBy === 'manager' ? order : 'asc'}
                      onClick={() => handleRequestSort('manager')}
                      sx={{
                        color: '#424242 !important',
                        '&.MuiTableSortLabel-root': { color: '#424242' },
                        '&.MuiTableSortLabel-root:hover': { color: '#1976D2' },
                        '& .MuiTableSortLabel-icon': { color: '#424242 !important' }
                      }}
                    >
                      Manager
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'manager')}
                      sx={{ 
                        color: filters.manager.length > 0 ? '#FFE0B2' : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 224, 178, 0.1)' }
                      }}
                    >
                      <Badge badgeContent={filters.manager.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem', py: 0.75, whiteSpace: 'nowrap', width: '100px' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading accounts...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary">
                      {hasActiveFilters() 
                        ? 'No accounts match your filter criteria. Try adjusting your filters.'
                        : 'No accounts found. Try adjusting your search criteria.'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedAccounts.map((account, index) => {
                  const isItemSelected = isSelected(account._id);
                  return (
                    <TableRow 
                      key={account.loanId || index}
                      sx={{ 
                        '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.05)' },
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ py: 0.5 }}>
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectOne(account._id)}
                          sx={{
                            color: '#757575',
                            '&.Mui-checked': { color: '#1976D2' }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>{account.loanId || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>{account.parent || 'N/A'}</TableCell>
                      <TableCell sx={{ fontWeight: 500, py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>{account.accountName || account.customerName || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>{account.productType || 'PL'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500, py: 0.5, whiteSpace: 'normal' }}>
                        {formatCurrency(account.totalOutstanding || account.totalOverDue || 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 0.5, whiteSpace: 'normal' }}>
                        {formatCurrency(account.principalOutstanding || account.principalDueOverDue || 0)}
                      </TableCell>
                      <TableCell sx={{ py: 0.5, whiteSpace: 'normal' }}>
                        <Chip 
                          label={account.accountStatus || account.status || 'ACTIVE'} 
                          size="small"
                          sx={{ 
                            ...getStatusStyle(account.accountStatus || account.status),
                            borderRadius: '8px',
                            maxWidth: '100%'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>{account.allocation || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>{account.callerName || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>{account.teamLeader || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>{account.manager || 'N/A'}</TableCell>
                      <TableCell align="center" sx={{ py: 0.5, whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            sx={{
                              backgroundColor: '#1976D2',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#1565C0',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                              },
                              textTransform: 'none',
                              borderRadius: '6px',
                              fontWeight: 500,
                              px: { xs: 1, sm: 2 },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)'
                            }}
                            onClick={() => handleViewAccount(account)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FeedbackIcon />}
                            sx={{
                              borderColor: '#757575',
                              color: '#424242',
                              '&:hover': {
                                borderColor: '#1976D2',
                                backgroundColor: '#E3F2FD',
                                color: '#1976D2'
                              },
                              textTransform: 'none',
                              borderRadius: '6px',
                              fontWeight: 500,
                              px: { xs: 1, sm: 2 },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                            onClick={() => handleFeedbackClick(account)}
                          >
                            Feedback
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

        {/* Pagination */}
        {!loading && accounts.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination 
              count={Math.ceil(totalAccounts / rowsPerPage)} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>

      {/* Upload CSV Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0', color: '#424242', fontWeight: 600, fontSize: '0.875rem' }}>
          Upload CSV File
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Select a CSV file to upload accounts. The file should match the same format as the original import file.
            Duplicate accounts (based on Loan Account Number) will be skipped.
          </DialogContentText>
          
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="csv-file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{
                borderColor: '#1976D2',
                color: '#1976D2',
                '&:hover': {
                  borderColor: '#1565C0',
                  backgroundColor: '#E3F2FD'
                }
              }}
            >
              Choose CSV File
            </Button>
          </label>
          
          {uploadFile && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#E3F2FD', borderRadius: '8px', border: '1px solid #BBDEFB' }}>
              <Typography variant="body2">
                <strong>Selected file:</strong> {uploadFile.name}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={overwriteMode}
              onChange={(e) => setOverwriteMode(e.target.checked)}
              sx={{
                color: '#757575',
                '&.Mui-checked': { color: '#1976D2' }
              }}
            />
            <Typography variant="body2">
              Update existing accounts (if unchecked, duplicates will be skipped)
            </Typography>
          </Box>
          
          {uploadProgress && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color={uploadProgress.includes('failed') ? 'error' : 'primary'}>
                {uploadProgress}
              </Typography>
            </Box>
          )}
          
          {uploadResult && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#E8F5E9', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Upload Results:</strong>
              </Typography>
              <Typography variant="body2">
                • New accounts imported: {uploadResult.imported}
              </Typography>
              {uploadResult.updated > 0 && (
                <Typography variant="body2">
                  • Existing accounts updated: {uploadResult.updated}
                </Typography>
              )}
              <Typography variant="body2">
                • Duplicates skipped: {uploadResult.duplicates}
              </Typography>
              {uploadResult.errors > 0 && (
                <>
                  <Typography variant="body2" color="error">
                    • Errors: {uploadResult.errors}
                  </Typography>
                  {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
                    <Box sx={{ mt: 1, pl: 2 }}>
                      <Typography variant="caption" color="error">
                        First few errors:
                      </Typography>
                      {uploadResult.errorDetails.map((err, idx) => (
                        <Typography key={idx} variant="caption" display="block" color="error">
                          • {err.loanId || `Row ${err.row}`}: {err.error}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleUploadClose} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleUploadConfirm} 
            variant="contained"
            disabled={!uploadFile || uploadProgress === 'Uploading...'}
            sx={{
              backgroundColor: '#1976D2',
              color: 'white',
              '&:hover': { 
                backgroundColor: '#1565C0',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              },
              '&:disabled': {
                backgroundColor: '#E5E7EB',
                color: '#9CA3AF'
              }
            }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ backgroundColor: '#FFEBEE', color: '#C62828', fontWeight: 600, borderBottom: '2px solid #FFCDD2' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete {selectedAccounts.length} selected account(s)?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteCancel} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Column Filter Popovers */}
      {/* Product Type Filter */}
      <Popover
        open={Boolean(columnFilterAnchors.productType)}
        anchorEl={columnFilterAnchors.productType}
        onClose={() => handleColumnFilterClose('productType')}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250, maxWidth: 350 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#FFAB40' }}>
            📦 Filter by Product Type
          </Typography>
          <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => handleColumnFilterSelectAll('productType')} sx={{ fontSize: '0.75rem' }}>
              Select All
            </Button>
            <Button size="small" onClick={() => handleColumnFilterClearAll('productType')} sx={{ fontSize: '0.75rem' }}>
              Clear
            </Button>
          </Box>
          <FormGroup sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {filterOptions.productType.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={filters.productType.includes(option)}
                    onChange={() => handleColumnFilterChange('productType', option)}
                    sx={{
                      color: '#FFAB40',
                      '&.Mui-checked': { color: '#FFAB40' }
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
          {filters.productType.length > 0 && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6B7280' }}>
              {filters.productType.length} selected
            </Typography>
          )}
        </Box>
      </Popover>

      {/* Account Status Filter */}
      <Popover
        open={Boolean(columnFilterAnchors.accountStatus)}
        anchorEl={columnFilterAnchors.accountStatus}
        onClose={() => handleColumnFilterClose('accountStatus')}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250, maxWidth: 350 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#FFAB40' }}>
            📊 Filter by Account Status
          </Typography>
          <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => handleColumnFilterSelectAll('accountStatus')} sx={{ fontSize: '0.75rem' }}>
              Select All
            </Button>
            <Button size="small" onClick={() => handleColumnFilterClearAll('accountStatus')} sx={{ fontSize: '0.75rem' }}>
              Clear
            </Button>
          </Box>
          <FormGroup sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {filterOptions.accountStatus.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={filters.accountStatus.includes(option)}
                    onChange={() => handleColumnFilterChange('accountStatus', option)}
                    sx={{
                      color: '#FFAB40',
                      '&.Mui-checked': { color: '#FFAB40' }
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
          {filters.accountStatus.length > 0 && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6B7280' }}>
              {filters.accountStatus.length} selected
            </Typography>
          )}
        </Box>
      </Popover>

      {/* Allocation Filter */}
      <Popover
        open={Boolean(columnFilterAnchors.allocation)}
        anchorEl={columnFilterAnchors.allocation}
        onClose={() => handleColumnFilterClose('allocation')}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250, maxWidth: 350 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#FFAB40' }}>
            🎯 Filter by Allocation
          </Typography>
          <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => handleColumnFilterSelectAll('allocation')} sx={{ fontSize: '0.75rem' }}>
              Select All
            </Button>
            <Button size="small" onClick={() => handleColumnFilterClearAll('allocation')} sx={{ fontSize: '0.75rem' }}>
              Clear
            </Button>
          </Box>
          <FormGroup sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {filterOptions.allocation.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={filters.allocation.includes(option)}
                    onChange={() => handleColumnFilterChange('allocation', option)}
                    sx={{
                      color: '#FFAB40',
                      '&.Mui-checked': { color: '#FFAB40' }
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
          {filters.allocation.length > 0 && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6B7280' }}>
              {filters.allocation.length} selected
            </Typography>
          )}
        </Box>
      </Popover>

      {/* Caller Name Filter */}
      <Popover
        open={Boolean(columnFilterAnchors.callerName)}
        anchorEl={columnFilterAnchors.callerName}
        onClose={() => handleColumnFilterClose('callerName')}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250, maxWidth: 350 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#FFAB40' }}>
            👤 Filter by Caller Name
          </Typography>
          <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => handleColumnFilterSelectAll('callerName')} sx={{ fontSize: '0.75rem' }}>
              Select All
            </Button>
            <Button size="small" onClick={() => handleColumnFilterClearAll('callerName')} sx={{ fontSize: '0.75rem' }}>
              Clear
            </Button>
          </Box>
          <FormGroup sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {filterOptions.callerName.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={filters.callerName.includes(option)}
                    onChange={() => handleColumnFilterChange('callerName', option)}
                    sx={{
                      color: '#FFAB40',
                      '&.Mui-checked': { color: '#FFAB40' }
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
          {filters.callerName.length > 0 && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6B7280' }}>
              {filters.callerName.length} selected
            </Typography>
          )}
        </Box>
      </Popover>

      {/* Team Leader Filter */}
      <Popover
        open={Boolean(columnFilterAnchors.teamLeader)}
        anchorEl={columnFilterAnchors.teamLeader}
        onClose={() => handleColumnFilterClose('teamLeader')}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250, maxWidth: 350 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#FFAB40' }}>
            👨‍💼 Filter by Team Leader
          </Typography>
          <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => handleColumnFilterSelectAll('teamLeader')} sx={{ fontSize: '0.75rem' }}>
              Select All
            </Button>
            <Button size="small" onClick={() => handleColumnFilterClearAll('teamLeader')} sx={{ fontSize: '0.75rem' }}>
              Clear
            </Button>
          </Box>
          <FormGroup sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {filterOptions.teamLeader.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={filters.teamLeader.includes(option)}
                    onChange={() => handleColumnFilterChange('teamLeader', option)}
                    sx={{
                      color: '#FFAB40',
                      '&.Mui-checked': { color: '#FFAB40' }
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
          {filters.teamLeader.length > 0 && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6B7280' }}>
              {filters.teamLeader.length} selected
            </Typography>
          )}
        </Box>
      </Popover>

      {/* Manager Filter */}
      <Popover
        open={Boolean(columnFilterAnchors.manager)}
        anchorEl={columnFilterAnchors.manager}
        onClose={() => handleColumnFilterClose('manager')}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250, maxWidth: 350 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#FFAB40' }}>
            🎓 Filter by Manager
          </Typography>
          <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => handleColumnFilterSelectAll('manager')} sx={{ fontSize: '0.75rem' }}>
              Select All
            </Button>
            <Button size="small" onClick={() => handleColumnFilterClearAll('manager')} sx={{ fontSize: '0.75rem' }}>
              Clear
            </Button>
          </Box>
          <FormGroup sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {filterOptions.manager.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={filters.manager.includes(option)}
                    onChange={() => handleColumnFilterChange('manager', option)}
                    sx={{
                      color: '#FFAB40',
                      '&.Mui-checked': { color: '#FFAB40' }
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
          {filters.manager.length > 0 && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6B7280' }}>
              {filters.manager.length} selected
            </Typography>
          )}
        </Box>
      </Popover>

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        account={selectedAccountForFeedback}
        onSuccess={handleFeedbackSuccess}
      />
    </Box>
  );
};

export default AccountManagement;









