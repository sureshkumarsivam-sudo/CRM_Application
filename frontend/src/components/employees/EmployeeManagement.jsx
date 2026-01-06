import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useEmployeeDashboard } from '../../hooks/useEmployees';
import EmployeeList from './EmployeeList';
import ConnectionStatus from '../ConnectionStatus';
import DataLoadingState from '../DataLoadingState';

const StatCard = ({ title, value, icon: Icon, color = 'primary', isLoading = false }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={80} height={40} />
          ) : (
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          )}
        </Box>
        <Icon sx={{ fontSize: 40, color: `${color}.main` }} />
      </Box>
    </CardContent>
  </Card>
);

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError, refetch } = useEmployeeDashboard();

  const stats = dashboardData?.data || {};

  return (
    <Box sx={{ width: '100%' }}>
      {/* Connection Status */}
      <ConnectionStatus />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: 3, pt: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/employees/new')}
          size="large"
        >
          Add New Employee
        </Button>
      </Box>

      {/* Dashboard Statistics with robust loading */}
      <Box sx={{ px: 3, mb: 4 }}>
        <DataLoadingState
          isLoading={isDashboardLoading}
          error={dashboardError}
          hasData={!!dashboardData}
          onRetry={refetch}
          loadingMessage="Loading employee statistics..."
          errorMessage="Failed to load employee dashboard data"
          emptyMessage="No employee statistics available"
          showSkeleton={true}
          skeletonProps={{
            height: 120,
            count: 4,
            sx: { mb: 2 }
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees || 0}
                icon={PeopleIcon}
                color="primary"
                isLoading={isDashboardLoading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Employees"
                value={stats.activeEmployees || 0}
                icon={TrendingUpIcon}
              color="success"
              isLoading={isDashboardLoading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Departments"
              value={stats.totalDepartments || 0}
              icon={WorkIcon}
              color="info"
              isLoading={isDashboardLoading}
            />
          </Grid>
          
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Branches"
                value={stats.totalBranches || 0}
                icon={BusinessIcon}
                color="warning"
                isLoading={isDashboardLoading}
              />
            </Grid>
          </Grid>
        </DataLoadingState>
      </Box>      {/* Department-wise Breakdown */}
      {stats.departmentBreakdown && stats.departmentBreakdown.length > 0 && (
        <Box sx={{ px: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Department-wise Employee Count
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {stats.departmentBreakdown.map((dept) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={dept._id}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" component="div">
                        {dept.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dept._id || 'Unassigned'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Status Breakdown */}
      {stats.statusBreakdown && stats.statusBreakdown.length > 0 && (
        <Box sx={{ px: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Employee Status Overview
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {stats.statusBreakdown.map((status) => {
                let icon = PeopleIcon;
                let color = 'primary';
                
                switch (status._id) {
                  case 'Active':
                    icon = TrendingUpIcon;
                    color = 'success';
                    break;
                  case 'Inactive':
                  case 'Terminated':
                    icon = PersonOffIcon;
                    color = 'error';
                    break;
                  case 'On Leave':
                    color = 'warning';
                    break;
                  case 'Probation':
                    color = 'info';
                    break;
                  default:
                    break;
                }

                return (
                  <Grid item xs={12} sm={6} md={4} lg={2} key={status._id}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                          {React.createElement(icon, { 
                            sx: { fontSize: 24, color: `${color}.main` } 
                          })}
                        </Box>
                        <Typography variant="h6" component="div">
                          {status.count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {status._id || 'Unassigned'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Recent Joinings */}
      {stats.recentJoinings && stats.recentJoinings.length > 0 && (
        <Box sx={{ px: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Joinings (Last 30 Days)
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {stats.recentJoinings.map((employee) => (
                <Grid item xs={12} sm={6} md={4} key={employee._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" component="div">
                        {employee.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {employee.empCode} • {employee.designation}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Joined: {new Date(employee.doj).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Employee List */}
      <EmployeeList />
    </Box>
  );
};

export default EmployeeManagement;