import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import {
  Email,
  Visibility,
  Refresh,
  FilterList,
  FileDownload,
  CheckCircle,
  Error,
  Schedule,
  Block
} from '@mui/icons-material';
import { EmailLogService } from '../../services/EmailService';

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    emailType: '',
    startDate: '',
    endDate: '',
    recipientEmail: ''
  });

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [currentPage, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };

      const data = await EmailLogService.getLogs(params);
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load email logs' });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await EmailLogService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleRetry = async (logId) => {
    try {
      setMessage({ type: '', text: '' });
      await EmailLogService.retryEmail(logId);
      setMessage({ type: 'success', text: 'Email retry initiated successfully' });
      await loadLogs();
      await loadStats();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Retry failed: ${error.response?.data?.message || error.message}` 
      });
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setViewDialog(true);
  };

  const handleExportCSV = async () => {
    try {
      setMessage({ type: '', text: '' });
      const blob = await EmailLogService.exportToCSV(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `email-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage({ type: 'success', text: 'Email logs exported successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export logs' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sent': return 'success';
      case 'Failed': return 'error';
      case 'Pending': return 'warning';
      case 'Bounced': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Sent': return <CheckCircle fontSize="small" />;
      case 'Failed': return <Error fontSize="small" />;
      case 'Pending': return <Schedule fontSize="small" />;
      case 'Bounced': return <Block fontSize="small" />;
      default: return null;
    }
  };

  const getEmailTypeColor = (type) => {
    switch (type) {
      case 'LetterApproved': return '#4CAF50';
      case 'PaymentReminder': return '#2196F3';
      case 'OverdueAlert': return '#F44336';
      case 'CancellationConfirmation': return '#607D8B';
      case 'Test': return '#9E9E9E';
      default: return '#757575';
    }
  };

  return (
    <Box>
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="body2">Sent</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.statusStats?.Sent || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #F44336 0%, #E57373 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="body2">Failed</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.statusStats?.Failed || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="body2">Pending</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.statusStats?.Pending || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="body2">Recent Failures (24h)</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.recentFailed || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Email sx={{ fontSize: 32, color: '#FFAB40', mr: 2 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Email Delivery Logs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage all sent emails
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => { loadLogs(); loadStats(); }}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F5F5F5', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterList sx={{ mr: 1, color: '#666' }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Filters
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Sent">Sent</MenuItem>
                    <MenuItem value="Failed">Failed</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Bounced">Bounced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Email Type</InputLabel>
                  <Select
                    value={filters.emailType}
                    onChange={(e) => handleFilterChange('emailType', e.target.value)}
                    label="Email Type"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="LetterApproved">Letter Approved</MenuItem>
                    <MenuItem value="PaymentReminder">Payment Reminder</MenuItem>
                    <MenuItem value="OverdueAlert">Overdue Alert</MenuItem>
                    <MenuItem value="CancellationConfirmation">Cancellation</MenuItem>
                    <MenuItem value="Test">Test</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="End Date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Recipient Email"
                  value={filters.recipientEmail}
                  onChange={(e) => handleFilterChange('recipientEmail', e.target.value)}
                  placeholder="Search by email..."
                />
              </Grid>
            </Grid>
          </Box>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                  <TableCell><strong>Date/Time</strong></TableCell>
                  <TableCell><strong>Recipient</strong></TableCell>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Retry</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Email sx={{ fontSize: 48, color: '#CCC', mb: 2 }} />
                      <Typography color="text.secondary">
                        No email logs found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{log.recipientEmail}</Typography>
                        {log.recipientName && (
                          <Typography variant="caption" color="text.secondary">
                            {log.recipientName}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {log.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.emailType}
                          size="small"
                          sx={{
                            bgcolor: `${getEmailTypeColor(log.emailType)}15`,
                            color: getEmailTypeColor(log.emailType),
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(log.status)}
                          label={log.status}
                          color={getStatusColor(log.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {log.retryCount > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {log.retryCount}/{log.maxRetries}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(log)}
                            color="primary"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {log.status === 'Failed' && log.retryCount < log.maxRetries && (
                          <Tooltip title="Retry Sending">
                            <IconButton
                              size="small"
                              onClick={() => handleRetry(log._id)}
                              color="warning"
                            >
                              <Refresh fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Email sx={{ mr: 1, color: '#FFAB40' }} />
            Email Details
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      icon={getStatusIcon(selectedLog.status)}
                      label={selectedLog.status}
                      color={getStatusColor(selectedLog.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Email Type</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedLog.emailType}
                      size="small"
                      sx={{
                        bgcolor: `${getEmailTypeColor(selectedLog.emailType)}15`,
                        color: getEmailTypeColor(selectedLog.emailType)
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Recipient Email</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedLog.recipientEmail}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Recipient Name</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedLog.recipientName || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">{new Date(selectedLog.createdAt).toLocaleString()}</Typography>
                </Grid>
                {selectedLog.sentAt && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Sent At</Typography>
                    <Typography variant="body2">{new Date(selectedLog.sentAt).toLocaleString()}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Subject</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedLog.subject}</Typography>
                </Grid>
                {selectedLog.retryCount > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Retry Attempts</Typography>
                    <Typography variant="body2">{selectedLog.retryCount} / {selectedLog.maxRetries}</Typography>
                  </Grid>
                )}
                {selectedLog.errorDetails && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="caption" fontWeight="bold">Error Message:</Typography>
                      <Typography variant="body2">{selectedLog.errorDetails.message}</Typography>
                    </Alert>
                  </Grid>
                )}
                {selectedLog.providerResponse?.messageId && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Message ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                      {selectedLog.providerResponse.messageId}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Email Body</Typography>
                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      border: '1px solid #DDD',
                      borderRadius: 1,
                      bgcolor: '#F9F9F9',
                      maxHeight: 400,
                      overflow: 'auto'
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedLog.body }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailLogs;
