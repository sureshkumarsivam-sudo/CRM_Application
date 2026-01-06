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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Pending as PendingIcon,
  Error as FailedIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const PaymentHistoryAudit = ({ accountId, loanId }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [sendingReceipt, setSendingReceipt] = useState(null);

  const paymentStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const paymentMethods = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'online', label: 'Online' },
    { value: 'upi', label: 'UPI' },
    { value: 'neft', label: 'NEFT' },
    { value: 'rtgs', label: 'RTGS' },
  ];

  useEffect(() => {
    fetchPayments();
  }, [accountId]);

  useEffect(() => {
    applyFilters();
  }, [payments, searchQuery, filterStatus, filterMethod]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/ptp-payments/customer/${accountId}`);
      setPayments(response.data || []);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    // Filter by payment method
    if (filterMethod !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === filterMethod);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.paymentId?.toLowerCase().includes(query) ||
        payment.receiptId?.toLowerCase().includes(query) ||
        payment.transactionId?.toLowerCase().includes(query) ||
        payment.createdBy?.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewReceipt = async (payment) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ptp-payments/receipt/${payment._id}`);
      setSelectedReceipt(response.data);
      setReceiptDialogOpen(true);
    } catch (err) {
      console.error('Error fetching receipt:', err);
      alert('Failed to load receipt');
    }
  };

  const handleResendReceipt = async (paymentId) => {
    try {
      setSendingReceipt(paymentId);
      await axios.post(`${API_BASE_URL}/ptp-payments/receipt/${paymentId}/resend`);
      alert('Receipt sent successfully');
    } catch (err) {
      console.error('Error resending receipt:', err);
      alert('Failed to resend receipt');
    } finally {
      setSendingReceipt(null);
    }
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

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    const iconProps = { sx: { fontSize: 18 } };
    switch (status) {
      case 'completed':
        return <SuccessIcon {...iconProps} />;
      case 'pending':
        return <PendingIcon {...iconProps} />;
      case 'failed':
        return <FailedIcon {...iconProps} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      refunded: 'info',
    };
    return colors[status] || 'default';
  };

  const exportToCSV = () => {
    const headers = [
      'Payment ID',
      'Date & Time',
      'Amount',
      'Payment Method',
      'Status',
      'Receipt ID',
      'Transaction ID',
      'Promise To Pay Date',
      'Created By',
      'Remarks',
    ];
    
    const rows = filteredPayments.map(payment => [
      payment.paymentId || '',
      formatDateTime(payment.paymentDate),
      payment.amount || 0,
      payment.paymentMethod || '',
      payment.status || '',
      payment.receiptId || '',
      payment.transactionId || '',
      payment.promiseToPayDate ? new Date(payment.promiseToPayDate).toLocaleDateString('en-IN') : '',
      payment.createdBy || '',
      payment.remarks || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_history_${loanId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    alert('PDF export feature will be implemented soon with jsPDF library');
  };

  const calculateTotals = () => {
    const total = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completed = filteredPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = filteredPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
    
    return { total, completed, pending };
  };

  const totals = calculateTotals();

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
            Payment History Audit Trail
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchPayments} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export to CSV">
              <IconButton onClick={exportToCSV} size="small">
                <ExportIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon />}
              onClick={exportToPDF}
            >
              Export PDF
            </Button>
          </Stack>
        </Box>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search by Payment ID, Receipt, Transaction..."
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {paymentStatuses.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Method</InputLabel>
            <Select
              value={filterMethod}
              label="Method"
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              {paymentMethods.map(method => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Summary Stats */}
        <Paper sx={{ p: 2, backgroundColor: '#F5F5F5' }}>
          <Stack direction="row" spacing={4} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="textSecondary">Total Payments</Typography>
              <Typography variant="h6" fontWeight={600}>{filteredPayments.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Total Amount</Typography>
              <Typography variant="h6" fontWeight={600} color="primary">
                {formatCurrency(totals.total)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Completed</Typography>
              <Typography variant="h6" fontWeight={600} color="success.main">
                {formatCurrency(totals.completed)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Pending</Typography>
              <Typography variant="h6" fontWeight={600} color="warning.main">
                {formatCurrency(totals.pending)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1A237E' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Payment ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date & Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Method</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Receipt ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Transaction ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created By</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">No payment records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((payment, index) => (
                  <TableRow key={payment._id || index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {payment.paymentId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(payment.paymentDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.paymentMethod?.toUpperCase() || 'N/A'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(payment.status)}
                        label={payment.status?.toUpperCase() || 'N/A'}
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.receiptId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.transactionId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.createdBy || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Receipt">
                          <IconButton
                            size="small"
                            onClick={() => handleViewReceipt(payment)}
                            disabled={!payment.receiptId}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Resend Receipt">
                          <IconButton
                            size="small"
                            onClick={() => handleResendReceipt(payment._id)}
                            disabled={!payment.receiptId || sendingReceipt === payment._id}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredPayments.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />

      {/* Receipt Dialog */}
      <Dialog
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogContent>
          {selectedReceipt ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2"><strong>Receipt ID:</strong> {selectedReceipt.receiptId}</Typography>
              <Typography variant="body2"><strong>Payment ID:</strong> {selectedReceipt.paymentId}</Typography>
              <Typography variant="body2"><strong>Amount:</strong> {formatCurrency(selectedReceipt.amount)}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {formatDateTime(selectedReceipt.paymentDate)}</Typography>
              <Typography variant="body2"><strong>Method:</strong> {selectedReceipt.paymentMethod}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {selectedReceipt.status}</Typography>
              {selectedReceipt.remarks && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Remarks:</strong> {selectedReceipt.remarks}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography>Loading receipt...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentHistoryAudit;
