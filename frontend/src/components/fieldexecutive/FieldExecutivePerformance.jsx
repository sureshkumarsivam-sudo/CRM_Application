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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as ReportsIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import FieldExecutiveService from '../../services/FieldExecutiveService';
import FEDashboard from './FEDashboard';
import FEReports from './FEReports';
import FEAnalytics from './FEAnalytics';

const FieldExecutivePerformance = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    region: 'All Regions',
    team: 'All Teams',
    fieldExecutive: 'All FEs'
  });
  const [regions, setRegions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [view, setView] = useState('View Data');

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [regionsData, teamsData] = await Promise.all([
        FieldExecutiveService.getRegions(),
        FieldExecutiveService.getTeams()
      ]);
      setRegions(['All Regions', ...regionsData]);
      setTeams(['All Teams', ...teamsData]);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setLoading(true);
    // Trigger refresh in child components
    setTimeout(() => setLoading(false), 500);
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      region: 'All Regions',
      team: 'All Teams',
      fieldExecutive: 'All FEs'
    });
  };

  const tabs = [
    { label: 'Dashboard', icon: <DashboardIcon />, component: FEDashboard },
    { label: 'Reports', icon: <ReportsIcon />, component: FEReports },
    { label: 'Analytics', icon: <AnalyticsIcon />, component: FEAnalytics },
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FFB84D 0%, #FF9A56 100%)',
          borderRadius: '12px',
          p: 3,
          mb: 3,
          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.25)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            📊 Field Executive Performance Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150, backgroundColor: 'white', borderRadius: 1 }}>
              <Select
                value={view}
                onChange={(e) => setView(e.target.value)}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value="View Data">View Data</MenuItem>
                <MenuItem value="Individual FE">Individual FE</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              🔔
              <span>Sat, 15 Nov, 2025, 10:13:28 pm</span>
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ mt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '15px',
                minHeight: 48,
              },
              '& .Mui-selected': {
                color: 'white !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
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
        </Box>
      </Box>

      {/* Filters Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '12px',
          background: 'linear-gradient(to bottom, #FFF8F0 0%, #FFFFFF 100%)',
          border: '1px solid #FFE0B2'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#FF9A56' }}>
              From Date:
            </Typography>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#FF9A56' }}>
              To Date:
            </Typography>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#FF9A56' }}>
              Region:
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                sx={{ backgroundColor: 'white' }}
              >
                {regions.map(region => (
                  <MenuItem key={region} value={region}>{region}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#FF9A56' }}>
              Team:
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.team}
                onChange={(e) => handleFilterChange('team', e.target.value)}
                sx={{ backgroundColor: 'white' }}
              >
                {teams.map(team => (
                  <MenuItem key={team} value={team}>{team}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#FF9A56' }}>
              Field Executive:
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.fieldExecutive}
                onChange={(e) => handleFilterChange('fieldExecutive', e.target.value)}
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value="All FEs">All FEs</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                disabled={loading}
                sx={{
                  backgroundColor: '#FFB84D',
                  '&:hover': { backgroundColor: '#FF9A56' },
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: 1
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                sx={{
                  borderColor: '#FFB84D',
                  color: '#FF9A56',
                  '&:hover': { borderColor: '#FF9A56', backgroundColor: 'rgba(255, 152, 86, 0.1)' },
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: 1
                }}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Active Tab Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#FF9A56' }} />
        </Box>
      ) : (
        <ActiveComponent filters={filters} />
      )}
    </Box>
  );
};

export default FieldExecutivePerformance;
