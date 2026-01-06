import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  ShowChart as ShowChartIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  Gavel as GavelIcon,
  Payment as PaymentIcon,
  Feedback as FeedbackIcon,
  DirectionsWalk as DirectionsWalkIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const ReportsAnalytics = () => {
  const reportSections = [
    {
      title: 'Collection Reports',
      reports: [
        { name: 'Daily Collection Report', icon: <BarChartIcon /> },
        { name: 'Caller-wise Performance', icon: <PeopleIcon /> },
        { name: 'Team-wise Performance', icon: <AssessmentIcon /> },
        { name: 'Bucket-wise Outstanding', icon: <ShowChartIcon /> },
        { name: 'Recovery Trend Analysis', icon: <TrendingUpIcon /> },
      ],
    },
    {
      title: 'Account Reports',
      reports: [
        { name: 'Portfolio Summary', icon: <AccountBalanceIcon /> },
        { name: 'NPA Accounts', icon: <WarningIcon /> },
        { name: 'Settlement Report', icon: <GavelIcon /> },
        { name: 'Payment Collection Report', icon: <PaymentIcon /> },
      ],
    },
    {
      title: 'Activity Reports',
      reports: [
        { name: 'Feedback/Remark Report', icon: <FeedbackIcon /> },
        { name: 'Field Visit Report', icon: <DirectionsWalkIcon /> },
        { name: 'Allocation Report', icon: <AssignmentIcon /> },
        { name: 'Audit Trail Report', icon: <SecurityIcon /> },
      ],
    },
  ];

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
        Reports & Analytics
      </Typography>

      <Grid container spacing={3}>
        {reportSections.map((section, sectionIndex) => (
          <Grid item xs={12} md={4} key={sectionIndex}>
            <Paper
              sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'white',
                  borderBottom: '3px solid #FFB84D',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                  {section.title}
                </Typography>
              </Box>
              <List sx={{ backgroundColor: '#FFF9E6', p: 0 }}>
                {section.reports.map((report, reportIndex) => (
                  <ListItem
                    key={reportIndex}
                    button
                    sx={{
                      borderBottom: '1px solid #FFE0B2',
                      py: 2,
                      '&:hover': {
                        backgroundColor: '#FFE0B2',
                      },
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#FF9A56', minWidth: 40 }}>
                      {report.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={report.name}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: '#333',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportsAnalytics;
