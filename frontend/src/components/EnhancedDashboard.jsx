import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TodayIcon from '@mui/icons-material/Today';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Line,
  ComposedChart,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const EnhancedDashboard = () => {
  const navigate = useNavigate();

  // Sorting states for Team Performance
  const [teamOrderBy, setTeamOrderBy] = useState('achievement');
  const [teamOrder, setTeamOrder] = useState('desc');

  // Sorting states for Caller Performance
  const [callerOrderBy, setCallerOrderBy] = useState('collected');
  const [callerOrder, setCallerOrder] = useState('desc');

  // Time range for caller performance
  const [timeRange, setTimeRange] = useState('today');

  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  // Performance thresholds (configurable in settings)
  const performanceThresholds = {
    high: 60,    // >= 60% -> Green
    medium: 30,  // >= 30% and < 60% -> Yellow
    // < 30% -> Red
  };

  // Get achievement color based on thresholds
  const getAchievementColorByThreshold = (achievementPercent) => {
    const percent = parseFloat(achievementPercent);
    if (percent >= performanceThresholds.high) return '#E8F5E9'; // Soft mint
    if (percent >= performanceThresholds.medium) return '#FFF8E1'; // Soft cream
    return '#FFEBEE'; // Soft peach
  };

  const getAchievementTextColor = (achievementPercent) => {
    const percent = parseFloat(achievementPercent);
    if (percent >= performanceThresholds.high) return '#2E7D32'; // Dark green
    if (percent >= performanceThresholds.medium) return '#F57C00'; // Dark orange
    return '#C62828'; // Dark red
  };

  // Calculate values
  const totalTarget = 4350000;
  const totalCollected = 1534201;
  const yetToDo = totalTarget - totalCollected;
  const achievementPercent = ((totalCollected / totalTarget) * 100).toFixed(2);
  
  // Calculate Daily DRR
  const calculateDailyDRR = () => {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let workingDays = 0;
    for (let d = new Date(today); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
    return Math.round(yetToDo / (workingDays || 1));
  };

  const todayPTP = 96943;
  const todayCollection = 64691;
  const yetToCollectToday = todayPTP - todayCollection;

  const collectionMetrics = [
    { title: 'TOTAL TARGET', value: `₹${totalTarget.toLocaleString('en-IN')}`, color: '#1976D2', icon: TrendingUpIcon },
    { title: 'TOTAL COLLECTED', value: `₹${totalCollected.toLocaleString('en-IN')}`, color: '#388E3C', icon: CheckCircleIcon },
    { title: 'YET TO DO', value: `₹${yetToDo.toLocaleString('en-IN')}`, color: '#FF9800', icon: PendingActionsIcon },
    { title: 'ACHIEVEMENT %', value: `${achievementPercent}%`, color: '#7B1FA2', icon: EmojiEventsIcon },
  ];

  const todayMetrics = [
    { title: 'TODAY PTP', value: `₹${todayPTP.toLocaleString('en-IN')}`, color: '#4CAF50', icon: TodayIcon },
    { title: 'TODAY COLLECTION', value: `₹${todayCollection.toLocaleString('en-IN')}`, color: '#2196F3', icon: AccountBalanceWalletIcon },
    { title: 'YET TO COLLECT TODAY', value: `₹${yetToCollectToday.toLocaleString('en-IN')}`, color: '#FF5722', icon: AssignmentLateIcon },
    { title: 'DAILY DRR', value: `₹${calculateDailyDRR().toLocaleString('en-IN')}`, color: '#E91E63', icon: TimelineIcon },
  ];

  // Helper function to get subtle gradient based on card color
  const getCardGradient = (color) => {
    const gradients = {
      '#1976D2': 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%)', // Soft blue
      '#388E3C': 'linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 100%)', // Soft mint
      '#FF9800': 'linear-gradient(135deg, #FFF3E0 0%, #FFFFFF 100%)', // Soft cream
      '#7B1FA2': 'linear-gradient(135deg, #F3E5F5 0%, #FFFFFF 100%)', // Soft lavender
      '#4CAF50': 'linear-gradient(135deg, #F1F8E9 0%, #FFFFFF 100%)', // Light green
      '#2196F3': 'linear-gradient(135deg, #E1F5FE 0%, #FFFFFF 100%)', // Sky blue
      '#FF5722': 'linear-gradient(135deg, #FFEBEE 0%, #FFFFFF 100%)', // Soft peach
      '#E91E63': 'linear-gradient(135deg, #FCE4EC 0%, #FFFFFF 100%)', // Soft pink
    };
    return gradients[color] || 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)';
  };

  const teamPerformance = [
    { team: 'SEKARTHAR', process: 'SMFG-FIELD', target: 850000, collected: 0, achievement: '0.00%', achievementColor: '#FFCDD2' },
    { team: 'YASODHA', process: 'ROBI-KOTK', target: 500000, collected: 25544, achievement: '5.09%', achievementColor: '#FFCDD2' },
    { team: 'YASODHA', process: 'DMI', target: 100000, collected: 4896, achievement: '4.90%', achievementColor: '#FFCDD2' },
    { team: 'YASODHA', process: 'KOTAK-WOFF', target: 400000, collected: 0, achievement: '0.00%', achievementColor: '#FFCDD2' },
    { team: 'SIVASANKARI', process: 'ASIRC', target: 650000, collected: 420041, achievement: '64.62%', achievementColor: '#C8E6C9' },
    { team: 'KESAVAN J', process: 'ASIRC', target: 850000, collected: 460097, achievement: '54.13%', achievementColor: '#FFF9C4' },
  ];

  // Caller performance data with team and collected amount
  const callerPerformance = [
    { name: 'AKALYA R', team: 'SIVASANKARI', collected: 101539, target: 110000, achievement: '92.31%' },
    { name: 'ROBI CHETRY', team: 'YASODHA', collected: 96798, target: 110000, achievement: '88.00%' },
    { name: 'MAHILARSHMI R', team: 'SIVASANKARI', collected: 76804, target: 82500, achievement: '93.1%' },
    { name: 'KESAVAN J', team: 'KESAVAN J', collected: 68029, target: 82500, achievement: '82.46%' },
    { name: 'LOKESHWARAN', team: 'YASODHA', collected: 64068, target: 72727, achievement: '88.09%' },
    { name: 'SANJAY KUMAR', team: 'SIVASANKARI', collected: 57450, target: 74111, achievement: '77.52%' },
    { name: 'KUMARAN R', team: 'KESAVAN J', collected: 56755, target: 82500, achievement: '68.8%' },
    { name: 'MANJUNATHA M', team: 'MUTHULAKSHMI', collected: 51038, target: 94444, achievement: '54.05%' },
    { name: 'NARAYANA R', team: 'YASODHA', collected: 50381, target: 72727, achievement: '69.29%' },
    { name: 'SANKARLAL M', team: 'SURYAGANDHI M', collected: 49420, target: 75000, achievement: '65.9%' },
  ];

  const getAchievementColor = (achievement) => {
    const percent = parseFloat(achievement);
    if (percent >= 80) return '#C8E6C9';
    if (percent >= 60) return '#FFF9C4';
    if (percent >= 40) return '#FFE0B2';
    return '#FFCDD2';
  };

  // Sort handlers for Team Performance
  const handleTeamSort = (property) => {
    const isAsc = teamOrderBy === property && teamOrder === 'asc';
    setTeamOrder(isAsc ? 'desc' : 'asc');
    setTeamOrderBy(property);
  };

  // Sort handlers for Caller Performance
  const handleCallerSort = (property) => {
    const isAsc = callerOrderBy === property && callerOrder === 'asc';
    setCallerOrder(isAsc ? 'desc' : 'asc');
    setCallerOrderBy(property);
  };

  // Sorted team performance data
  const sortedTeamPerformance = useMemo(() => {
    return [...teamPerformance].sort((a, b) => {
      let aVal, bVal;
      
      if (teamOrderBy === 'achievement') {
        aVal = parseFloat(a.achievement);
        bVal = parseFloat(b.achievement);
      } else if (teamOrderBy === 'target' || teamOrderBy === 'collected') {
        aVal = a[teamOrderBy];
        bVal = b[teamOrderBy];
      } else {
        aVal = a[teamOrderBy];
        bVal = b[teamOrderBy];
      }

      if (typeof aVal === 'string') {
        return teamOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return teamOrder === 'asc' 
        ? (aVal > bVal ? 1 : -1)
        : (aVal < bVal ? 1 : -1);
    });
  }, [teamPerformance, teamOrder, teamOrderBy]);

  // Calculate team totals
  const teamTotals = useMemo(() => {
    return teamPerformance.reduce((acc, t) => ({
      target: acc.target + t.target,
      collected: acc.collected + t.collected
    }), { target: 0, collected: 0 });
  }, [teamPerformance]);

  const teamTotalAchievement = ((teamTotals.collected / teamTotals.target) * 100).toFixed(2);

  // Sorted caller performance data (Top 5 only)
  const sortedCallerPerformance = useMemo(() => {
    const sorted = [...callerPerformance].sort((a, b) => {
      let aVal, bVal;
      
      if (callerOrderBy === 'achievement') {
        aVal = parseFloat(a.achievement);
        bVal = parseFloat(b.achievement);
      } else if (callerOrderBy === 'collected' || callerOrderBy === 'target') {
        aVal = a[callerOrderBy];
        bVal = b[callerOrderBy];
      } else {
        aVal = a[callerOrderBy];
        bVal = b[callerOrderBy];
      }

      if (typeof aVal === 'string') {
        return callerOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return callerOrder === 'asc' 
        ? (aVal > bVal ? 1 : -1)
        : (aVal < bVal ? 1 : -1);
    });
    
    // Return only top 5
    return sorted.slice(0, 5);
  }, [callerPerformance, callerOrder, callerOrderBy]);

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
        Dashboard
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
        Overview of collection performance and key metrics
      </Typography>

      {/* Collection Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {collectionMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: '8px',
                  background: getCardGradient(metric.color),
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 2, pb: '12px !important' }}>
                  <Box sx={{ position: 'absolute', right: 8, top: 8, opacity: 0.1 }}>
                    <IconComponent sx={{ fontSize: '64px', color: metric.color }} />
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#757575', fontWeight: 500, display: 'block' }}>
                      {metric.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#212121', mt: 0.5 }}>
                      {metric.value}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ height: '4px', background: metric.color, width: '100%', position: 'absolute', bottom: 0, left: 0 }} />
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Today's Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {todayMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: '8px',
                  background: getCardGradient(metric.color),
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 2, pb: '12px !important' }}>
                  <Box sx={{ position: 'absolute', right: 8, top: 8, opacity: 0.1 }}>
                    <IconComponent sx={{ fontSize: '64px', color: metric.color }} />
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#757575', fontWeight: 500, display: 'block' }}>
                      {metric.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#212121', mt: 0.5 }}>
                      {metric.value}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ height: '4px', background: metric.color, width: '100%', position: 'absolute', bottom: 0, left: 0 }} />
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Team Wise Collection Report and Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Team Wise Collection Report Table */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%' }}>
            <Box sx={{ p: 2, backgroundColor: 'white' }}>
              <Typography variant="h5" sx={{ color: '#333', fontWeight: 700, fontSize: '1.5rem' }}>
                👥 TEAM WISE COLLECTION REPORT
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)',
                    borderBottom: '2px solid #E0E0E0'
                  }}>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      py: 2, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      <TableSortLabel
                        active={teamOrderBy === 'team'}
                        direction={teamOrderBy === 'team' ? teamOrder : 'asc'}
                        onClick={() => handleTeamSort('team')}
                        sx={{ 
                          color: '#424242 !important',
                          '&:hover': { color: '#1976D2 !important' },
                          '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                          '&.Mui-active': { color: '#1976D2 !important' },
                          '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                        }}
                      >
                        TEAM
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      <TableSortLabel
                        active={teamOrderBy === 'process'}
                        direction={teamOrderBy === 'process' ? teamOrder : 'asc'}
                        onClick={() => handleTeamSort('process')}
                        sx={{ 
                          color: '#424242 !important',
                          '&:hover': { color: '#1976D2 !important' },
                          '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                          '&.Mui-active': { color: '#1976D2 !important' },
                          '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                        }}
                      >
                        PROCESS
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      <TableSortLabel
                        active={teamOrderBy === 'target'}
                        direction={teamOrderBy === 'target' ? teamOrder : 'asc'}
                        onClick={() => handleTeamSort('target')}
                        sx={{ 
                          color: '#424242 !important',
                          '&:hover': { color: '#1976D2 !important' },
                          '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                          '&.Mui-active': { color: '#1976D2 !important' },
                          '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                        }}
                      >
                        TARGET
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      <TableSortLabel
                        active={teamOrderBy === 'collected'}
                        direction={teamOrderBy === 'collected' ? teamOrder : 'asc'}
                        onClick={() => handleTeamSort('collected')}
                        sx={{ 
                          color: '#424242 !important',
                          '&:hover': { color: '#1976D2 !important' },
                          '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                          '&.Mui-active': { color: '#1976D2 !important' },
                          '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                        }}
                      >
                        TOTAL COLLECTED
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      <TableSortLabel
                        active={teamOrderBy === 'achievement'}
                        direction={teamOrderBy === 'achievement' ? teamOrder : 'asc'}
                        onClick={() => handleTeamSort('achievement')}
                        sx={{ 
                          color: '#424242 !important',
                          '&:hover': { color: '#1976D2 !important' },
                          '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                          '&.Mui-active': { color: '#1976D2 !important' },
                          '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                        }}
                      >
                        ACHIEVED %
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedTeamPerformance.map((team, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white',
                        borderBottom: '1px solid #F0F0F0',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          backgroundColor: '#F5F5F5',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        },
                      }}
                    >
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        py: 2, 
                        color: '#212121',
                        fontSize: '0.875rem',
                        borderBottom: 'none'
                      }}>{team.team}</TableCell>
                      <TableCell sx={{ 
                        color: '#616161',
                        fontSize: '0.875rem',
                        borderBottom: 'none'
                      }}>{team.process}</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#424242',
                        fontSize: '0.875rem',
                        borderBottom: 'none'
                      }}>₹{team.target.toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#424242',
                        fontSize: '0.875rem',
                        borderBottom: 'none'
                      }}>₹{team.collected.toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        <Box
                          sx={{
                            backgroundColor: getAchievementColorByThreshold(team.achievement),
                            color: getAchievementTextColor(team.achievement),
                            px: 2,
                            py: 0.75,
                            borderRadius: '6px',
                            display: 'inline-block',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            border: '1px solid',
                            borderColor: getAchievementTextColor(team.achievement) + '20',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          {team.achievement}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* TOTAL Row */}
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)',
                    borderTop: '2px solid #E0E0E0',
                    fontWeight: 700 
                  }}>
                    <TableCell colSpan={2} sx={{ 
                      fontWeight: 700, 
                      py: 2.5,
                      color: '#212121',
                      fontSize: '0.9rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>TOTAL</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700,
                      color: '#212121',
                      fontSize: '0.9rem',
                      borderBottom: 'none'
                    }}>₹{teamTotals.target.toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700,
                      color: '#212121',
                      fontSize: '0.9rem',
                      borderBottom: 'none'
                    }}>₹{teamTotals.collected.toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ borderBottom: 'none' }}>
                      <Box
                        sx={{
                          backgroundColor: getAchievementColorByThreshold(teamTotalAchievement),
                          color: getAchievementTextColor(teamTotalAchievement),
                          px: 2.5,
                          py: 1,
                          borderRadius: '6px',
                          display: 'inline-block',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          border: '2px solid',
                          borderColor: getAchievementTextColor(teamTotalAchievement) + '30',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                        }}
                      >
                        {teamTotalAchievement}%
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Target vs Collection Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ borderRadius: '12px', p: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%' }}>
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 600, mb: 2 }}>
              TARGET VS COLLECTION (Stacked)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart 
                data={sortedTeamPerformance.map(team => ({
                  name: team.team,
                  collected: team.collected,
                  remaining: team.target - team.collected,
                  achievedPercent: parseFloat(team.achievement)
                }))}
                margin={{ top: 20, right: 60, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11, fill: '#424242' }}
                />
                <YAxis 
                  yAxisId="left" 
                  tickFormatter={(value) => `₹${(value / 1000)}K`}
                  tick={{ fill: '#424242' }}
                  label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', style: { fill: '#424242', fontWeight: 600 } }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#424242' }}
                  label={{ value: 'Achievement %', angle: 90, position: 'insideRight', style: { fill: '#424242', fontWeight: 600 } }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Achievement %') return `${value.toFixed(2)}%`;
                    if (name === 'Collected') return [`₹${value.toLocaleString('en-IN')}`, 'Collected'];
                    if (name === 'Remaining') return [`₹${value.toLocaleString('en-IN')}`, 'Remaining'];
                    return `₹${value.toLocaleString('en-IN')}`;
                  }}
                  labelStyle={{ color: '#212121', fontWeight: 600 }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="rect"
                />
                <Bar 
                  dataKey="collected" 
                  stackId="a" 
                  fill="#4CAF50" 
                  name="Collected" 
                  yAxisId="left"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="remaining" 
                  stackId="a" 
                  fill="#E53935" 
                  name="Remaining" 
                  yAxisId="left"
                  radius={[8, 8, 0, 0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="achievedPercent" 
                  stroke="#FF9800" 
                  strokeWidth={3}
                  name="Achievement %" 
                  yAxisId="right"
                  dot={{ fill: '#FF9800', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top 5 Caller Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Box sx={{ p: 2, backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ color: '#333', fontWeight: 700, fontSize: '1.5rem' }}>
                👤 TOP 5 CALLER PERFORMANCE
              </Typography>
              <ToggleButtonGroup
                value={timeRange}
                exclusive
                onChange={handleTimeRangeChange}
                size="small"
                sx={{ backgroundColor: 'white' }}
              >
                <ToggleButton value="today" sx={{ px: 2, fontWeight: 600 }}>
                  Today
                </ToggleButton>
                <ToggleButton value="week" sx={{ px: 2, fontWeight: 600 }}>
                  Week
                </ToggleButton>
                <ToggleButton value="month" sx={{ px: 2, fontWeight: 600 }}>
                  Month
                </ToggleButton>
                <ToggleButton value="custom" sx={{ px: 2, fontWeight: 600 }}>
                  Custom
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)',
                    borderBottom: '2px solid #E0E0E0'
                  }}>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      py: 2, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      RANK
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      <TableSortLabel
                        active={callerOrderBy === 'name'}
                        direction={callerOrderBy === 'name' ? callerOrder : 'asc'}
                        onClick={() => handleCallerSort('name')}
                        sx={{ 
                          color: '#424242 !important',
                          '&:hover': { color: '#1976D2 !important' },
                          '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                          '&.Mui-active': { color: '#1976D2 !important' },
                          '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                        }}
                      >
                        CALLER NAME
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      <TableSortLabel
                        active={callerOrderBy === 'team'}
                        direction={callerOrderBy === 'team' ? callerOrder : 'asc'}
                        onClick={() => handleCallerSort('team')}
                        sx={{ 
                          color: '#424242 !important',
                          '&:hover': { color: '#1976D2 !important' },
                          '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                          '&.Mui-active': { color: '#1976D2 !important' },
                          '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                        }}
                      >
                        TEAM
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      <TableSortLabel
                        active={callerOrderBy === 'collected'}
                        direction={callerOrderBy === 'collected' ? callerOrder : 'asc'}
                        onClick={() => handleCallerSort('collected')}
                        sx={{ 
                          color: '#424242 !important',
                          '&:hover': { color: '#1976D2 !important' },
                          '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                          '&.Mui-active': { color: '#1976D2 !important' },
                          '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                        }}
                      >
                        COLLECTED AMOUNT
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#424242', 
                      fontWeight: 600, 
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      borderBottom: 'none'
                    }}>
                      <TableSortLabel
                        active={callerOrderBy === 'achievement'}
                        direction={callerOrderBy === 'achievement' ? callerOrder : 'asc'}
                        onClick={() => handleCallerSort('achievement')}
                        sx={{ 
                          color: '#424242 !important',
                          '&:hover': { color: '#1976D2 !important' },
                          '& .MuiTableSortLabel-icon': { color: '#757575 !important' },
                          '&.Mui-active': { color: '#1976D2 !important' },
                          '&.Mui-active .MuiTableSortLabel-icon': { color: '#1976D2 !important' }
                        }}
                      >
                        ACHIEVED %
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedCallerPerformance.map((caller, index) => {
                    const achievementColor = getAchievementColorByThreshold(caller.achievement);
                    
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: index % 2 === 0 ? '#FAFAFA' : 'white',
                          borderBottom: '1px solid #F0F0F0',
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            backgroundColor: '#F5F5F5',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          },
                        }}
                      >
                        <TableCell sx={{ 
                          fontWeight: 700, 
                          py: 2, 
                          fontSize: '1rem', 
                          color: '#1976D2',
                          borderBottom: 'none'
                        }}>
                          #{index + 1}
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          py: 2, 
                          fontSize: '0.875rem',
                          color: '#212121',
                          borderBottom: 'none'
                        }}>{caller.name}</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 500, 
                          fontSize: '0.875rem',
                          color: '#616161',
                          borderBottom: 'none'
                        }}>{caller.team}</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          fontSize: '0.875rem',
                          color: '#424242',
                          borderBottom: 'none'
                        }}>₹{caller.collected.toLocaleString('en-IN')}</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>
                          <Box
                            sx={{
                              backgroundColor: achievementColor,
                              color: getAchievementTextColor(caller.achievement),
                              px: 2,
                              py: 0.75,
                              borderRadius: '6px',
                              display: 'inline-block',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              border: '1px solid',
                              borderColor: getAchievementTextColor(caller.achievement) + '20',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            {caller.achievement}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedDashboard;
