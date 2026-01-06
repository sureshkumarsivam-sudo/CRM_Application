import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import FieldExecutiveService from '../../services/FieldExecutiveService';

const FEAnalytics = ({ filters }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartType, setChartType] = useState('7days');

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await FieldExecutiveService.getDashboardStats(filters);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#FF9A56' }} />
      </Box>
    );
  }

  // Performance Trends Data (Last 7 Days)
  const performanceTrendsData = [
    {
      date: 'Oct 17',
      totalVisits: 170,
      validVisits: 150,
      efficiency: 88,
      collection: 62000,
    },
    {
      date: 'Oct 18',
      totalVisits: 180,
      validVisits: 160,
      efficiency: 89,
      collection: 71000,
    },
    {
      date: 'Oct 19',
      totalVisits: 165,
      validVisits: 145,
      efficiency: 88,
      collection: 58000,
    },
    {
      date: 'Oct 20',
      totalVisits: 190,
      validVisits: 170,
      efficiency: 89,
      collection: 78000,
    },
    {
      date: 'Oct 21',
      totalVisits: 175,
      validVisits: 155,
      efficiency: 89,
      collection: 65000,
    },
    {
      date: 'Oct 22',
      totalVisits: 185,
      validVisits: 165,
      efficiency: 89,
      collection: 72000,
    },
    {
      date: 'Oct 23',
      totalVisits: 187,
      validVisits: 167,
      efficiency: 89,
      collection: 81000,
    },
  ];

  // Collection Analysis Data (Last 7 Days)
  const collectionAnalysisData = [
    { date: 'Oct 17', collection: 62000, target: 70000 },
    { date: 'Oct 18', collection: 71000, target: 70000 },
    { date: 'Oct 19', collection: 58000, target: 70000 },
    { date: 'Oct 20', collection: 78000, target: 70000 },
    { date: 'Oct 21', collection: 65000, target: 70000 },
    { date: 'Oct 22', collection: 72000, target: 70000 },
    { date: 'Oct 23', collection: 81000, target: 70000 },
  ];

  // Regional Performance Data
  const regionalPerformanceData = stats?.distribution?.regionDistribution?.map((region) => ({
    region: region._id || 'Unknown',
    count: region.count,
    totalCollection: region.totalCollection || 0,
    avgEfficiency: region.avgEfficiency || 0,
  })) || [
    { region: 'North', count: 45, totalCollection: 180000, avgEfficiency: 85 },
    { region: 'South', count: 38, totalCollection: 150000, avgEfficiency: 82 },
    { region: 'East', count: 52, totalCollection: 220000, avgEfficiency: 88 },
    { region: 'West', count: 41, totalCollection: 165000, avgEfficiency: 80 },
  ];

  // Efficiency Distribution
  const efficiencyDistributionData = [
    { range: '90-100%', count: 28, color: '#4CAF50' },
    { range: '80-89%', count: 45, color: '#8BC34A' },
    { range: '70-79%', count: 38, color: '#FFB84D' },
    { range: '60-69%', count: 22, color: '#FF9800' },
    { range: 'Below 60%', count: 15, color: '#F44336' },
  ];

  // Visit Compliance Trends
  const visitComplianceTrends = [
    { week: 'Week 1', allocated: 1200, visited: 1080, validVisits: 972 },
    { week: 'Week 2', allocated: 1250, visited: 1125, validVisits: 1012 },
    { week: 'Week 3', allocated: 1180, visited: 1062, validVisits: 956 },
    { week: 'Week 4', allocated: 1300, visited: 1170, validVisits: 1053 },
  ];

  // Team Performance Comparison
  const teamPerformanceData = [
    {
      team: 'Team Alpha',
      visits: 450,
      validVisits: 405,
      collection: 180000,
      efficiency: 90,
    },
    {
      team: 'Team Beta',
      visits: 420,
      validVisits: 361,
      collection: 155000,
      efficiency: 86,
    },
    {
      team: 'Team Gamma',
      visits: 480,
      validVisits: 422,
      collection: 210000,
      efficiency: 88,
    },
    {
      team: 'Team Delta',
      visits: 390,
      validVisits: 332,
      collection: 142000,
      efficiency: 85,
    },
  ];

  return (
    <Box>
      {/* Chart Type Selector */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={chartType}
            label="Time Period"
            onChange={(e) => setChartType(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FFB84D',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF9A56',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF9A56',
              },
            }}
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Performance Trends */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              📊 Performance Trends (17 Oct - 23 Oct)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={performanceTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFE0B2" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFBF5',
                    border: '1px solid #FFB84D',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalVisits"
                  stroke="#FFB84D"
                  strokeWidth={3}
                  name="Total Visits"
                  dot={{ fill: '#FFB84D', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="validVisits"
                  stroke="#FF9A56"
                  strokeWidth={3}
                  name="Valid Visits"
                  dot={{ fill: '#FF9A56', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Efficiency %"
                  dot={{ fill: '#4CAF50', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Collection Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              💰 Collection Analysis (17 Oct - 23 Oct)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={collectionAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFE0B2" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFBF5',
                    border: '1px solid #FFB84D',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="collection" fill="#FFB84D" name="Daily Collection" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="#4CAF50" name="Target" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Regional Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              🌍 Regional Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#FFE0B2" />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="region" type="category" stroke="#666" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFBF5',
                    border: '1px solid #FFB84D',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#FFB84D" name="FE Count" radius={[0, 8, 8, 0]} />
                <Bar dataKey="avgEfficiency" fill="#4CAF50" name="Avg Efficiency %" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Efficiency Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              🎯 Efficiency Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={efficiencyDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFE0B2" />
                <XAxis dataKey="range" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFBF5',
                    border: '1px solid #FFB84D',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" name="Number of FEs" radius={[8, 8, 0, 0]}>
                  {efficiencyDistributionData.map((entry, index) => (
                    <Bar key={index} dataKey="count" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Visit Compliance Trends */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              ✅ Visit Compliance Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={visitComplianceTrends}>
                <defs>
                  <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB84D" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FFB84D" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorVisited" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9A56" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF9A56" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorValid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFE0B2" />
                <XAxis dataKey="week" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFBF5',
                    border: '1px solid #FFB84D',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="allocated"
                  stroke="#FFB84D"
                  fillOpacity={1}
                  fill="url(#colorAllocated)"
                  name="Allocated"
                />
                <Area
                  type="monotone"
                  dataKey="visited"
                  stroke="#FF9A56"
                  fillOpacity={1}
                  fill="url(#colorVisited)"
                  name="Visited"
                />
                <Area
                  type="monotone"
                  dataKey="validVisits"
                  stroke="#4CAF50"
                  fillOpacity={1}
                  fill="url(#colorValid)"
                  name="Valid Visits"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Team Performance Comparison */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              👥 Team Performance Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={teamPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFE0B2" />
                <XAxis dataKey="team" stroke="#666" />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFBF5',
                    border: '1px solid #FFB84D',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="visits" fill="#FFB84D" name="Total Visits" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="left" dataKey="validVisits" fill="#FF9A56" name="Valid Visits" radius={[8, 8, 0, 0]} />
                <Bar
                  yAxisId="right"
                  dataKey="efficiency"
                  fill="#4CAF50"
                  name="Efficiency %"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FEAnalytics;
