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
} from '@mui/material';
import {
  DataGrid,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import dayjs from 'dayjs';

import { useCustomers } from '../../hooks/useCustomers';

const CustomerListSimple = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  // Build query parameters
  const queryParams = useMemo(() => ({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchTerm,
    status: statusFilter,
    state: stateFilter,
  }), [paginationModel, searchTerm, statusFilter, stateFilter]);

  // Fetch customers
  const { data, isLoading, error } = useCustomers(queryParams);

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

  // Define columns
  const columns = [
    {
      field: 'loanId',
      headerName: 'Loan ID',
      width: 150,
    },
    {
      field: 'accountName',
      headerName: 'Customer Name',
      width: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'mobileNo',
      headerName: 'Mobile',
      width: 130,
    },
    {
      field: 'city',
      headerName: 'City',
      width: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
    },
    {
      field: 'sanctionAmount',
      headerName: 'Sanction Amount',
      width: 150,
      type: 'number',
      renderCell: (params) => formatCurrency(params.value),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Customer Records
        </Typography>
        <Typography>Loading customers...</Typography>
        <Skeleton height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading customers: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Customer Records ({data?.pagination?.totalRecords || 0})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/customers/new')}
        >
          Add Customer
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search customers..."
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <DataGrid
          rows={data?.data || []}
          columns={columns}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          rowCount={data?.pagination?.totalRecords || 0}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{
            height: 600,
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default CustomerListSimple;