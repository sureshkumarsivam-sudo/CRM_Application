import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TableSortLabel,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const SettlementDashboard = ({ dashboardStats }) => {
  const [orderBy, setOrderBy] = useState('proposalDate');
  const [order, setOrder] = useState('desc');

  if (!dashboardStats) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  const { statusDistribution, monthlyTrends, recentProposals } = dashboardStats;

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedProposals = [...recentProposals].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];
    
    if (orderBy === 'proposalDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  // Prepare pie chart data
  const pieData = statusDistribution.map(item => ({
    name: item._id,
    value: item.count
  }));

  const COLORS = ['#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#C62828', '#0097A7', '#FBC02D', '#5D4037'];

  // Prepare bar chart data for monthly trends
  const barData = monthlyTrends.map(item => ({
    month: `${item._id.month}/${item._id.year}`,
    count: item.count
  }));

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Proposal Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1A237E' }}>
              Proposal Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Proposal Trends */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1A237E' }}>
              Monthly Proposal Trends
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1976D2" name="Proposals" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Proposals */}
      <Paper sx={{ p: 3, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1A237E' }}>
          Recent Proposals
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)', color: '#1A237E', fontWeight: 'bold', fontSize: '14px' }}>
                  <TableSortLabel
                    active={orderBy === 'letterId'}
                    direction={orderBy === 'letterId' ? order : 'asc'}
                    onClick={() => handleRequestSort('letterId')}
                    sx={{ color: '#1A237E !important', '& .MuiTableSortLabel-icon': { color: '#1A237E !important' } }}
                  >
                    Letter ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)', color: '#1A237E', fontWeight: 'bold', fontSize: '14px' }}>
                  <TableSortLabel
                    active={orderBy === 'accountNumber'}
                    direction={orderBy === 'accountNumber' ? order : 'asc'}
                    onClick={() => handleRequestSort('accountNumber')}
                    sx={{ color: '#1A237E !important', '& .MuiTableSortLabel-icon': { color: '#1A237E !important' } }}
                  >
                    Loan Account Number
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)', color: '#1A237E', fontWeight: 'bold', fontSize: '14px' }}>
                  <TableSortLabel
                    active={orderBy === 'customerName'}
                    direction={orderBy === 'customerName' ? order : 'asc'}
                    onClick={() => handleRequestSort('customerName')}
                    sx={{ color: '#1A237E !important', '& .MuiTableSortLabel-icon': { color: '#1A237E !important' } }}
                  >
                    Customer Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)', color: '#1A237E', fontWeight: 'bold', fontSize: '14px' }}>
                  <TableSortLabel
                    active={orderBy === 'proposalType'}
                    direction={orderBy === 'proposalType' ? order : 'asc'}
                    onClick={() => handleRequestSort('proposalType')}
                    sx={{ color: '#1A237E !important', '& .MuiTableSortLabel-icon': { color: '#1A237E !important' } }}
                  >
                    Proposal Type
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)', color: '#1A237E', fontWeight: 'bold', fontSize: '14px' }}>
                  <TableSortLabel
                    active={orderBy === 'proposalDate'}
                    direction={orderBy === 'proposalDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('proposalDate')}
                    sx={{ color: '#1A237E !important', '& .MuiTableSortLabel-icon': { color: '#1A237E !important' } }}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)', color: '#1A237E', fontWeight: 'bold', fontSize: '14px' }} align="right">
                  <TableSortLabel
                    active={orderBy === 'proposedAmount'}
                    direction={orderBy === 'proposedAmount' ? order : 'asc'}
                    onClick={() => handleRequestSort('proposedAmount')}
                    sx={{ color: '#1A237E !important', '& .MuiTableSortLabel-icon': { color: '#1A237E !important' } }}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProposals.map((proposal, index) => (
                <TableRow 
                  key={proposal._id}
                  sx={{ 
                    '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.05)' },
                    backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                  }}
                >
                  <TableCell sx={{ fontSize: '0.95rem' }}>{proposal.letterId}</TableCell>
                  <TableCell sx={{ fontSize: '0.95rem', fontWeight: 500 }}>{proposal.accountNumber || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.95rem' }}>{proposal.customerName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={proposal.proposalType}
                      size="small"
                      sx={{ 
                        backgroundColor: proposal.proposalType === 'Settlement' ? '#FFAB40' : '#FFB74D',
                        color: '#1A237E',
                        fontWeight: 'bold',
                        minWidth: 100
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.95rem' }}>{new Date(proposal.proposalDate).toLocaleDateString()}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                    ₹{(proposal.proposedAmount || 0).toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SettlementDashboard;
