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
  List,
  ListItem,
  FormControlLabel,
  FormGroup,
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
};

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
  const [columnFilterAnchors, setColumnFilterAnchors] = useState({});
  const [filters, setFilters] = useState({
    productType: [],
    accountStatus: [],
    allocation: [],
    callerName: [],
    teamLeader: [],
    manager: [],
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
  }, [page, searchQuery]);

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
      
      // Extract unique values for filters
      const data = response.data || [];
      extractFilterOptions(data);
      
      // Calculate stats
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

  // Extract unique values for filter options
  const extractFilterOptions = (data) => {
    const productTypes = [...new Set(data.map(acc => acc.productType).filter(Boolean))].sort();
    const accountStatuses = [...new Set(data.map(acc => acc.accountStatus || acc.status).filter(Boolean))].sort();
    const allocations = [...new Set(data.map(acc => acc.allocation).filter(Boolean))].sort();
    const callerNames = [...new Set(data.map(acc => acc.callerName).filter(Boolean))].sort();
    const teamLeaders = [...new Set(data.map(acc => acc.teamLeader).filter(Boolean))].sort();
    const managers = [...new Set(data.map(acc => acc.manager).filter(Boolean))].sort();
    
    setFilterOptions({
      productType: productTypes,
      accountStatus: accountStatuses,
      allocation: allocations,
      callerName: callerNames,
      teamLeader: teamLeaders,
      manager: managers,
    });
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

  // Column filter handlers
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
    const currentValues = filters[column];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setFilters(prev => ({
      ...prev,
      [column]: newValues
    }));
  };

  const handleColumnFilterSelectAll = (column) => {
    setFilters(prev => ({
      ...prev,
      [column]: filterOptions[column] || []
    }));
  };

  const handleColumnFilterClearAll = (column) => {
    setFilters(prev => ({
      ...prev,
      [column]: []
    }));
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
        return { backgroundColor: '#FFE8D6', color: '#E63946', fontWeight: 'bold' };
      case 'SETTLED':
        return { backgroundColor: '#FFE8D6', color: '#06D6A0', fontWeight: 'bold' };
      case 'UNDER LITIGATION':
        return { backgroundColor: '#FFE8D6', color: '#F4A261', fontWeight: 'bold' };
      case 'ACTIVE':
        return { backgroundColor: '#FFD700', color: '#2D3142', fontWeight: 'bold' };
      case 'CLOSED':
        return { backgroundColor: '#FFE8D6', color: '#666', fontWeight: 'bold' };
      default:
        return { backgroundColor: '#FFE8D6', color: '#FF6B35', fontWeight: 'bold' };
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
    <Box sx={{ width: '100%', background: theme.light, minHeight: '100vh' }}>
      <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 3,
        background: theme.gradient,
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)',
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          fontSize: '2rem'
        }}>
          🏦 Account Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleUploadClick}
            sx={{
              backgroundColor: 'white',
              color: theme.primary,
              '&:hover': { 
                backgroundColor: theme.light,
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
              },
              borderRadius: '25px',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              transition: 'all 0.3s ease',
            }}
          >
            Upload CSV
          </Button>
        </Box>
      </Box>      {/* Search Bar */}
      <Paper sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: '25px', 
        border: `3px solid ${theme.secondary}`,
        boxShadow: '0 4px 20px rgba(255, 107, 53, 0.15)',
        background: 'white',
      }}>
        <TextField
          fullWidth
          placeholder="🔍 Search by Account Number, Customer Name, Product Type, Status, Allocation, Caller..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.primary, fontSize: '28px' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small" sx={{ 
                  color: theme.danger,
                  '&:hover': { backgroundColor: 'rgba(230, 57, 70, 0.1)' }
                }}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '25px',
              backgroundColor: 'white',
              border: 'none',
              fontSize: '1.1rem',
              '& fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: theme.warning,
              opacity: 1,
              fontWeight: '500',
            }
          }}
        />
      </Paper>

      <Typography variant="body1" sx={{ 
        mb: 3, 
        color: theme.dark, 
        fontWeight: 600, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        fontSize: '1.1rem',
      }}>
        📊 Showing {filteredAndSortedAccounts.length} of {totalAccounts} accounts
        {hasActiveFilters() && ' (filtered)'}
        {hasActiveFilters() && (
          <>
            <Chip 
              label={`🎯 ${Object.values(filters).reduce((sum, f) => sum + f.length, 0)} filters active`}
              size="medium"
              sx={{ 
                background: theme.gradient,
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '0.95rem',
                px: 1,
              }}
            />
            <Button
              variant="text"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{
                color: theme.danger,
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { 
                  backgroundColor: 'rgba(230, 57, 70, 0.1)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              Clear All Filters
            </Button>
          </>
        )}
      </Typography>

      {/* Divider */}
      <Box sx={{ 
        borderBottom: `3px solid ${theme.secondary}`, 
        mb: 3,
        boxShadow: `0 2px 8px rgba(255, 107, 53, 0.2)`,
      }} />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ 
          mb: 3,
          borderRadius: '15px',
          border: `2px solid ${theme.danger}`,
          '& .MuiAlert-icon': { color: theme.danger }
        }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Accounts Table */}
      <Paper sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(255, 107, 53, 0.2)',
        border: `3px solid ${theme.secondary}`,
      }}>
        <TableContainer sx={{ maxHeight: '1200px' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  py: 2,
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <Checkbox
                    indeterminate={selectedAccounts.length > 0 && selectedAccounts.length < filteredAndSortedAccounts.length}
                    checked={filteredAndSortedAccounts.length > 0 && selectedAccounts.length === filteredAndSortedAccounts.length}
                    onChange={handleSelectAll}
                    sx={{
                      color: 'white',
                      '&.Mui-checked': { color: 'white' },
                      '&.MuiCheckbox-indeterminate': { color: 'white' }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 100, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }} align="center">
                  🎬 Actions
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 150, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <TableSortLabel
                    active={orderBy === 'loanId'}
                    direction={orderBy === 'loanId' ? order : 'asc'}
                    onClick={() => handleRequestSort('loanId')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    💳 Loan Account Number
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 100, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <TableSortLabel
                    active={orderBy === 'parent'}
                    direction={orderBy === 'parent' ? order : 'asc'}
                    onClick={() => handleRequestSort('parent')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    🔗 Parent Id
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 150, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <TableSortLabel
                    active={orderBy === 'accountName'}
                    direction={orderBy === 'accountName' ? order : 'asc'}
                    onClick={() => handleRequestSort('accountName')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    👤 Customer Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 100, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableSortLabel
                      active={orderBy === 'productType'}
                      direction={orderBy === 'productType' ? order : 'asc'}
                      onClick={() => handleRequestSort('productType')}
                      sx={{
                        color: 'white !important',
                        '&.MuiTableSortLabel-root': { color: 'white' },
                        '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                      }}
                    >
                      📦 Product Type
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'productType')}
                      sx={{
                        color: filters.productType.length > 0 ? theme.accent : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                        p: 0.5,
                      }}
                    >
                      <Badge badgeContent={filters.productType.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 130, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }} align="right">
                  <TableSortLabel
                    active={orderBy === 'totalOutstanding'}
                    direction={orderBy === 'totalOutstanding' ? order : 'asc'}
                    onClick={() => handleRequestSort('totalOutstanding')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    💰 Total Outstanding
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 140, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }} align="right">
                  <TableSortLabel
                    active={orderBy === 'principalOutstanding'}
                    direction={orderBy === 'principalOutstanding' ? order : 'asc'}
                    onClick={() => handleRequestSort('principalOutstanding')}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-root': { color: 'white' },
                      '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                      '& .MuiTableSortLabel-icon': { color: 'white !important' }
                    }}
                  >
                    💵 Principal Outstanding
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 120, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableSortLabel
                      active={orderBy === 'accountStatus'}
                      direction={orderBy === 'accountStatus' ? order : 'asc'}
                      onClick={() => handleRequestSort('accountStatus')}
                      sx={{
                        color: 'white !important',
                        '&.MuiTableSortLabel-root': { color: 'white' },
                        '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                      }}
                    >
                      📊 Account Status
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'accountStatus')}
                      sx={{
                        color: filters.accountStatus.length > 0 ? theme.accent : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                        p: 0.5,
                      }}
                    >
                      <Badge badgeContent={filters.accountStatus.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 120, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableSortLabel
                      active={orderBy === 'allocation'}
                      direction={orderBy === 'allocation' ? order : 'asc'}
                      onClick={() => handleRequestSort('allocation')}
                      sx={{
                        color: 'white !important',
                        '&.MuiTableSortLabel-root': { color: 'white' },
                        '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                      }}
                    >
                      🎯 Allocation
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'allocation')}
                      sx={{
                        color: filters.allocation.length > 0 ? theme.accent : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                        p: 0.5,
                      }}
                    >
                      <Badge badgeContent={filters.allocation.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 120, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableSortLabel
                      active={orderBy === 'callerName'}
                      direction={orderBy === 'callerName' ? order : 'asc'}
                      onClick={() => handleRequestSort('callerName')}
                      sx={{
                        color: 'white !important',
                        '&.MuiTableSortLabel-root': { color: 'white' },
                        '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                      }}
                    >
                      📞 Caller Name
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'callerName')}
                      sx={{
                        color: filters.callerName.length > 0 ? theme.accent : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                        p: 0.5,
                      }}
                    >
                      <Badge badgeContent={filters.callerName.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 120, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableSortLabel
                      active={orderBy === 'teamLeader'}
                      direction={orderBy === 'teamLeader' ? order : 'asc'}
                      onClick={() => handleRequestSort('teamLeader')}
                      sx={{
                        color: 'white !important',
                        '&.MuiTableSortLabel-root': { color: 'white' },
                        '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                      }}
                    >
                      👨‍💼 Team Leader
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'teamLeader')}
                      sx={{
                        color: filters.teamLeader.length > 0 ? theme.accent : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                        p: 0.5,
                      }}
                    >
                      <Badge badgeContent={filters.teamLeader.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  background: theme.gradient,
                  color: 'white', 
                  fontWeight: 'bold', 
                  minWidth: 100, 
                  py: 2,
                  fontSize: '1rem',
                  borderBottom: `3px solid ${theme.danger}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableSortLabel
                      active={orderBy === 'manager'}
                      direction={orderBy === 'manager' ? order : 'asc'}
                      onClick={() => handleRequestSort('manager')}
                      sx={{
                        color: 'white !important',
                        '&.MuiTableSortLabel-root': { color: 'white' },
                        '&.MuiTableSortLabel-root:hover': { color: theme.accent },
                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                      }}
                    >
                      🏢 Manager
                    </TableSortLabel>
                    <IconButton
                      size="small"
                      onClick={(e) => handleColumnFilterOpen(e, 'manager')}
                      sx={{
                        color: filters.manager.length > 0 ? theme.accent : 'white',
                        '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                        p: 0.5,
                      }}
                    >
                      <Badge badgeContent={filters.manager.length} color="error">
                        <FilterListIcon fontSize="small" />
                      </Badge>
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 8, background: theme.cardGradient }}>
                    <CircularProgress sx={{ color: theme.primary }} size={60} />
                    <Typography sx={{ mt: 2, color: theme.dark, fontWeight: 'bold', fontSize: '1.1rem' }}>
                      ⏳ Loading accounts...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 8, background: theme.cardGradient }}>
                    <Typography sx={{ color: theme.dark, fontSize: '1.1rem', fontWeight: '500' }}>
                      {hasActiveFilters() 
                        ? '🔍 No accounts match your filter criteria. Try adjusting your filters.'
                        : '📭 No accounts found. Try adjusting your search criteria.'
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
                        '&:hover': { backgroundColor: 'rgba(44, 140, 153, 0.05)' },
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ py: 1 }}>
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectOne(account._id)}
                          sx={{
                            color: '#2C8C99',
                            '&.Mui-checked': { color: '#1A6B75' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            sx={{
                              background: theme.gradient,
                              color: 'white',
                              '&:hover': {
                                background: theme.gradient,
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
                              },
                              textTransform: 'none',
                              borderRadius: '20px',
                              fontWeight: 'bold',
                              px: 3,
                              transition: 'all 0.3s ease',
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
                              borderColor: theme.primary,
                              color: theme.primary,
                              borderWidth: '2px',
                              '&:hover': {
                                borderColor: theme.danger,
                                color: theme.danger,
                                backgroundColor: 'rgba(230, 57, 70, 0.05)',
                                borderWidth: '2px',
                                transform: 'translateY(-2px)',
                              },
                              textTransform: 'none',
                              borderRadius: '20px',
                              fontWeight: 'bold',
                              px: 3,
                              transition: 'all 0.3s ease',
                            }}
                            onClick={() => handleFeedbackClick(account)}
                          >
                            Feedback
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, fontSize: '0.95rem' }}>{account.loanId || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 2, fontSize: '0.95rem' }}>{account.parent || 'N/A'}</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 2, fontSize: '0.95rem', color: theme.dark }}>{account.accountName || account.customerName || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 2, fontSize: '0.95rem' }}>{account.productType || 'PL'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', py: 2, fontSize: '1rem', color: theme.danger }}>
                        {formatCurrency(account.totalOutstanding || account.totalOverDue || 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        {formatCurrency(account.principalOutstanding || account.principalDueOverDue || 0)}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip 
                          label={account.accountStatus || account.status || 'ACTIVE'} 
                          size="small"
                          sx={{ 
                            ...getStatusStyle(account.accountStatus || account.status),
                            minWidth: 100,
                            borderRadius: '8px'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>{account.allocation || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 1 }}>{account.callerName || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 1 }}>{account.teamLeader || 'N/A'}</TableCell>
                      <TableCell sx={{ py: 1 }}>{account.manager || 'N/A'}</TableCell>
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
        <DialogTitle sx={{ backgroundColor: '#2C8C99', color: 'white', fontWeight: 'bold' }}>
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
                borderColor: '#2C8C99',
                color: '#2C8C99',
                '&:hover': {
                  borderColor: '#1A6B75',
                  backgroundColor: 'rgba(44, 140, 153, 0.05)'
                }
              }}
            >
              Choose CSV File
            </Button>
          </label>
          
          {uploadFile && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#E0F7FA', borderRadius: 1 }}>
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
                color: '#2C8C99',
                '&.Mui-checked': { color: '#1A6B75' }
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
              backgroundColor: '#2C8C99',
              '&:hover': { backgroundColor: '#1A6B75' }
            }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ backgroundColor: '#d32f2f', color: 'white', fontWeight: 'bold' }}>
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
      {['productType', 'accountStatus', 'allocation', 'callerName', 'teamLeader', 'manager'].map(column => (
        <Popover
          key={column}
          open={Boolean(columnFilterAnchors[column])}
          anchorEl={columnFilterAnchors[column]}
          onClose={() => handleColumnFilterClose(column)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              border: `2px solid ${theme.secondary}`,
              boxShadow: '0 4px 20px rgba(255, 107, 53, 0.2)',
              maxHeight: '400px',
              minWidth: '250px',
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              pb: 1,
              borderBottom: `2px solid ${theme.secondary}`,
            }}>
              <Typography sx={{ fontWeight: 'bold', color: theme.primary, fontSize: '1rem' }}>
                {column === 'productType' && '📦 Product Type'}
                {column === 'accountStatus' && '📊 Account Status'}
                {column === 'allocation' && '🎯 Allocation'}
                {column === 'callerName' && '📞 Caller Name'}
                {column === 'teamLeader' && '👨‍💼 Team Leader'}
                {column === 'manager' && '🏢 Manager'}
              </Typography>
              <Box>
                <Button
                  size="small"
                  onClick={() => handleColumnFilterSelectAll(column)}
                  sx={{ 
                    textTransform: 'none', 
                    fontSize: '0.75rem',
                    color: theme.success,
                    minWidth: 'auto',
                    px: 1,
                  }}
                >
                  All
                </Button>
                <Button
                  size="small"
                  onClick={() => handleColumnFilterClearAll(column)}
                  sx={{ 
                    textTransform: 'none', 
                    fontSize: '0.75rem',
                    color: theme.danger,
                    minWidth: 'auto',
                    px: 1,
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Box>
            
            <FormGroup sx={{ maxHeight: '300px', overflowY: 'auto' }}>
              {(filterOptions[column] || []).map(option => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={filters[column].includes(option)}
                      onChange={() => handleColumnFilterChange(column, option)}
                      sx={{
                        color: theme.secondary,
                        '&.Mui-checked': {
                          color: theme.primary,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.9rem', color: theme.dark }}>
                      {option || '(Empty)'}
                    </Typography>
                  }
                  sx={{ mb: 0.5 }}
                />
              ))}
              {(!filterOptions[column] || filterOptions[column].length === 0) && (
                <Typography sx={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic', p: 2 }}>
                  No options available
                </Typography>
              )}
            </FormGroup>
            
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: `1px solid ${theme.secondary}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>
                {filters[column].length} selected
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleColumnFilterClose(column)}
                sx={{
                  background: theme.gradient,
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: theme.secondary,
                  }
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Popover>
      ))}

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        account={selectedAccountForFeedback}
        onSuccess={handleFeedbackSuccess}
      />
      </Box>
    </Box>
  );
};

export default AccountManagement;