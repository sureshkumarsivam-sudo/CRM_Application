import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Tooltip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axios from 'axios';

const CallerFeedbackStatusCodes = () => {
  const [statusCodes, setStatusCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  
  // Sorting state
  const [orderBy, setOrderBy] = useState('code');
  const [order, setOrder] = useState('asc');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    statusName: '',
    description: '',
    nextActionTrigger: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch status codes
  const fetchStatusCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/caller-feedback-status-codes`);
      setStatusCodes(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching caller feedback status codes:', error);
      setError('Failed to fetch status codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusCodes();
  }, []);

  // Filter status codes
  const filteredStatusCodes = statusCodes.filter(code => {
    const matchesSearch = !searchTerm || 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.statusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive === 'all' || 
      (filterActive === 'active' && code.isActive) ||
      (filterActive === 'inactive' && !code.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Apply sorting to filtered data
  const sortedStatusCodes = React.useMemo(() => {
    const comparator = (a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

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

    return [...filteredStatusCodes].sort(comparator);
  }, [filteredStatusCodes, order, orderBy]);

  // Handle form
  const handleOpenDialog = (code = null) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        statusName: code.statusName,
        description: code.description,
        nextActionTrigger: code.nextActionTrigger,
        isActive: code.isActive
      });
    } else {
      setEditingCode(null);
      setFormData({
        code: '',
        statusName: '',
        description: '',
        nextActionTrigger: '',
        isActive: true
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCode(null);
    setFormData({
      code: '',
      statusName: '',
      description: '',
      nextActionTrigger: '',
      isActive: true
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.code.trim()) errors.code = 'Code is required';
    if (!formData.statusName.trim()) errors.statusName = 'Status name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.nextActionTrigger.trim()) errors.nextActionTrigger = 'Next action trigger is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingCode) {
        // Update
        await axios.put(`${API_BASE_URL}/caller-feedback-status-codes/${editingCode._id}`, formData);
      } else {
        // Create
        await axios.post(`${API_BASE_URL}/caller-feedback-status-codes`, formData);
      }
      
      await fetchStatusCodes();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving status code:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to save status code. Please try again.');
      }
    }
  };

  const handleDelete = (code) => {
    setCodeToDelete(code);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/caller-feedback-status-codes/${codeToDelete._id}`);
      await fetchStatusCodes();
      setDeleteConfirmOpen(false);
      setCodeToDelete(null);
    } catch (error) {
      console.error('Error deleting status code:', error);
      setError('Failed to delete status code. Please try again.');
    }
  };

  // Stats
  const stats = {
    total: statusCodes.length,
    active: statusCodes.filter(code => code.isActive).length,
    inactive: statusCodes.filter(code => !code.isActive).length
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon color="primary" />
          <Typography variant="h5" component="h2" fontWeight="bold">
            Caller Feedback Status Codes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Status Code
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Status Codes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {stats.active}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Status Codes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main" fontWeight="bold">
                {stats.inactive}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Inactive Status Codes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by code, name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All Status Codes</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchStatusCodes}
              fullWidth
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'code'}
                  direction={orderBy === 'code' ? order : 'asc'}
                  onClick={() => handleRequestSort('code')}
                >
                  <strong>Code</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'statusName'}
                  direction={orderBy === 'statusName' ? order : 'asc'}
                  onClick={() => handleRequestSort('statusName')}
                >
                  <strong>Status Name</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? order : 'asc'}
                  onClick={() => handleRequestSort('description')}
                >
                  <strong>Description</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'nextActionTrigger'}
                  direction={orderBy === 'nextActionTrigger' ? order : 'asc'}
                  onClick={() => handleRequestSort('nextActionTrigger')}
                >
                  <strong>Next Action/Trigger</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography>Loading status codes...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredStatusCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No status codes found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add Status Code" to create your first status code'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedStatusCodes.map((code) => (
                <TableRow key={code._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {code.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {code.statusName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {code.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {code.nextActionTrigger}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={code.isActive ? 'Active' : 'Inactive'}
                      color={code.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(code)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(code)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon />
          {editingCode ? 'Edit Status Code' : 'Add New Status Code'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                error={!!formErrors.code}
                helperText={formErrors.code}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Status Name"
                value={formData.statusName}
                onChange={(e) => setFormData({ ...formData, statusName: e.target.value })}
                error={!!formErrors.statusName}
                helperText={formErrors.statusName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Next Action/Trigger"
                multiline
                rows={2}
                value={formData.nextActionTrigger}
                onChange={(e) => setFormData({ ...formData, nextActionTrigger: e.target.value })}
                error={!!formErrors.nextActionTrigger}
                helperText={formErrors.nextActionTrigger}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                  label="Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            {editingCode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the status code "{codeToDelete?.code} - {codeToDelete?.statusName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CallerFeedbackStatusCodes;