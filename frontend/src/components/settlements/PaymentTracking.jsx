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
  Chip,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Divider,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import SettlementService from '../../services/SettlementService';

const PaymentTracking = () => {
  const [settlements, setSettlements] = useState([]);
  const [filteredSettlements, setFilteredSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [summaryStats, setSummaryStats] = useState({
    totalAmountDue: 0,
    totalAmountReceived: 0,
    onTrackCount: 0,
    dueSoonCount: 0,
    overdueCount: 0
  });

  const GRACE_PERIOD_DAYS = 5; // Default grace period

  useEffect(() => {
    loadApprovedSettlements();
  }, []);

  useEffect(() => {
    applySearch();
  }, [searchQuery, settlements]);

  useEffect(() => {
    calculateSummaryStats();
  }, [filteredSettlements]);

  const loadApprovedSettlements = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching Active settlements with installment tracking...');
      
      const response = await SettlementService.getProposals({
        status: 'Active',
        limit: 1000
      });

      if (!response || !response.proposals) {
        setSettlements([]);
        setFilteredSettlements([]);
        return;
      }

      const proposals = response.proposals;
      console.log(`✅ Found ${proposals.length} Active settlements`);

      // Map and calculate overdue status
      const mappedSettlements = proposals.map(proposal => {
        const installments = (proposal.installments || []).map((inst) => {
          const dueDate = new Date(inst.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);

          const gracePeriodEnd = new Date(dueDate);
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

          const isPaid = inst.status === 'Paid' || inst.status === 'PAID';
          
          let status = 'Pending';
          let statusIndicator = '🟢'; // Green = On Track
          
          if (isPaid) {
            status = 'Paid';
            statusIndicator = '✅';
          } else {
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            if (today > gracePeriodEnd) {
              status = 'Overdue';
              statusIndicator = '🔴'; // Red = Overdue
            } else if (today > dueDate && today <= gracePeriodEnd) {
              status = 'Grace Period';
              statusIndicator = '🟡'; // Yellow = Grace Period
            } else if (daysUntilDue <= 2 && daysUntilDue >= 0) {
              status = 'Due Soon';
              statusIndicator = '🟡'; // Yellow = Due Soon
            }
          }

          return {
            installmentNo: inst.installmentNumber,
            amount: inst.amount || 0,
            dueDate: inst.dueDate || null,
            status: status,
            statusIndicator: statusIndicator,
            paidDate: inst.paidDate || null,
            paidAmount: isPaid ? inst.amount : 0,
            isOverdue: status === 'Overdue',
            isDueSoon: status === 'Due Soon',
            isGracePeriod: status === 'Grace Period'
          };
        });

        // Check if any installment is overdue
        const hasOverdue = installments.some(i => i.isOverdue);
        
        return {
          _id: proposal._id,
          customerName: proposal.customerName || 'N/A',
          loanId: proposal.accountNumber || 'N/A',
          settlementId: proposal.letterId || proposal._id,
          proposalStatus: hasOverdue ? 'BROKEN SETTLEMENT ❌' : proposal.status,
          totalSettlementAmount: proposal.proposedAmount || 0,
          totalOutstanding: proposal.totalOutstanding || 0,
          installments: installments,
          accountLocked: hasOverdue ? true : proposal.accountLocked
        };
      });

      setSettlements(mappedSettlements);
      setFilteredSettlements(mappedSettlements);
    } catch (err) {
      console.error('❌ Error loading settlements:', err);
      setError('Failed to load approved settlements. Please try again.');
      setSettlements([]);
      setFilteredSettlements([]);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredSettlements(settlements);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = settlements.filter(settlement =>
      settlement.customerName.toLowerCase().includes(query) ||
      settlement.loanId.toLowerCase().includes(query) ||
      settlement.settlementId.toLowerCase().includes(query)
    );
    setFilteredSettlements(filtered);
  };

  const calculateSummaryStats = () => {
    let totalDue = 0;
    let totalReceived = 0;
    let onTrack = 0;
    let dueSoon = 0;
    let overdue = 0;

    filteredSettlements.forEach(settlement => {
      settlement.installments.forEach(inst => {
        totalDue += inst.amount;
        totalReceived += inst.paidAmount;

        if (inst.status === 'Paid') {
          onTrack++;
        } else if (inst.isOverdue) {
          overdue++;
        } else if (inst.isDueSoon || inst.isGracePeriod) {
          dueSoon++;
        } else {
          onTrack++;
        }
      });
    });

    setSummaryStats({
      totalAmountDue: totalDue,
      totalAmountReceived: totalReceived,
      onTrackCount: onTrack,
      dueSoonCount: dueSoon,
      overdueCount: overdue
    });
  };

  const handleMarkAsPaid = async (settlementId, installmentNo) => {
    try {
      setLoading(true);
      console.log(`🔄 Marking installment ${installmentNo} as paid for settlement ${settlementId}`);
      
      // API call to mark installment as paid
      const response = await SettlementService.markInstallmentPaid(settlementId, installmentNo);
      
      console.log('✅ Installment marked as paid successfully');
      console.log('Response:', response);

      // Update local state
      const updatedSettlements = settlements.map(settlement => {
        if (settlement._id === settlementId) {
          return {
            ...settlement,
            installments: settlement.installments.map(inst => {
              if (inst.installmentNo === installmentNo) {
                return {
                  ...inst,
                  status: 'Paid',
                  statusIndicator: '✅',
                  paidDate: new Date().toISOString().split('T')[0],
                  paidAmount: inst.amount
                };
              }
              return inst;
            })
          };
        }
        return settlement;
      });

      setSettlements(updatedSettlements);
      setFilteredSettlements(updatedSettlements.filter(s => 
        !searchQuery.trim() || 
        s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.loanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.settlementId.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      // Display success message with account status update if available
      let successMessage = `Installment ${installmentNo} marked as paid successfully`;
      if (response?.accountStatusUpdated && response?.newAccountStatus) {
        successMessage += ` | Account status updated to: ${response.newAccountStatus}`;
      }
      
      setSuccess(successMessage);
      setTimeout(() => setSuccess(null), 5000);
      
      // Reload settlements to get updated data
      setTimeout(() => {
        loadApprovedSettlements();
      }, 1000);
    } catch (err) {
      console.error('❌ Error marking installment as paid:', err);
      console.error('   Message:', err.message);
      console.error('   Response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to mark installment as paid');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Paid': '#4CAF50',
      'Pending': '#2196F3',
      'Due Soon': '#FFC107',
      'Grace Period': '#FF9800',
      'Overdue': '#F44336'
    };
    return colors[status] || '#757575';
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'Paid': '#E8F5E9',
      'Pending': '#E3F2FD',
      'Due Soon': '#FFF9C4',
      'Grace Period': '#FFE0B2',
      'Overdue': '#FFEBEE'
    };
    return colors[status] || '#F5F5F5';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Payment Tracking Dashboard Widget */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)', color: 'white', boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                💰 Payment Tracking Dashboard
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={loadApprovedSettlements}
                disabled={loading}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                Check Now
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="caption" sx={{ color: '#0D47A1', textTransform: 'uppercase', fontWeight: 600 }}>
                      Total Amount Due
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565C0', mt: 1 }}>
                      {formatCurrency(summaryStats.totalAmountDue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Typography variant="caption" sx={{ color: '#01579B', textTransform: 'uppercase', fontWeight: 600 }}>
                      Amount Received
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#0277BD', mt: 1 }}>
                      {formatCurrency(summaryStats.totalAmountReceived)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(summaryStats.totalAmountReceived / summaryStats.totalAmountDue) * 100 || 0}
                      sx={{ 
                        mt: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(1, 87, 155, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#0277BD'
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Card sx={{ background: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon sx={{ color: '#00695C', mr: 1 }} />
                      <Typography variant="caption" sx={{ color: '#004D40', fontWeight: 600 }}>
                        On Track
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#00695C' }}>
                      {summaryStats.onTrackCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Card sx={{ background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningIcon sx={{ color: '#3949AB', mr: 1 }} />
                      <Typography variant="caption" sx={{ color: '#283593', fontWeight: 600 }}>
                        Due Soon
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#3949AB' }}>
                      {summaryStats.dueSoonCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Card sx={{ background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ErrorIcon sx={{ color: '#00838F', mr: 1 }} />
                      <Typography variant="caption" sx={{ color: '#006064', fontWeight: 600 }}>
                        Overdue
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#00838F' }}>
                      {summaryStats.overdueCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
              Payment Tracking
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Track installment payments for active settlements
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadApprovedSettlements}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6a3f8f 100%)',
              }
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Search Box */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by customer name, loan ID, or settlement ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666' }} />
              </InputAdornment>
            )
          }}
          sx={{ mb: 3, maxWidth: 600 }}
        />

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

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* No Data State */}
        {!loading && filteredSettlements.length === 0 && (
          <Alert severity="info">
            No active settlements found. Only proposals with status "Active" are displayed here.
          </Alert>
        )}

        {/* Settlement Cards */}
        {!loading && filteredSettlements.length > 0 && (
          <Grid container spacing={3}>
            {filteredSettlements.map((settlement) => (
              <Grid item xs={12} key={settlement._id}>
                <Card 
                  sx={{ 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Customer Profile Box and Status Pill */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: 3
                    }}>
                      {/* Customer Profile Box on Top-Left */}
                      <Box sx={{
                        backgroundColor: '#F8F9FA',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        p: 2,
                        minWidth: 300
                      }}>
                        <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
                          Customer Name
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A', mb: 1.5 }}>
                          {settlement.customerName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
                          STL Number / Reference
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                          {settlement.settlementId}
                        </Typography>
                      </Box>
                      
                      {/* Proposal Status Pill on Top-Right */}
                      <Chip 
                        label={settlement.proposalStatus}
                        sx={{
                          backgroundColor: settlement.proposalStatus === 'Active' ? '#3B82F6' : '#10B981',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          px: 2,
                          py: 2.5,
                          height: 'auto',
                          borderRadius: '20px',
                          boxShadow: settlement.proposalStatus === 'Active' 
                            ? '0 2px 4px rgba(59, 130, 246, 0.3)' 
                            : '0 2px 4px rgba(16, 185, 129, 0.3)'
                        }}
                      />
                    </Box>

                    {/* Settlement Summary Info */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #DBEAFE',
                          borderRadius: '8px',
                          p: 2,
                          textAlign: 'center'
                        }}>
                          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            Loan Account
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#1E40AF', mt: 0.5 }}>
                            {settlement.loanId}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{
                          backgroundColor: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          borderRadius: '8px',
                          p: 2,
                          textAlign: 'center'
                        }}>
                          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            Settlement Amount
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#92400E', mt: 0.5 }}>
                            {formatCurrency(settlement.totalSettlementAmount)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #D1FAE5',
                          borderRadius: '8px',
                          p: 2,
                          textAlign: 'center'
                        }}>
                          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            Installments Paid
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#065F46', mt: 0.5 }}>
                            {settlement.installments.filter(i => i.status === 'Paid').length} / {settlement.installments.length}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '8px',
                          p: 2,
                          textAlign: 'center'
                        }}>
                          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            Pending Installments
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#991B1B', mt: 0.5 }}>
                            {settlement.installments.filter(i => i.status === 'Pending').length}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Installments Table - Matching Screenshot Design */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
                        Installment Details
                      </Typography>
                    </Box>
                    
                    <TableContainer sx={{ 
                      border: '2px solid #E5E7EB',
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ 
                              backgroundColor: '#F9FAFB', 
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              py: 2
                            }}>
                              Installment No
                            </TableCell>
                            <TableCell sx={{ 
                              backgroundColor: '#F9FAFB', 
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              py: 2
                            }}>
                              Amount
                            </TableCell>
                            <TableCell sx={{ 
                              backgroundColor: '#F9FAFB', 
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              py: 2
                            }}>
                              Due Date
                            </TableCell>
                            <TableCell sx={{ 
                              backgroundColor: '#F9FAFB', 
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              py: 2
                            }}>
                              Status
                            </TableCell>
                            <TableCell sx={{ 
                              backgroundColor: '#F9FAFB', 
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              color: '#374151',
                              borderBottom: '2px solid #E5E7EB',
                              py: 2
                            }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {settlement.installments.map((installment) => (
                            <TableRow 
                              key={installment.installmentNo}
                              sx={{
                                '&:hover': { backgroundColor: '#F9FAFB' },
                                borderBottom: '1px solid #E5E7EB'
                              }}
                            >
                              <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', py: 2.5 }}>
                                {installment.installmentNo}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', py: 2.5 }}>
                                {formatCurrency(installment.amount)}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.875rem', color: '#6B7280', py: 2.5 }}>
                                {formatDate(installment.dueDate)}
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography sx={{ fontSize: '1.2rem' }}>
                                    {installment.statusIndicator}
                                  </Typography>
                                  <Chip
                                    label={installment.status}
                                    size="small"
                                    sx={{
                                      backgroundColor: getStatusBgColor(installment.status),
                                      color: getStatusColor(installment.status),
                                      fontWeight: 700,
                                      fontSize: '0.75rem',
                                      borderRadius: '12px',
                                      height: '24px',
                                      px: 1,
                                      border: `1px solid ${getStatusColor(installment.status)}`
                                    }}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2.5 }}>
                                {installment.status !== 'Paid' && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleMarkAsPaid(settlement._id, installment.installmentNo)}
                                    disabled={loading}
                                    sx={{
                                      backgroundColor: '#3B82F6',
                                      color: 'white',
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      fontSize: '0.8rem',
                                      px: 2.5,
                                      py: 0.75,
                                      borderRadius: '8px',
                                      boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)',
                                      '&:hover': {
                                        backgroundColor: '#2563EB',
                                        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.4)'
                                      },
                                      '&:disabled': {
                                        backgroundColor: '#9CA3AF',
                                        color: '#F3F4F6'
                                      }
                                    }}
                                  >
                                    Mark as Paid
                                  </Button>
                                )}
                                {installment.status === 'Paid' && installment.paidDate && (
                                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                                    ✓ Paid on {formatDate(installment.paidDate)}
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentTracking;
