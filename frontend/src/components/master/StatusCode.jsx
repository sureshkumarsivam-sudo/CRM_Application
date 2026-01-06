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
  TableSortLabel,
  TextField,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import MasterStatusCodeService from '../../services/MasterStatusCodeService';

const StatusCode = () => {
  const [statusCodes, setStatusCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('code');
  const [order, setOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedStatusCode, setSelectedStatusCode] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    category: 'Neutral',
    nextActionTrigger: '',
    responsible: '',
    autoEscalationLogic: ''
  });
  
  const [categories, setCategories] = useState([]);

  // Load data
  useEffect(() => {
    fetchStatusCodes();
    fetchCategories();
  }, [page, rowsPerPage, orderBy, order, search, categoryFilter]);

  const fetchStatusCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
        search: search,
        category: categoryFilter
      };
      
      const response = await MasterStatusCodeService.getStatusCodes(params);
      
      if (response && response.success) {
        setStatusCodes(Array.isArray(response.data) ? response.data : []);
        setTotalRecords(response.pagination?.total || 0);
      } else {
        setStatusCodes([]);
        setTotalRecords(0);
      }
    } catch (err) {
      setError('Failed to load status codes. Please check your connection and try again.');
      setStatusCodes([]);
      setTotalRecords(0);
      console.error('Error fetching status codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await MasterStatusCodeService.getCategories();
      if (response && response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        // Set default categories if API fails
        setCategories(['Positive', 'Neutral', 'Negative']);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Set default categories if API fails
      setCategories(['Positive', 'Neutral', 'Negative']);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (mode, statusCode = null) => {
    setDialogMode(mode);
    setSelectedStatusCode(statusCode);
    
    if (mode === 'edit' && statusCode) {
      setFormData({
        code: statusCode?.code || '',
        description: statusCode?.description || '',
        category: statusCode?.category || 'Neutral',
        nextActionTrigger: statusCode?.nextActionTrigger || '',
        responsible: statusCode?.responsible || '',
        autoEscalationLogic: statusCode?.autoEscalationLogic || ''
      });
    } else {
      setFormData({
        code: '',
        description: '',
        category: 'Neutral',
        nextActionTrigger: '',
        responsible: '',
        autoEscalationLogic: ''
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStatusCode(null);
    setFormData({
      code: '',
      description: '',
      category: 'Neutral',
      nextActionTrigger: '',
      responsible: '',
      autoEscalationLogic: ''
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveStatusCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!formData.code || !formData.description || !formData.category || 
          !formData.nextActionTrigger || !formData.responsible) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      let response;
      if (dialogMode === 'add') {
        response = await MasterStatusCodeService.createStatusCode(formData);
      } else {
        response = await MasterStatusCodeService.updateStatusCode(selectedStatusCode?._id, formData);
      }
      
      if (response && response.success) {
        setSuccess(`Status code ${dialogMode === 'add' ? 'created' : 'updated'} successfully`);
        handleCloseDialog();
        fetchStatusCodes();
      } else {
        setError(response?.message || 'Failed to save status code');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save status code';
      setError(errorMessage);
      console.error('Error saving status code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatusCode = async (id) => {
    if (!id) {
      setError('Invalid status code ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this status code?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await MasterStatusCodeService.deleteStatusCode(id);
      
      if (response && response.success) {
        setSuccess('Status code deleted successfully');
        fetchStatusCodes();
      } else {
        setError(response?.message || 'Failed to delete status code');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete status code';
      setError(errorMessage);
      console.error('Error deleting status code:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Positive':
        return 'success';
      case 'Negative':
        return 'error';
      case 'Neutral':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleExportToExcel = () => {
    try {
      if (!statusCodes || statusCodes.length === 0) {
        setError('No data to export');
        return;
      }
      
      // Convert data to CSV format
      const headers = ['Status Code', 'Description', 'Category', 'Next Action Trigger', 'Responsible', 'Auto Escalation Logic'];
      const csvData = statusCodes.map(sc => [
        sc?.code || '',
        sc?.description || '',
        sc?.category || '',
        sc?.nextActionTrigger || '',
        sc?.responsible || '',
        sc?.autoEscalationLogic || ''
      ]);
      
      let csv = headers.join(',') + '\n';
      csvData.forEach(row => {
        csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
      });
      
      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `status_codes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccess('Data exported successfully');
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}>
              Status Code Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Manage and configure status codes for the CRM system
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={fetchStatusCodes}
                sx={{
                  backgroundColor: '#E3F2FD',
                  color: '#1976D2',
                  '&:hover': { backgroundColor: '#BBDEFB' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportToExcel}
              disabled={statusCodes.length === 0}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px',
                px: 2.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6a3f8f 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)'
                }
              }}
            >
              Export
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('add')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px',
                px: 2.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6a3f8f 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)'
                }
              }}
            >
              Add New Status Code
            </Button>
          </Box>
        </Box>

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

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by code, description, or responsible..."
            value={search}
            onChange={handleSearchChange}
            size="small"
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666' }} />
                </InputAdornment>
              )
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category Filter</InputLabel>
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              label="Category Filter"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        {loading && statusCodes.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'code'}
                        direction={orderBy === 'code' ? order : 'asc'}
                        onClick={() => handleRequestSort('code')}
                        sx={{ fontWeight: 700, fontSize: '0.875rem' }}
                      >
                        Status Code
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'description'}
                        direction={orderBy === 'description' ? order : 'asc'}
                        onClick={() => handleRequestSort('description')}
                        sx={{ fontWeight: 700, fontSize: '0.875rem' }}
                      >
                        Description
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'category'}
                        direction={orderBy === 'category' ? order : 'asc'}
                        onClick={() => handleRequestSort('category')}
                        sx={{ fontWeight: 700, fontSize: '0.875rem' }}
                      >
                        Category
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                      Next Action
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                      Responsible
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                      Auto Escalation
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statusCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {loading ? 'Loading status codes...' : 'No status codes found'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    statusCodes.map((statusCode) => (
                      <TableRow
                        key={statusCode?._id || Math.random()}
                        hover
                        sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                            {statusCode?.code || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300 }}>
                            {statusCode?.description || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusCode?.category || 'Unknown'}
                            color={getCategoryColor(statusCode?.category)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.813rem' }}>
                            {statusCode?.nextActionTrigger || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusCode?.responsible || 'Unknown'}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.813rem', color: '#666' }}>
                            {statusCode?.autoEscalationLogic || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog('edit', statusCode)}
                                sx={{
                                  color: '#1976D2',
                                  '&:hover': { backgroundColor: '#E3F2FD' }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteStatusCode(statusCode?._id)}
                                disabled={!statusCode?._id}
                                sx={{
                                  color: '#D32F2F',
                                  '&:hover': { backgroundColor: '#FFEBEE' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalRecords}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              sx={{ borderTop: '1px solid #E0E0E0', mt: 0 }}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          {dialogMode === 'add' ? 'Add New Status Code' : 'Edit Status Code'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Status Code *"
                value={formData.code}
                onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                disabled={dialogMode === 'edit'}
                placeholder="e.g., PTP, CB, PAID"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  label="Category *"
                >
                  <MenuItem value="Positive">Positive</MenuItem>
                  <MenuItem value="Neutral">Neutral</MenuItem>
                  <MenuItem value="Negative">Negative</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={2}
                placeholder="Describe the status code..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Next Action Trigger *"
                value={formData.nextActionTrigger}
                onChange={(e) => handleFormChange('nextActionTrigger', e.target.value)}
                multiline
                rows={2}
                placeholder="What action should be triggered?"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Responsible *"
                value={formData.responsible}
                onChange={(e) => handleFormChange('responsible', e.target.value)}
                placeholder="e.g., Telecaller, TL, Manager"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Auto Escalation Logic"
                value={formData.autoEscalationLogic}
                onChange={(e) => handleFormChange('autoEscalationLogic', e.target.value)}
                placeholder="Optional escalation rules"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveStatusCode}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6a3f8f 100%)'
              }
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StatusCode;
