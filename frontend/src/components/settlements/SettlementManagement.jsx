import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  List as ListIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  FormatListBulleted as FormatListBulletedIcon,
} from '@mui/icons-material';
import SettlementService from '../../services/SettlementService';

// Import child components
import SettlementDashboard from './SettlementDashboard';
import NewProposal from './NewProposal';
import AllProposals from './AllProposals';
import ApprovalManagement from './ApprovalManagement';
import PaymentTracking from './PaymentTracking';
import GeneratedLetters from './GeneratedLetters';
import SettlementAuditLog from './SettlementAuditLog';
import CancellationManagement from './CancellationManagement';
import AddCancellation from './AddCancellation';

const SettlementManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const stats = await SettlementService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Force refresh when switching to All Proposals tab
    if (newValue === 2) {
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    loadDashboardStats();
    setRefreshKey(prev => prev + 1);
  };

  const tabs = [
    { label: 'Dashboard', icon: <DashboardIcon />, component: SettlementDashboard },
    { label: 'New Proposal', icon: <AddIcon />, component: NewProposal },
    { label: 'All Proposals', icon: <ListIcon />, component: AllProposals },
    { label: 'Approvals', icon: <CheckCircleIcon />, component: ApprovalManagement },
    { label: 'Add Cancellation', icon: <CancelIcon />, component: AddCancellation },
    { label: 'Cancellations', icon: <CancelIcon />, component: CancellationManagement },
    { label: 'Payment Tracking', icon: <PaymentIcon />, component: PaymentTracking },
    { label: 'Letters', icon: <DescriptionIcon />, component: GeneratedLetters },
    { label: 'Audit Log', icon: <HistoryIcon />, component: SettlementAuditLog },
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 600,
          color: '#5B9BD5',
          mb: 1 
        }}>
          Settlement & Closure Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage settlement and closure proposals for Debtrix CRM
        </Typography>
      </Box>

      {/* Dashboard Summary Cards - Always visible at the top */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : dashboardStats && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mb: 1,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    display: 'block',
                    opacity: 0.95
                  }}
                >
                  Total Proposals
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '1.8rem'
                  }}
                >
                  {dashboardStats.summary.totalProposals}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(17, 153, 142, 0.4)',
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mb: 1,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    display: 'block',
                    opacity: 0.95
                  }}
                >
                  Pending Approval
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '1.8rem'
                  }}
                >
                  {dashboardStats.summary.pendingApproval}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.4)',
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mb: 1,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    display: 'block',
                    opacity: 0.95
                  }}
                >
                  Active Plans
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '1.8rem'
                  }}
                >
                  {dashboardStats.summary.activePlans}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.4)',
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mb: 1,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    display: 'block',
                    opacity: 0.95
                  }}
                >
                  Total Waiver
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '1.8rem'
                  }}
                >
                  {SettlementService.formatCurrency(dashboardStats.summary.totalWaiverAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(250, 112, 154, 0.4)',
              height: '100%'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mb: 1,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    display: 'block',
                    opacity: 0.95
                  }}
                >
                  Average Waiver %
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '1.8rem'
                  }}
                >
                  {dashboardStats.summary.averageWaiverPercentage}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              color: '#546E7A',
            },
            '& .Mui-selected': {
              color: '#5B9BD5 !important',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#5B9BD5',
              height: 3,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Active Tab Content */}
      <ActiveComponent 
        key={`${activeTab}-${refreshKey}`} 
        onRefresh={handleRefresh} 
        dashboardStats={dashboardStats} 
      />
    </Box>
  );
};

export default SettlementManagement;
