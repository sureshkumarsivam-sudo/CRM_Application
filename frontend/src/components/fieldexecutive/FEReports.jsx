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
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Download,
  Assessment,
  TrendingUp,
  Schedule,
  LocationOn,
  AttachMoney,
  EventAvailable,
  FollowTheSigns,
} from '@mui/icons-material';
import FieldExecutiveService from '../../services/FieldExecutiveService';

const FEReports = ({ filters }) => {
  const [selectedReport, setSelectedReport] = useState('daily-visit');
  const [loading, setLoading] = useState(true);
  const [fieldExecutives, setFieldExecutives] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [filters, selectedReport]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const response = await FieldExecutiveService.getAllFieldExecutives({
        ...filters,
        limit: 50,
      });
      setFieldExecutives(response.fieldExecutives || []);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      id: 'daily-visit',
      label: 'Daily Visit Report',
      icon: <Assessment />,
      description: 'Daily visit performance',
    },
    {
      id: 'weekly-efficiency',
      label: 'Weekly Efficiency Report',
      icon: <TrendingUp />,
      description: 'Weekly efficiency metrics',
    },
    {
      id: 'monthly-performance',
      label: 'Monthly Performance Report',
      icon: <Schedule />,
      description: 'Monthly achievements',
    },
    {
      id: 'geo-accuracy',
      label: 'Geo Accuracy Report',
      icon: <LocationOn />,
      description: 'Location tracking accuracy',
    },
    {
      id: 'collection-achievement',
      label: 'Collection Achievement Report',
      icon: <AttachMoney />,
      description: 'Collection targets',
    },
    {
      id: 'attendance-summary',
      label: 'Attendance Summary',
      icon: <EventAvailable />,
      description: 'Attendance tracking',
    },
    {
      id: 'followup-compliance',
      label: 'Follow-up Compliance Report',
      icon: <FollowTheSigns />,
      description: 'Follow-up adherence',
    },
  ];

  const handleExport = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateCSV = () => {
    // CSV generation logic based on selected report
    return 'Report data will be exported here';
  };

  const renderDailyVisitReport = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#FFB84D' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Field Executive</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Region</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Team</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Allocated</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Visited</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Valid Visits</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Distance (KM)</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Photos</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fieldExecutives.map((fe, index) => (
            <TableRow
              key={fe._id}
              sx={{
                '&:hover': { backgroundColor: '#FFF8F0' },
                backgroundColor: index % 2 === 0 ? 'white' : '#FFFBF5',
              }}
            >
              <TableCell sx={{ fontWeight: 500 }}>{fe.name}</TableCell>
              <TableCell>{fe.region}</TableCell>
              <TableCell>{fe.team}</TableCell>
              <TableCell align="right">{fe.allocated || 0}</TableCell>
              <TableCell align="right">{fe.visited || 0}</TableCell>
              <TableCell align="right">{fe.validVisits || 0}</TableCell>
              <TableCell align="right">{fe.distance || 0}</TableCell>
              <TableCell align="right">{fe.photos || 0}</TableCell>
              <TableCell>
                <Chip
                  label={fe.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{
                    backgroundColor: fe.isActive ? '#4CAF50' : '#F44336',
                    color: 'white',
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderWeeklyEfficiencyReport = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#FFB84D' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Field Executive</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Region</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Avg Visits/Day</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Valid Visits %</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Avg Time/Visit (Min)</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Efficiency Score</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fieldExecutives.map((fe, index) => (
            <TableRow
              key={fe._id}
              sx={{
                '&:hover': { backgroundColor: '#FFF8F0' },
                backgroundColor: index % 2 === 0 ? 'white' : '#FFFBF5',
              }}
            >
              <TableCell sx={{ fontWeight: 500 }}>{fe.name}</TableCell>
              <TableCell>{fe.region}</TableCell>
              <TableCell align="right">{fe.avgVisitsPerDay || 0}</TableCell>
              <TableCell align="right">{fe.validVisitPercentage || 0}%</TableCell>
              <TableCell align="right">{fe.avgTimePerVisit || 0}</TableCell>
              <TableCell align="right">
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor:
                      fe.efficiencyScore >= 80 ? '#4CAF50' : fe.efficiencyScore >= 60 ? '#FFB84D' : '#F44336',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  {fe.efficiencyScore || 0}%
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={fe.overallRating || 'N/A'}
                  size="small"
                  sx={{
                    backgroundColor:
                      fe.overallRating === 'Excellent' ? '#4CAF50' :
                      fe.overallRating === 'Good' ? '#2196F3' :
                      fe.overallRating === 'Average' ? '#FFB84D' :
                      '#9E9E9E',
                    color: 'white',
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMonthlyPerformanceReport = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#FFB84D' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Field Executive</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Region</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Collection Amount</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Target Achievement %</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Settlements</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Attendance %</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Overall Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fieldExecutives.map((fe, index) => (
            <TableRow
              key={fe._id}
              sx={{
                '&:hover': { backgroundColor: '#FFF8F0' },
                backgroundColor: index % 2 === 0 ? 'white' : '#FFFBF5',
              }}
            >
              <TableCell sx={{ fontWeight: 500 }}>{fe.name}</TableCell>
              <TableCell>{fe.region}</TableCell>
              <TableCell align="right">₹{(fe.collectionAmount || 0).toLocaleString()}</TableCell>
              <TableCell align="right">
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor:
                      fe.targetAchievement >= 100 ? '#4CAF50' :
                      fe.targetAchievement >= 80 ? '#FFB84D' :
                      '#F44336',
                    color: 'white',
                    fontWeight: 600,
                  }}
                >
                  {fe.targetAchievement || 0}%
                </Box>
              </TableCell>
              <TableCell align="right">{fe.settlements || 0}</TableCell>
              <TableCell align="right">{fe.attendance || 0}%</TableCell>
              <TableCell>
                <Chip
                  label={fe.overallRating || 'N/A'}
                  size="small"
                  sx={{
                    backgroundColor:
                      fe.overallRating === 'Excellent' ? '#4CAF50' :
                      fe.overallRating === 'Good' ? '#2196F3' :
                      fe.overallRating === 'Average' ? '#FFB84D' :
                      '#9E9E9E',
                    color: 'white',
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderGeoAccuracyReport = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#FFB84D' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Field Executive</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Region</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Total Visits</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Geo-Tagged Visits</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Accuracy %</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Photos</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fieldExecutives.map((fe, index) => {
            const geoAccuracy = fe.visited > 0 ? Math.round((fe.validVisits / fe.visited) * 100) : 0;
            return (
              <TableRow
                key={fe._id}
                sx={{
                  '&:hover': { backgroundColor: '#FFF8F0' },
                  backgroundColor: index % 2 === 0 ? 'white' : '#FFFBF5',
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{fe.name}</TableCell>
                <TableCell>{fe.region}</TableCell>
                <TableCell align="right">{fe.visited || 0}</TableCell>
                <TableCell align="right">{fe.validVisits || 0}</TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor:
                        geoAccuracy >= 90 ? '#4CAF50' : geoAccuracy >= 70 ? '#FFB84D' : '#F44336',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    {geoAccuracy}%
                  </Box>
                </TableCell>
                <TableCell align="right">{fe.photos || 0}</TableCell>
                <TableCell>
                  <Chip
                    label={geoAccuracy >= 90 ? 'Excellent' : geoAccuracy >= 70 ? 'Good' : 'Needs Improvement'}
                    size="small"
                    sx={{
                      backgroundColor:
                        geoAccuracy >= 90 ? '#4CAF50' : geoAccuracy >= 70 ? '#FFB84D' : '#F44336',
                      color: 'white',
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCollectionAchievementReport = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#FFB84D' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Field Executive</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Region</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Collection Target</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Amount Collected</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Achievement %</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Settlements</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Performance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fieldExecutives.map((fe, index) => {
            const target = Math.round((fe.collectionAmount || 0) / ((fe.targetAchievement || 100) / 100));
            return (
              <TableRow
                key={fe._id}
                sx={{
                  '&:hover': { backgroundColor: '#FFF8F0' },
                  backgroundColor: index % 2 === 0 ? 'white' : '#FFFBF5',
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{fe.name}</TableCell>
                <TableCell>{fe.region}</TableCell>
                <TableCell align="right">₹{target.toLocaleString()}</TableCell>
                <TableCell align="right">₹{(fe.collectionAmount || 0).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor:
                        fe.targetAchievement >= 100 ? '#4CAF50' :
                        fe.targetAchievement >= 80 ? '#FFB84D' :
                        '#F44336',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    {fe.targetAchievement || 0}%
                  </Box>
                </TableCell>
                <TableCell align="right">{fe.settlements || 0}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      fe.targetAchievement >= 100 ? 'Exceeded' :
                      fe.targetAchievement >= 80 ? 'On Track' :
                      'Below Target'
                    }
                    size="small"
                    sx={{
                      backgroundColor:
                        fe.targetAchievement >= 100 ? '#4CAF50' :
                        fe.targetAchievement >= 80 ? '#FFB84D' :
                        '#F44336',
                      color: 'white',
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAttendanceSummary = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#FFB84D' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Field Executive</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Region</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Team</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Working Days</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Present Days</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Attendance %</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Last Active</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fieldExecutives.map((fe, index) => {
            const workingDays = 30;
            const presentDays = Math.round((fe.attendance || 0) * workingDays / 100);
            return (
              <TableRow
                key={fe._id}
                sx={{
                  '&:hover': { backgroundColor: '#FFF8F0' },
                  backgroundColor: index % 2 === 0 ? 'white' : '#FFFBF5',
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{fe.name}</TableCell>
                <TableCell>{fe.region}</TableCell>
                <TableCell>{fe.team}</TableCell>
                <TableCell align="right">{workingDays}</TableCell>
                <TableCell align="right">{presentDays}</TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor:
                        fe.attendance >= 95 ? '#4CAF50' :
                        fe.attendance >= 85 ? '#FFB84D' :
                        '#F44336',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    {fe.attendance || 0}%
                  </Box>
                </TableCell>
                <TableCell>
                  {fe.lastActiveDate ? new Date(fe.lastActiveDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={fe.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      backgroundColor: fe.isActive ? '#4CAF50' : '#F44336',
                      color: 'white',
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderFollowupComplianceReport = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#FFB84D' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Field Executive</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Region</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Allocated</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Visited</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Valid Visits</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }} align="right">Compliance %</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Performance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fieldExecutives.map((fe, index) => {
            const compliance = fe.allocated > 0 ? Math.round((fe.visited / fe.allocated) * 100) : 0;
            return (
              <TableRow
                key={fe._id}
                sx={{
                  '&:hover': { backgroundColor: '#FFF8F0' },
                  backgroundColor: index % 2 === 0 ? 'white' : '#FFFBF5',
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{fe.name}</TableCell>
                <TableCell>{fe.region}</TableCell>
                <TableCell align="right">{fe.allocated || 0}</TableCell>
                <TableCell align="right">{fe.visited || 0}</TableCell>
                <TableCell align="right">{fe.validVisits || 0}</TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor:
                        compliance >= 90 ? '#4CAF50' :
                        compliance >= 70 ? '#FFB84D' :
                        '#F44336',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    {compliance}%
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      compliance >= 90 ? 'Excellent' :
                      compliance >= 70 ? 'Good' :
                      'Needs Improvement'
                    }
                    size="small"
                    sx={{
                      backgroundColor:
                        compliance >= 90 ? '#4CAF50' :
                        compliance >= 70 ? '#FFB84D' :
                        '#F44336',
                      color: 'white',
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case 'daily-visit':
        return renderDailyVisitReport();
      case 'weekly-efficiency':
        return renderWeeklyEfficiencyReport();
      case 'monthly-performance':
        return renderMonthlyPerformanceReport();
      case 'geo-accuracy':
        return renderGeoAccuracyReport();
      case 'collection-achievement':
        return renderCollectionAchievementReport();
      case 'attendance-summary':
        return renderAttendanceSummary();
      case 'followup-compliance':
        return renderFollowupComplianceReport();
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Left Sidebar - Report Types */}
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#FF9A56' }}>
            📋 Report Types
          </Typography>
          <List sx={{ p: 0 }}>
            {reportTypes.map((report) => (
              <ListItem key={report.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={selectedReport === report.id}
                  onClick={() => setSelectedReport(report.id)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'linear-gradient(135deg, #FFB84D 0%, #FF9A56 100%)',
                      background: '#FFB84D',
                      color: 'white',
                      '&:hover': {
                        background: '#FF9A56',
                      },
                    },
                    '&:hover': {
                      backgroundColor: '#FFF8F0',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                      {report.icon}
                    </Box>
                    <ListItemText
                      primary={report.label}
                      primaryTypographyProps={{
                        fontSize: '14px',
                        fontWeight: selectedReport === report.id ? 600 : 400,
                      }}
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Right Side - Report Content */}
      <Grid item xs={12} md={9}>
        <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #FFE0B2' }}>
          {/* Report Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FF9A56' }}>
              {reportTypes.find((r) => r.id === selectedReport)?.label}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
              sx={{
                background: 'linear-gradient(135deg, #FFB84D 0%, #FF9A56 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF9A56 0%, #FFB84D 100%)',
                },
              }}
            >
              Export to Excel
            </Button>
          </Box>

          {/* Report Content */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#FF9A56' }} />
            </Box>
          ) : (
            renderReport()
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FEReports;
