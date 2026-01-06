import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Email,
  Send,
  Save,
  CheckCircle,
  Error,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { EmailConfigService } from '../../services/EmailService';

const EmailConfiguration = () => {
  const [config, setConfig] = useState({
    provider: 'SMTP',
    fromEmail: '',
    senderName: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpSecure: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadActiveConfig();
  }, []);

  const loadActiveConfig = async () => {
    try {
      setLoading(true);
      const data = await EmailConfigService.getActiveConfig();
      setConfig({
        ...data,
        smtpPassword: '' // Don't show existing password
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        setMessage({ type: 'error', text: 'Failed to load configuration' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleProviderChange = (provider) => {
    let updates = { provider };

    if (provider === 'Gmail') {
      updates.smtpHost = 'smtp.gmail.com';
      updates.smtpPort = 587;
      updates.smtpSecure = false;
    } else if (provider === 'Office365') {
      updates.smtpHost = 'smtp.office365.com';
      updates.smtpPort = 587;
      updates.smtpSecure = false;
    } else {
      // Keep current SMTP settings for custom SMTP
    }

    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter a test email address' });
      return;
    }

    try {
      setTestLoading(true);
      setTestResult(null);
      setMessage({ type: '', text: '' });

      const result = await EmailConfigService.sendTestEmail({
        recipientEmail: testEmail,
        ...config
      });

      setTestResult(result);
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Test email sent successfully! Check ${testEmail}` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: `Test failed: ${result.message}` 
        });
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
      setMessage({ 
        type: 'error', 
        text: `Test failed: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!config.fromEmail || !config.senderName || !config.smtpHost || !config.smtpUsername) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const configData = {
        ...config,
        isActive: true,
        createdBy: {
          name: 'Admin User',
          userId: 'admin',
          role: 'Admin'
        }
      };

      if (config._id) {
        await EmailConfigService.updateConfig(config._id, configData);
        setMessage({ type: 'success', text: 'Configuration updated successfully!' });
      } else {
        const result = await EmailConfigService.createConfig(configData);
        setConfig(prev => ({ ...prev, _id: result.config._id }));
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      }

      // Reload config
      await loadActiveConfig();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Failed to save: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !config._id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto' }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Email sx={{ fontSize: 32, color: '#FFAB40', mr: 2 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Email Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure SMTP settings for automated email notifications
              </Typography>
            </Box>
          </Box>

          {message.text && (
            <Alert 
              severity={message.type} 
              sx={{ mb: 3 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Email Provider */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Email Provider</InputLabel>
                <Select
                  value={config.provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  label="Email Provider"
                >
                  <MenuItem value="SMTP">Custom SMTP</MenuItem>
                  <MenuItem value="Gmail">Gmail</MenuItem>
                  <MenuItem value="Office365">Office 365</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* From Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Email Address"
                value={config.fromEmail}
                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                placeholder="noreply@company.com"
                required
                type="email"
              />
            </Grid>

            {/* Sender Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sender Name"
                value={config.senderName}
                onChange={(e) => handleInputChange('senderName', e.target.value)}
                placeholder="Debtrix CRM"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Divider>
                <Typography variant="caption" color="text.secondary">
                  SMTP Configuration
                </Typography>
              </Divider>
            </Grid>

            {/* SMTP Host */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={config.smtpHost}
                onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                required
                disabled={config.provider !== 'SMTP'}
              />
            </Grid>

            {/* SMTP Port */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="SMTP Port"
                value={config.smtpPort}
                onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                type="number"
                required
                disabled={config.provider !== 'SMTP'}
              />
            </Grid>

            {/* SMTP Username */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Username"
                value={config.smtpUsername}
                onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                placeholder="username@company.com"
                required
              />
            </Grid>

            {/* SMTP Password */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Password"
                type={showPassword ? 'text' : 'password'}
                value={config.smtpPassword}
                onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                placeholder={config._id ? '••••••••' : 'Enter password'}
                required={!config._id}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider>
                <Typography variant="caption" color="text.secondary">
                  Test Configuration
                </Typography>
              </Divider>
            </Grid>

            {/* Test Email */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Test Email Address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your.email@company.com"
                type="email"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={testLoading ? <CircularProgress size={20} /> : <Send />}
                onClick={handleTestEmail}
                disabled={testLoading || !testEmail}
                sx={{ height: 56 }}
              >
                Send Test Email
              </Button>
            </Grid>

            {testResult && (
              <Grid item xs={12}>
                <Alert 
                  severity={testResult.success ? 'success' : 'error'}
                  icon={testResult.success ? <CheckCircle /> : <Error />}
                >
                  {testResult.success 
                    ? `✅ Test email sent successfully! Check your inbox at ${testEmail}`
                    : `❌ Test failed: ${testResult.message}`
                  }
                </Alert>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #FFAB40 0%, #FFD180 100%)',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF9800 0%, #FFAB40 100%)'
                }
              }}
            >
              Save Configuration
            </Button>
          </Box>

          {config._id && config.lastTested && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F5F5', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Last tested: {new Date(config.lastTested).toLocaleString()}
                {config.testResult && (
                  <> • Status: <span style={{ color: config.testResult.success ? '#4CAF50' : '#F44336' }}>
                    {config.testResult.success ? 'Success' : 'Failed'}
                  </span></>
                )}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#E3F2FD', borderRadius: 2, border: '1px solid #2196F3' }}>
        <Typography variant="body2" color="primary" fontWeight="bold" gutterBottom>
          📌 Configuration Tips:
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><strong>Gmail:</strong> Use app-specific password (not your Gmail password)</li>
            <li><strong>Office 365:</strong> Ensure SMTP AUTH is enabled in your tenant</li>
            <li><strong>Custom SMTP:</strong> Contact your email provider for SMTP details</li>
            <li><strong>Testing:</strong> Always send a test email before saving</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default EmailConfiguration;
