import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import dayjs from 'dayjs';

import { useEmployees, useDeleteEmployee, useBulkDeleteEmployees, useEmployeeFilterOptions } from '../../hooks/useEmployees';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const deleteEmployeeMutation = useDeleteEmployee();
  const bulkDeleteMutation = useBulkDeleteEmployees();

  // Build query parameters
  const queryParams = useMemo(() => ({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchTerm,
    status: statusFilter,
    department: departmentFilter,
    branch: branchFilter,
  }), [paginationModel, searchTerm, statusFilter, departmentFilter, branchFilter]);

  // Fetch employees
  const { data, isLoading, error } = useEmployees(queryParams);
  
  // Fetch filter options
  const { data: filterOptions } = useEmployeeFilterOptions();

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchTerm(value), 500),
    []
  );

  // Handle search input
  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : '-';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'Terminated': return 'error';
      case 'On Leave': return 'warning';
      case 'Probation': return 'info';
      default: return 'default';
    }
  };

  // Handle row actions
  const handleView = (id) => {
    navigate(`/employees/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/employees/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await deleteEmployeeMutation.mutateAsync(id);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} employees?`)) {
      await bulkDeleteMutation.mutateAsync(selectedRows);
      setSelectedRows([]);
    }
  };

  // Define columns
  const columns = [
    {
      field: 'empCode',
      headerName: 'Employee Code',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
    },
    {
      field: 'designation',
      headerName: 'Designation',
      width: 150,
    },
    {
      field: 'branch',
      headerName: 'Branch',
      width: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'doj',
      headerName: 'Date of Joining',
      width: 130,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'experience',
      headerName: 'Experience',
      width: 100,
      renderCell: (params) => `${params.value || 0} yrs`,
    },
    {
      field: 'salaryOffered',
      headerName: 'Salary',
      width: 120,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: 'contactNumber',
      headerName: 'Contact',
      width: 130,
    },
    {
      field: 'officialEmailId',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={() => handleView(params.row._id)}
              color="primary"
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row._id)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row._id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Prepare rows data
  const rows = data?.data?.map((employee) => ({
    ...employee,
    id: employee._id,
  })) || [];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading employees: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/employees/new')}
        >
          Add Employee
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search employees..."
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions?.data?.statuses?.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions?.data?.departments?.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Branch</InputLabel>
              <Select
                value={branchFilter}
                label="Branch"
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions?.data?.branches?.map((branch) => (
                  <MenuItem key={branch} value={branch}>
                    {branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            {selectedRows.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isLoading}
              >
                Delete ({selectedRows.length})
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={data?.pagination?.totalRecords || 0}
          paginationMode="server"
          loading={isLoading}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => {
            setSelectedRows(newSelection);
          }}
          rowSelectionModel={selectedRows}
          slots={{
            loadingOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Skeleton variant="rectangular" width="100%" height={400} />
              </Box>
            ),
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No employees found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || statusFilter || departmentFilter || branchFilter
                    ? 'Try adjusting your search filters'
                    : 'Add your first employee to get started'
                  }
                </Typography>
              </Box>
            ),
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </Paper>

      {/* Loading and Error States */}
      {(deleteEmployeeMutation.isLoading || bulkDeleteMutation.isLoading) && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Processing deletion...
        </Alert>
      )}
    </Box>
  );
};

export default EmployeeList;