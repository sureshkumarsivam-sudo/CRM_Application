import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import Layout from './components/Layout';
import CustomersPageSimple from './components/customers/CustomersPageSimple';
import CustomerDetail from './components/customers/CustomerDetail';
import CustomerForm from './components/customers/CustomerForm';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomersPageSimple />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          <Route path="/employees" element={<Typography>Employee Management Coming Soon</Typography>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Box>
  );
}

export default App;