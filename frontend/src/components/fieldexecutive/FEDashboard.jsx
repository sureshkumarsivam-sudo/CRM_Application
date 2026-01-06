import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  People,
  CheckCircle,
  DirectionsCar,
  CameraAlt,
  Timer,
  AttachMoney,
  Star,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import FieldExecutiveService from '../../services/FieldExecutiveService';

const FEDashboard = ({ filters }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [fieldExecutives, setFieldExecutives] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, feList] = await Promise.all([
        FieldExecutiveService.getDashboardStats(filters),
        FieldExecutiveService.getAllFieldExecutives({ ...filters, limit: 10 })
      ]);
      setStats(dashboardStats);
      setFieldExecutives(feList.fieldExecutives || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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

  const performanceMetrics = [
    {
      title: 'Total FE Count',
      value: stats?.summary?.totalFEs || 228,
      subtitle: 'Field Executives',
      icon: <People />,
      color: '#FFB84D',
    },
    {
      title: 'Total Visited',
      value: stats?.summary?.totalVisited || 187,
      subtitle: 'Total Accounts',
      icon: <CheckCircle />,
      color: '#FFA500',
    },
    {
      title: 'Valid Visits %',
      value: `${stats?.summary?.avgEfficiency || 61}%`,
      subtitle: 'Valid Visits',
      icon: <Star />,
      color: '#4CAF50',
    },
    {
      title: 'Total Amount',
      value: `₹${(stats?.summary?.totalCollection || 48100000).toLocaleString()}`,
      subtitle: 'Collection Amount',
      icon: <AttachMoney />,
      color: '#9C27B0',
    },
    {
      title: 'Avg Visits/Day',
      value: stats?.summary?.avgVisits || 43,
      subtitle: 'Daily Average',
      icon: <TrendingUp />,
      color: '#F06292',
    },
    {
      title: 'Total Distance',
      value: stats?.summary?.totalDistance || 69,
      subtitle: 'KM Covered',
      icon: <DirectionsCar />,
      color: '#FFB300',
    },
    {
      title: 'Valid Visit %',
      value: `${stats?.summary?.validVisitPercentage || 90}%`,
      subtitle: 'Visit Accuracy',
      icon: <CheckCircle />,
      color: '#66BB6A',
    },
    {
      title: 'Avg Time/Visit',
      value: `${stats?.summary?.avgTimePerVisit || 26} Min`,
      subtitle: 'Time Spent/Visit',
      icon: <Timer />,
      color: '#AB47BC',
    },
    {
      title: 'Efficiency Score',
      value: `${stats?.summary?.avgEfficiency || 63}%`,
      subtitle: 'Overall Efficiency',
      icon: <Star />,
      color: '#EF5350',
    },
    {
      title: 'Total Photos',
      value: stats?.summary?.totalPhotos || 160,
      subtitle: 'Photo Collections',
      icon: <CameraAlt />,
      color: '#FF6F00',
    },
  ];

  // Sample data for charts
  const visitsData = [
    { date: 'Mon', total: 170, valid: 150 },
    { date: 'Tue', total: 180, valid: 160 },
    { date: 'Wed', total: 165, valid: 145 },
    { date: 'Thu', total: 190, valid: 170 },
    { date: 'Fri', total: 175, valid: 155 },
    { date: 'Sat', total: 185, valid: 165 },
    { date: 'Sun', total: 160, valid: 140 },
  ];

  const interactionData = [
    { name: 'PTP', value: 45, color: '#4CAF50' },
    { name: 'Contact Not Made', value: 25, color: '#FF9800' },
    { name: 'Broken PTP', value: 15, color: '#F44336' },
    { name: 'Not Visited', value: 10, color: '#9E9E9E' },
    { name: 'RTP', value: 5, color: '#2196F3' },
  ];

  return (
    <Box>
      {/* Performance Metrics */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
        Performance Metrics
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {performanceMetrics.map((metric, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={index}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${metric.color} 0%, ${metric.color}DD 100%)`,
                color: 'white',
                borderRadius: '12px',
                boxShadow: `0 4px 12px ${metric.color}40`,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {metric.value}
                  </Typography>
                  <Box sx={{ opacity: 0.7 }}>{metric.icon}</Box>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {metric.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Visits vs Valid Visits */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              📊 Visits vs Valid Visits
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFE0B2" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#FFB84D" name="Total Visits" />
                <Bar dataKey="valid" fill="#FF9A56" name="Valid Visits" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Customer Interaction Outcomes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              📈 Customer Interaction Outcomes
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={interactionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {interactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Daily Distance Covered */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              🚗 Daily Distance Covered
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={visitsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFE0B2" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#FFB84D" strokeWidth={2} name="Distance (KM)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Route Map & Missed Geotags */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2', height: 330 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
              🗺️ Route Map & Missed Geotags
            </Typography>
            <Box
              sx={{
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFF8F0',
                borderRadius: 2,
                border: '2px dashed #FFB84D',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Interactive map will be displayed here.<br />
                Showing field executive routes and geotag locations.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* FE Performance Leaderboard */}
      <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
          🏆 FE Performance Leaderboard
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FFB84D' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Field Executive</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Region</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Team</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Allocated</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Visited</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Valid Visits</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Distance (KM)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Photos</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Efficiency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldExecutives.slice(0, 10).map((fe, index) => (
                <TableRow
                  key={fe._id}
                  sx={{
                    '&:hover': { backgroundColor: '#FFF8F0' },
                    backgroundColor: index % 2 === 0 ? 'white' : '#FFFBF5',
                  }}
                >
                  <TableCell>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: '14px',
                        backgroundColor: index < 3 ? '#FFB84D' : '#FFE0B2',
                        color: index < 3 ? 'white' : '#FF9A56',
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{fe.name}</TableCell>
                  <TableCell>{fe.region}</TableCell>
                  <TableCell>{fe.team}</TableCell>
                  <TableCell align="right">{fe.allocated || 0}</TableCell>
                  <TableCell align="right">{fe.visited || 0}</TableCell>
                  <TableCell align="right">{fe.validVisits || 0}</TableCell>
                  <TableCell align="right">{fe.distance || 0}</TableCell>
                  <TableCell align="right">{fe.photos || 0}</TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: fe.efficiencyScore >= 80 ? '#4CAF50' : fe.efficiencyScore >= 60 ? '#FFB84D' : '#F44336',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    >
                      {fe.efficiencyScore || 0}%
                    </Box>
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

export default FEDashboard;
