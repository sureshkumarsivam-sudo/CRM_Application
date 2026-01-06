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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const StatusCodeMatrix = () => {
  const [statusCodes, setStatusCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit'
  const [selectedCode, setSelectedCode] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    code: '',
    statusName: '',
    description: '',
    applicableFor: 'BOTH',
    nextActionTrigger: '',
    priority: 0,
    color: '#FFB84D',
    isActive: true
  });

  useEffect(() => {
    fetchStatusCodes();
  }, []);

  const fetchStatusCodes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/status-code-matrix`);
      setStatusCodes(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch status codes: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, code = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && code) {
      setFormData({
        code: code.code,
        statusName: code.statusName,
        description: code.description,
        applicableFor: code.applicableFor,
        nextActionTrigger: code.nextActionTrigger,
        priority: code.priority,
        color: code.color,
        isActive: code.isActive
      });
      setSelectedCode(code);
    } else {
      setFormData({
        code: '',
        statusName: '',
        description: '',
        applicableFor: 'BOTH',
        nextActionTrigger: '',
        priority: 0,
        color: '#FFB84D',
        isActive: true
      });
      setSelectedCode(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      code: '',
      statusName: '',
      description: '',
      applicableFor: 'BOTH',
      nextActionTrigger: '',
      priority: 0,
      color: '#FFB84D',
      isActive: true
    });
    setSelectedCode(null);
  };

  const handleViewCode = (code) => {
    setSelectedCode(code);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedCode(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (dialogMode === 'add') {
        await axios.post(`${API_BASE_URL}/status-code-matrix`, formData);
        setSuccess('Status code created successfully!');
      } else {
        await axios.put(`${API_BASE_URL}/status-code-matrix/${selectedCode._id}`, formData);
        setSuccess('Status code updated successfully!');
      }
      
      handleCloseDialog();
      fetchStatusCodes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete status code "${code}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await axios.delete(`${API_BASE_URL}/status-code-matrix/${id}`);
      setSuccess('Status code deleted successfully!');
      fetchStatusCodes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Delete failed');
    }
  };

  const getApplicableForChip = (applicableFor) => {
    const colors = {
      'CALLER': '#42A5F5',
      'FIELD_EXECUTIVE': '#66BB6A',
      'BOTH': '#AB47BC'
    };
    
    const labels = {
      'CALLER': 'Caller',
      'FIELD_EXECUTIVE': 'Field Executive',
      'BOTH': 'Both'
    };

    return (
      <Chip 
        label={labels[applicableFor]} 
        size="small" 
        sx={{ 
          backgroundColor: colors[applicableFor],
          color: 'white',
          fontWeight: 600
        }} 
      />
    );
  };

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            📋 Status Code Matrix
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            Manage caller and field executive status codes
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStatusCodes}
            sx={{
              borderColor: '#FFB84D',
              color: '#FF9A56',
              '&:hover': { 
                borderColor: '#FF9A56',
                backgroundColor: '#FFF8F0'
              }
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            sx={{
              backgroundColor: '#FFB84D',
              color: 'white',
              '&:hover': { backgroundColor: '#FF9A56' },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add Status Code
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FFB84D' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Code</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Status Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Applicable For</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Priority</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : statusCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#666' }}>
                    No status codes found. Click "Add Status Code" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                statusCodes.map((code, index) => (
                  <TableRow
                    key={code._id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#FFF9E6' : 'white',
                      '&:hover': { backgroundColor: '#FFE0B2' }
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={code.code} 
                        sx={{ 
                          backgroundColor: code.color,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{code.statusName}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      {code.description.length > 60 
                        ? code.description.substring(0, 60) + '...'
                        : code.description
                      }
                    </TableCell>
                    <TableCell>{getApplicableForChip(code.applicableFor)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={code.priority} 
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={code.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={code.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewCode(code)}
                          sx={{ color: '#42A5F5' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('edit', code)}
                          sx={{ color: '#FFB84D' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(code._id, code.code)}
                          sx={{ color: '#E57373' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ backgroundColor: '#FFB84D', color: 'white', fontWeight: 700 }}>
            {dialogMode === 'add' ? '➕ Add New Status Code' : '✏️ Edit Status Code'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Code *"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  disabled={dialogMode === 'edit'}
                  helperText="e.g., NC, PTP, FV_DONE"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Applicable For</InputLabel>
                  <Select
                    name="applicableFor"
                    value={formData.applicableFor}
                    onChange={handleInputChange}
                    label="Applicable For"
                  >
                    <MenuItem value="CALLER">Caller Only</MenuItem>
                    <MenuItem value="FIELD_EXECUTIVE">Field Executive Only</MenuItem>
                    <MenuItem value="BOTH">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Status Name *"
                  name="statusName"
                  value={formData.statusName}
                  onChange={handleInputChange}
                  required
                  helperText="e.g., Not Connected, Promise to Pay"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description *"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={2}
                  helperText="Detailed description of the status code"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Next Action Trigger *"
                  name="nextActionTrigger"
                  value={formData.nextActionTrigger}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={2}
                  helperText="What should happen next when this status is selected"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Priority"
                  name="priority"
                  type="number"
                  value={formData.priority}
                  onChange={handleInputChange}
                  helperText="Higher = More Important"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="isActive"
                    value={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                    label="Status"
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#FFB84D',
                '&:hover': { backgroundColor: '#FF9A56' }
              }}
            >
              {dialogMode === 'add' ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#42A5F5', color: 'white', fontWeight: 700 }}>
          👁️ Status Code Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedCode && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">Code</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: selectedCode.color }}>
                  {selectedCode.code}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">Status Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedCode.statusName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">Description</Typography>
                <Typography variant="body2">
                  {selectedCode.description}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">Next Action Trigger</Typography>
                <Typography variant="body2" sx={{ color: '#FF9A56', fontWeight: 500 }}>
                  {selectedCode.nextActionTrigger}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Applicable For</Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getApplicableForChip(selectedCode.applicableFor)}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Priority</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedCode.priority}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedCode.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={selectedCode.isActive ? 'success' : 'default'}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Color</Typography>
                <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      backgroundColor: selectedCode.color,
                      borderRadius: 1,
                      border: '1px solid #ddd'
                    }}
                  />
                  <Typography variant="body2">{selectedCode.color}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog} sx={{ color: '#666' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Codes Summary */}
      <Paper sx={{ mt: 3, p: 2, borderRadius: '12px', backgroundColor: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          📊 Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#E3F2FD', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#42A5F5' }}>
                {statusCodes.filter(c => c.applicableFor === 'CALLER' || c.applicableFor === 'BOTH').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">Caller Codes</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#E8F5E9', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#66BB6A' }}>
                {statusCodes.filter(c => c.applicableFor === 'FIELD_EXECUTIVE' || c.applicableFor === 'BOTH').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">Field Executive Codes</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#F3E5F5', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#AB47BC' }}>
                {statusCodes.filter(c => c.applicableFor === 'BOTH').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">Common (Both)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#FFF3E0', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFB84D' }}>
                {statusCodes.filter(c => c.isActive).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">Active Codes</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StatusCodeMatrix;
