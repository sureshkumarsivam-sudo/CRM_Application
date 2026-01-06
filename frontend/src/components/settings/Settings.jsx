import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  FormatListBulleted as FormatListBulletedIcon,
} from '@mui/icons-material';
import StatusCodeMatrix from './StatusCodeMatrix';
import EmailConfiguration from './EmailConfiguration';
import EmailTemplates from './EmailTemplates';
import EmailLogs from './EmailLogs';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);

  const users = [
    { id: 'U001', name: 'MANI VARMA', role: 'Collector', team: 'Team Yasodha', status: 'Active' },
    { id: 'U002', name: 'YAKOBU', role: 'Collector', team: 'Team Yasodha', status: 'Active' },
    { id: 'U003', name: 'AKALYA', role: 'Collector', team: 'Team Yasodha', status: 'Active' },
    { id: 'U004', name: 'DEVI', role: 'Collector', team: 'Team Yasodha', status: 'Active' },
    { id: 'U005', name: 'ROBI', role: 'Collector', team: 'Team Yasodha', status: 'Active' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      <Box sx={{ 
        mb: 3, 
        p: 2,
        background: '#ffffff',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
      }}>
        <Typography 
          variant="h5" 
          sx={{
            color: '#5B9BD5',
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          System Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage users, teams, configurations, and email settings
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '2px solid #e0e0e0',
            backgroundColor: 'white',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1.1rem',
              color: '#666',
              minWidth: 120,
            },
            '& .Mui-selected': {
              color: '#5B9BD5 !important',
              fontWeight: 700,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#5B9BD5',
              height: '3px',
            },
          }}
        >
          <Tab label="Users" />
          <Tab label="Teams" />
          <Tab label="Status Code Matrix" />
          <Tab label="Email Config" icon={<EmailIcon />} iconPosition="start" />
          <Tab label="Email Templates" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Email Logs" icon={<FormatListBulletedIcon />} iconPosition="start" />
          <Tab label="Configuration" />
        </Tabs>

        {/* Users Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3, backgroundColor: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                User Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{
                  background: '#5B9BD5',
                  color: 'white',
                  '&:hover': {
                    background: '#4A8BC2',
                    boxShadow: '0 2px 8px rgba(91, 155, 213, 0.3)',
                  },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  boxShadow: 'none',
                }}
              >
                Add New User
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ background: '#F5F7FA', color: '#333', fontWeight: 600, fontSize: '15px' }}>User ID</TableCell>
                    <TableCell sx={{ background: '#F5F7FA', color: '#333', fontWeight: 600, fontSize: '15px' }}>Name</TableCell>
                    <TableCell sx={{ background: '#F5F7FA', color: '#333', fontWeight: 600, fontSize: '15px' }}>Role</TableCell>
                    <TableCell sx={{ background: '#F5F7FA', color: '#333', fontWeight: 600, fontSize: '15px' }}>Team</TableCell>
                    <TableCell sx={{ background: '#F5F7FA', color: '#333', fontWeight: 600, fontSize: '15px' }}>Status</TableCell>
                    <TableCell sx={{ background: '#F5F7FA', color: '#333', fontWeight: 600, fontSize: '15px' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                        '&:hover': { backgroundColor: 'rgba(91, 155, 213, 0.05)' },
                      }}
                    >
                      <TableCell>{user.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.team}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          sx={{
                            backgroundColor: '#C8E6C9',
                            color: '#2E7D32',
                            fontWeight: 600,
                            borderRadius: '8px',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          sx={{
                            color: '#5B9BD5',
                            mr: 1,
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            color: '#F48FB1',
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Teams Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3, backgroundColor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
              Team Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Team management features will be available here. Configure teams, assign team leaders, and manage team structures.
            </Typography>
          </Box>
        )}

        {/* Status Code Matrix Tab */}
        {activeTab === 2 && (
          <StatusCodeMatrix />
        )}

        {/* Email Configuration Tab */}
        {activeTab === 3 && (
          <EmailConfiguration />
        )}

        {/* Email Templates Tab */}
        {activeTab === 4 && (
          <EmailTemplates />
        )}

        {/* Email Logs Tab */}
        {activeTab === 5 && (
          <EmailLogs />
        )}

        {/* Configuration Tab */}
        {activeTab === 6 && (
          <Box sx={{ p: 3, backgroundColor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
              System Configuration
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              System configuration options will be available here. Manage status codes, workflows, and system preferences.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Settings;
