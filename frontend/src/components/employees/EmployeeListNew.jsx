import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import { employeeAPI } from '../../services/api';

const EmployeeListNew = () => {
  const navigate = useNavigate();
  
  // State management
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [orderBy, setOrderBy] = useState('employeeCode');
  const [order, setOrder] = useState('asc');
  
  // Summary statistics
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0
  });

  // Load employees data
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
        sortBy: orderBy,
        sortOrder: order
      };

      console.log('📡 Fetching employees with params:', params);
      const response = await employeeAPI.getEmployees(params);
      
      console.log('✅ Employees loaded:', response.data?.length, 'records');
      setEmployees(response.data || []);
      setTotalRecords(response.pagination?.totalRecords || 0);

    } catch (err) {
      console.error('❌ Error loading employees:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Load summary statistics
  const loadSummary = async () => {
    try {
      console.log('📊 Fetching employee summary...');
      const response = await employeeAPI.getSummary();
      console.log('✅ Summary loaded:', response.data);
      setSummary(response.data || {});
    } catch (err) {
      console.error('❌ Error loading summary:', err);
    }
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadEmployees();
  }, [page, rowsPerPage, searchQuery, orderBy, order]);

  useEffect(() => {
    loadSummary();
  }, []);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setSearchQuery(value);
      setPage(0); // Reset to first page on search
    }, 500),
    []
  );

  // Handle search input
  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle actions
  const handleView = (id) => {
    navigate(`/employees/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/employees/${id}/edit`);
  };

  const handleDelete = async (id, employeeName) => {
    if (window.confirm(`Are you sure you want to delete employee: ${employeeName}?`)) {
      try {
        await employeeAPI.deleteEmployee(id);
        loadEmployees();
        loadSummary();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'confirmed':
      case 'working':
        return 'success';
      case 'inactive':
      case 'resigned':
        return 'default';
      case 'terminated':
        return 'error';
      case 'on leave':
        return 'warning';
      case 'probation':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get employment status badge color
  const getEmploymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'working':
      case 'permanent':
        return 'success';
      case 'contract':
      case 'temporary':
        return 'warning';
      case 'intern':
        return 'info';
      case 'consultant':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === '-') return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  // Format field values (handle null/undefined)
  const formatValue = (value, defaultValue = '-') => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon sx={{ fontSize: 32 }} color="primary" />
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/employees/new')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6a3f8f 100%)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
            }
          }}
        >
          Add New Employee
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Employees
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {summary.totalEmployees}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Active Employees
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {summary.activeEmployees}
                  </Typography>
                </Box>
                <PersonAddIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            color: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(248, 113, 113, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Inactive Employees
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {summary.inactiveEmployees}
                  </Typography>
                </Box>
                <PersonOffIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: '12px' }}>
        <TextField
          fullWidth
          placeholder="Search by Employee Code, Name, Email, Phone..."
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }}
        />
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'employeeCode'}
                    direction={orderBy === 'employeeCode' ? order : 'asc'}
                    onClick={() => handleRequestSort('employeeCode')}
                  >
                    Employee Code
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'designation'}
                    direction={orderBy === 'designation' ? order : 'asc'}
                    onClick={() => handleRequestSort('designation')}
                  >
                    Designation
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'employmentStatus'}
                    direction={orderBy === 'employmentStatus' ? order : 'asc'}
                    onClick={() => handleRequestSort('employmentStatus')}
                  >
                    Employment Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading employees...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No employees found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Try adjusting your search' : 'Add your first employee to get started'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow
                    key={employee._id}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: '#F8F9FA' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatValue(employee.employeeCode)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: employee.isActive ? '#4ade80' : '#9ca3af',
                            width: 36,
                            height: 36,
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}
                        >
                          {getInitials(employee.name)}
                        </Avatar>
                        <Typography variant="body2">
                          {formatValue(employee.name)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatValue(employee.designation)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatValue(employee.branch)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatValue(employee.contactNumber)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatValue(employee.employmentStatus, 'Unknown')}
                        color={getEmploymentStatusColor(employee.employmentStatus)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatValue(employee.status, 'Unknown')}
                        color={getStatusColor(employee.status)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleView(employee._id)}
                            color="primary"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(employee._id)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(employee._id, employee.name)}
                            color="error"
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

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default EmployeeListNew;
