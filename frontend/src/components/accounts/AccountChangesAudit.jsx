import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Collapse,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SwapHoriz as AllocationIcon,
  MonetizationOn as SettlementIcon,
  Cancel as CancelIcon,
  ChangeCircle as StatusChangeIcon,
  Assessment as ClosureIcon,
  Mail as LetterIcon,
  Phone as CallbackIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AccountChangesAudit = ({ accountId, loanId }) => {
  const [changes, setChanges] = useState([]);
  const [filteredChanges, setFilteredChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedRows, setExpandedRows] = useState([]);

  const changeTypes = [
    { value: 'all', label: 'All Changes' },
    { value: 'allocation', label: 'Allocations' },
    { value: 'reallocation', label: 'Re-allocations' },
    { value: 'settlement', label: 'Settlements' },
    { value: 'closure', label: 'Closures' },
    { value: 'cancellation', label: 'Letter Cancellations' },
    { value: 'callback', label: 'Callbacks' },
    { value: 'status_change', label: 'Status Changes' },
  ];

  useEffect(() => {
    fetchChanges();
  }, [accountId]);

  useEffect(() => {
    applyFilters();
  }, [changes, searchQuery, filterType]);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/timeline/${accountId}`);
      setChanges(response.data || []);
    } catch (err) {
      console.error('Error fetching account changes:', err);
      setError('Failed to load account changes');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...changes];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(change => change.type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(change =>
        change.title?.toLowerCase().includes(query) ||
        change.description?.toLowerCase().includes(query) ||
        change.performedBy?.toLowerCase().includes(query)
      );
    }

    setFilteredChanges(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRowExpansion = (index) => {
    setExpandedRows(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getChangeIcon = (type) => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (type) {
      case 'allocation':
      case 'reallocation':
        return <AllocationIcon {...iconProps} />;
      case 'settlement':
        return <SettlementIcon {...iconProps} />;
      case 'closure':
        return <ClosureIcon {...iconProps} />;
      case 'cancellation':
        return <CancelIcon {...iconProps} />;
      case 'callback':
        return <CallbackIcon {...iconProps} />;
      case 'status_change':
        return <StatusChangeIcon {...iconProps} />;
      default:
        return <LetterIcon {...iconProps} />;
    }
  };

  const getChangeColor = (type) => {
    const colors = {
      allocation: 'primary',
      reallocation: 'secondary',
      settlement: 'success',
      closure: 'warning',
      cancellation: 'error',
      callback: 'info',
      status_change: 'default',
    };
    return colors[type] || 'default';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['Date & Time', 'Change Type', 'Title', 'Description', 'Performed By', 'Details'];
    const rows = filteredChanges.map(change => [
      formatDateTime(change.timestamp),
      change.type,
      change.title || '',
      change.description || '',
      change.performedBy || 'System',
      JSON.stringify(change.metadata || {}),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account_changes_${loanId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2} sx={{ mb: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#1A237E', fontWeight: 600 }}>
            Account Management Audit Trail
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchChanges} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export to CSV">
              <IconButton onClick={exportToCSV} size="small">
                <ExportIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search changes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              label="Filter by Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              {changeTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Summary Stats */}
        <Paper sx={{ p: 2, backgroundColor: '#F5F5F5' }}>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="textSecondary">Total Changes</Typography>
              <Typography variant="h6" fontWeight={600}>{changes.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Filtered Results</Typography>
              <Typography variant="h6" fontWeight={600}>{filteredChanges.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Allocations</Typography>
              <Typography variant="h6" fontWeight={600}>
                {changes.filter(c => c.type === 'allocation' || c.type === 'reallocation').length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Settlements</Typography>
              <Typography variant="h6" fontWeight={600}>
                {changes.filter(c => c.type === 'settlement').length}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      {/* Changes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1A237E' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date & Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Change Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Performed By</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredChanges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No changes found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredChanges
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((change, index) => {
                  const globalIndex = page * rowsPerPage + index;
                  const isExpanded = expandedRows.includes(globalIndex);
                  
                  return (
                    <React.Fragment key={globalIndex}>
                      <TableRow hover>
                        <TableCell>
                          <Typography variant="body2">{formatDateTime(change.timestamp)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getChangeIcon(change.type)}
                            label={change.type.replace('_', ' ').toUpperCase()}
                            color={getChangeColor(change.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {change.title || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {change.description || ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{change.performedBy || 'System'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpansion(globalIndex)}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, backgroundColor: '#F9F9F9' }}>
                              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                Change Details:
                              </Typography>
                              {change.metadata && Object.keys(change.metadata).length > 0 ? (
                                <Table size="small">
                                  <TableBody>
                                    {Object.entries(change.metadata).map(([key, value]) => (
                                      <TableRow key={key}>
                                        <TableCell component="th" sx={{ fontWeight: 500, width: '30%' }}>
                                          {key.replace(/_/g, ' ').toUpperCase()}
                                        </TableCell>
                                        <TableCell>
                                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <Typography variant="body2" color="textSecondary">
                                  No additional details available
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredChanges.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};

export default AccountChangesAudit;
