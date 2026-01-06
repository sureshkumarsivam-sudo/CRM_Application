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
  Chip,
  Button,
  Alert,
  AlertTitle,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Notifications as NotificationsIcon,
  Lock as LockIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingUpIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { format, addDays, isAfter, differenceInDays } from 'date-fns';

/**
 * Payment Monitoring Component
 * Handles automatic payment tracking for settlement and closure proposals
 * with grace period management and status updates
 */
const PaymentMonitoring = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalActive: 0,
    onSchedule: 0,
    overdue: 0,
    completed: 0,
    broken: 0,
  });

  useEffect(() => {
    loadMonitoringData();
    // Set up interval to check payments every hour
    const interval = setInterval(checkPaymentStatus, 3600000); // 1 hour
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      // Fetch all active proposals with installment plans
      const response = await fetch('/api/settlements/monitoring');
      const data = await response.json();
      
      // Process each proposal to determine current status
      const processedData = data.map(proposal => ({
        ...proposal,
        installments: checkInstallmentStatus(proposal.installments),
        overallStatus: calculateOverallStatus(proposal),
      }));
      
      setProposals(processedData);
      calculateStats(processedData);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check installment status with 5-day grace period
   */
  const checkInstallmentStatus = (installments) => {
    const today = new Date();
    
    return installments.map(installment => {
      const dueDate = new Date(installment.dueDate);
      const gracePeriodEnd = addDays(dueDate, 5);
      const isPaid = installment.status === 'PAID';
      
      let status = 'SCHEDULED';
      let statusColor = 'default';
      let daysOverdue = 0;
      
      if (isPaid) {
        status = 'PAID';
        statusColor = 'success';
      } else if (isAfter(today, gracePeriodEnd)) {
        // Payment is overdue (past due date + 5 days)
        status = 'OVERDUE';
        statusColor = 'error';
        daysOverdue = differenceInDays(today, gracePeriodEnd);
      } else if (isAfter(today, dueDate)) {
        // Within grace period
        status = 'GRACE_PERIOD';
        statusColor = 'warning';
        daysOverdue = differenceInDays(today, dueDate);
      }
      
      return {
        ...installment,
        status,
        statusColor,
        daysOverdue,
        gracePeriodEnd,
      };
    });
  };

  /**
   * Calculate overall proposal status
   */
  const calculateOverallStatus = (proposal) => {
    const installments = proposal.installments || [];
    const totalInstallments = installments.length;
    const paidInstallments = installments.filter(i => i.status === 'PAID').length;
    const overdueInstallments = installments.filter(i => i.status === 'OVERDUE').length;
    
    if (overdueInstallments > 0) {
      return {
        status: 'BROKEN',
        label: proposal.proposalType === 'SETTLEMENT' ? 'BROKEN SETTLEMENT ❌' : 'INVALID PROPOSAL ❌',
        color: 'error',
        icon: <CancelIcon />,
        message: '⚠️ BROKEN SETTLEMENT - Payment Overdue',
      };
    }
    
    if (paidInstallments === totalInstallments && totalInstallments > 0) {
      return {
        status: 'COMPLETED',
        label: proposal.proposalType === 'SETTLEMENT' ? 'SETTLEMENT DONE ✓' : 'CLOSED ✓',
        color: 'success',
        icon: <CheckCircleIcon />,
        message: 'Settlement Complete - All Payments Received',
      };
    }
    
    return {
      status: 'ACTIVE',
      label: 'ACTIVE - IN PROGRESS',
      color: 'primary',
      icon: <TrendingUpIcon />,
      message: `${paidInstallments}/${totalInstallments} Installments Paid`,
    };
  };

  /**
   * Calculate dashboard statistics
   */
  const calculateStats = (data) => {
    const stats = {
      totalActive: data.filter(p => ['ACTIVE', 'GRACE_PERIOD'].includes(p.overallStatus?.status)).length,
      onSchedule: data.filter(p => p.overallStatus?.status === 'ACTIVE').length,
      overdue: data.filter(p => {
        const hasOverdue = p.installments?.some(i => i.status === 'OVERDUE');
        return hasOverdue;
      }).length,
      completed: data.filter(p => p.overallStatus?.status === 'COMPLETED').length,
      broken: data.filter(p => p.overallStatus?.status === 'BROKEN').length,
    };
    setStats(stats);
  };

  /**
   * Check payment status and send notifications
   */
  const checkPaymentStatus = async () => {
    try {
      const response = await fetch('/api/settlements/check-payments', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.overdueFound) {
        // Trigger notifications for overdue payments
        sendOverdueNotifications(result.overdueProposals);
      }
      
      // Reload data to reflect status changes
      loadMonitoringData();
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  /**
   * Send overdue notifications
   */
  const sendOverdueNotifications = async (overdueProposals) => {
    for (const proposal of overdueProposals) {
      await fetch('/api/notifications/overdue-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal._id,
          letterId: proposal.letterId,
          customerName: proposal.customerName,
          recipients: [proposal.manager, proposal.initiator],
          subject: 'Overdue Payment – Proposal Broken',
          message: `
            ⚠️ OVERDUE PAYMENT ALERT
            
            Letter ID: ${proposal.letterId}
            Customer: ${proposal.customerName}
            Account: ${proposal.loanId}
            Proposal Type: ${proposal.proposalType}
            
            One or more installments are overdue (past due date + 5-day grace period).
            
            Status: BROKEN SETTLEMENT ❌
            
            Action Required: User must cancel the existing letter to raise a new proposal.
            
            Account Status: LOCKED (Remains locked until issue is resolved)
          `,
        }),
      });
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  /**
   * Get status chip styling
   */
  const getStatusChip = (installment) => {
    const statusConfig = {
      PAID: { label: '✓ Paid', color: 'success', icon: <CheckCircleIcon /> },
      SCHEDULED: { label: 'Scheduled', color: 'default', icon: <ScheduleIcon /> },
      GRACE_PERIOD: { label: `Grace Period (${installment.daysOverdue}d)`, color: 'warning', icon: <WarningIcon /> },
      OVERDUE: { label: `Overdue (${installment.daysOverdue}d)`, color: 'error', icon: <ErrorIcon /> },
    };
    
    const config = statusConfig[installment.status] || statusConfig.SCHEDULED;
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  /**
   * View proposal details
   */
  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setDetailsDialogOpen(true);
  };

  /**
   * Generate NOC/NDC Letter
   */
  const handleGenerateLetter = async (proposal) => {
    try {
      const letterType = proposal.proposalType === 'SETTLEMENT' ? 'NOC' : 'NDC';
      await fetch('/api/letters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal._id,
          letterType,
          customerId: proposal.customerId,
        }),
      });
      
      alert(`${letterType} Letter generated successfully`);
    } catch (error) {
      console.error('Error generating letter:', error);
      alert('Failed to generate letter');
    }
  };

  return (
    <Box sx={{ p: 3, width: '100%', height: '100%', background: '#F7F9FC', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A237E' }}>
          Automatic Payment Monitoring
        </Typography>
        <Button
          variant="contained"
          startIcon={<NotificationsIcon />}
          onClick={checkPaymentStatus}
          sx={{
            backgroundColor: '#1976D2',
            '&:hover': { backgroundColor: '#1565C0' },
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Check Status Now
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#0D47A1', fontSize: '0.75rem', fontWeight: 600 }}>
                    TOTAL ACTIVE
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565C0' }}>
                    {stats.totalActive}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: '#1565C0', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#01579B', fontSize: '0.75rem', fontWeight: 600 }}>
                    ON SCHEDULE
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0277BD' }}>
                    {stats.onSchedule}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#0277BD', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#004D40', fontSize: '0.75rem', fontWeight: 600 }}>
                    OVERDUE
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#00695C' }}>
                    {stats.overdue}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, color: '#00695C', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#283593', fontSize: '0.75rem', fontWeight: 600 }}>
                    COMPLETED
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#3949AB' }}>
                    {stats.completed}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#3949AB', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#006064', fontSize: '0.75rem', fontWeight: 600 }}>
                    BROKEN
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#00838F' }}>
                    {stats.broken}
                  </Typography>
                </Box>
                <CancelIcon sx={{ fontSize: 48, color: '#00838F', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Proposals Table */}
      <Paper sx={{ 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        backgroundColor: 'white',
        border: '1px solid #E0E0E0'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', borderBottom: '2px solid #E0E0E0' }}>
                <TableCell sx={{ fontWeight: 600, color: '#424242', fontSize: '0.875rem', py: 2 }}>Letter ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', fontSize: '0.875rem' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', fontSize: '0.875rem' }}>Account</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', fontSize: '0.875rem' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', fontSize: '0.875rem' }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', fontSize: '0.875rem' }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', fontSize: '0.875rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', fontSize: '0.875rem' }}>Account Lock</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#424242', fontSize: '0.875rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proposals.map((proposal) => {
                const paidCount = proposal.installments?.filter(i => i.status === 'PAID').length || 0;
                const totalCount = proposal.installments?.length || 0;
                const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
                
                return (
                  <TableRow 
                    key={proposal._id}
                    sx={{
                      '&:hover': { backgroundColor: '#F5F5F5' },
                      backgroundColor: proposal.overallStatus?.status === 'BROKEN' ? '#FFEBEE' : 'inherit',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#1976D2' }}>
                      {proposal.letterId}
                    </TableCell>
                    <TableCell>{proposal.customerName}</TableCell>
                    <TableCell>{proposal.loanId}</TableCell>
                    <TableCell>
                      <Chip 
                        label={proposal.proposalType} 
                        size="small" 
                        color={proposal.proposalType === 'SETTLEMENT' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {formatCurrency(proposal.proposedAmount)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1, minWidth: 80 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#E0E0E0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: proposal.overallStatus?.status === 'BROKEN' ? '#D32F2F' : '#4CAF50',
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {paidCount}/{totalCount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={proposal.overallStatus?.label}
                        color={proposal.overallStatus?.color}
                        icon={proposal.overallStatus?.icon}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<LockIcon />}
                        label="LOCKED"
                        size="small"
                        sx={{ backgroundColor: '#FFE0B2', color: '#E65100', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(proposal)}
                            sx={{ color: '#1976D2' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {proposal.overallStatus?.status === 'COMPLETED' && (
                          <Tooltip title={`Generate ${proposal.proposalType === 'SETTLEMENT' ? 'NOC' : 'NDC'}`}>
                            <IconButton
                              size="small"
                              onClick={() => handleGenerateLetter(proposal)}
                              sx={{ color: '#4CAF50' }}
                            >
                              <DescriptionIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', 
          borderBottom: '2px solid #E0E0E0',
          fontWeight: 600
        }}>
          Payment Schedule Details - {selectedProposal?.letterId}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedProposal && (
            <Box>
              {/* Status Alert */}
              {selectedProposal.overallStatus?.status === 'BROKEN' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <AlertTitle sx={{ fontWeight: 700 }}>⚠️ BROKEN SETTLEMENT</AlertTitle>
                  One or more payments are overdue. The proposal is marked as BROKEN.
                  <br />
                  <strong>Action Required:</strong> User must cancel the existing letter to raise a new proposal.
                  <br />
                  <strong>Account Status:</strong> LOCKED (Remains locked until issue is resolved)
                </Alert>
              )}
              
              {selectedProposal.overallStatus?.status === 'COMPLETED' && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <AlertTitle sx={{ fontWeight: 700 }}>Settlement Complete ✓</AlertTitle>
                  All installments have been paid successfully!
                  <br />
                  <strong>Account Status:</strong> LOCKED
                  <br />
                  <strong>Next Action:</strong> Generate {selectedProposal.proposalType === 'SETTLEMENT' ? 'NOC' : 'NDC'} letter
                </Alert>
              )}

              {/* Customer Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Customer Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedProposal.customerName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Account Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedProposal.loanId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Proposal Type</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedProposal.proposalType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Total Amount</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatCurrency(selectedProposal.proposedAmount)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Installment Details */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Installment Schedule
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Payment Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Grace Period Ends</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedProposal.installments?.map((installment, index) => (
                      <TableRow 
                        key={index}
                        sx={{
                          backgroundColor: installment.status === 'OVERDUE' ? '#FFEBEE' : 
                                         installment.status === 'PAID' ? '#E8F5E9' : 'inherit'
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarTodayIcon fontSize="small" sx={{ color: '#757575' }} />
                            {format(new Date(installment.dueDate), 'dd MMM yyyy')}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {formatCurrency(installment.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusChip(installment)}
                        </TableCell>
                        <TableCell>
                          {installment.status === 'PAID' && installment.paidDate ? (
                            <Box sx={{ color: '#4CAF50', fontWeight: 600 }}>
                              Payment Received on {format(new Date(installment.paidDate), 'dd MMM yyyy')} – ✓ Paid
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Not paid yet
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {!installment.status === 'PAID' && (
                            <Typography variant="caption" color="textSecondary">
                              {format(installment.gracePeriodEnd, 'dd MMM yyyy')}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsDialogOpen(false)} sx={{ color: '#666' }}>
            Close
          </Button>
          {selectedProposal?.overallStatus?.status === 'COMPLETED' && (
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              onClick={() => handleGenerateLetter(selectedProposal)}
              sx={{
                backgroundColor: '#4CAF50',
                '&:hover': { backgroundColor: '#388E3C' },
              }}
            >
              Generate {selectedProposal.proposalType === 'SETTLEMENT' ? 'NOC' : 'NDC'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentMonitoring;
