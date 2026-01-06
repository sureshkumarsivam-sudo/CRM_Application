import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Phone as PhoneIcon,
  DirectionsRun as FieldIcon,
} from '@mui/icons-material';

import CallerFeedbackStatusCodes from './CallerFeedbackStatusCodes';
import FieldExecutiveFeedbackStatusCodes from './FieldExecutiveFeedbackStatusCodes';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`master-data-tabpanel-${index}`}
      aria-labelledby={`master-data-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const MasterData = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const a11yProps = (index) => {
    return {
      id: `master-data-tab-${index}`,
      'aria-controls': `master-data-tabpanel-${index}`,
    };
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <SettingsIcon fontSize="large" />
          Master Data Management
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
          Manage system configuration and status codes
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="master data tabs"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
                fontWeight: 'medium',
              }
            }}
          >
            <Tab 
              icon={<PhoneIcon />} 
              label="Caller Feedback Status Codes" 
              {...a11yProps(0)}
              sx={{ 
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                '& .MuiTab-iconWrapper': {
                  marginBottom: 0
                }
              }}
            />
            <Tab 
              icon={<FieldIcon />} 
              label="Field Executive Status Codes" 
              {...a11yProps(1)}
              sx={{ 
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                '& .MuiTab-iconWrapper': {
                  marginBottom: 0
                }
              }}
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <CallerFeedbackStatusCodes />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <FieldExecutiveFeedbackStatusCodes />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default MasterData;