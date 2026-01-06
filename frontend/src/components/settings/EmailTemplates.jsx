import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Email,
  Save,
  Visibility,
  Edit,
  Code,
  CheckCircle
} from '@mui/icons-material';
import { EmailTemplateService } from '../../services/EmailService';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState(0);

  const templateTypes = [
    { type: 'LetterApproved', label: 'Settlement Letter Approved', color: '#4CAF50' },
    { type: 'PaymentReminder', label: 'Payment Reminder', color: '#2196F3' },
    { type: 'OverdueAlert', label: 'Overdue Payment Alert', color: '#F44336' },
    { type: 'CancellationConfirmation', label: 'Settlement Cancelled', color: '#607D8B' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await EmailTemplateService.getAllTemplates();
      setTemplates(data);
      if (data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0]);
        setEditedTemplate(data[0]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load templates' });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setEditedTemplate(template);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (field, value) => {
    setEditedTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await EmailTemplateService.updateTemplate(editedTemplate._id, {
        subject: editedTemplate.subject,
        body: editedTemplate.body,
        modifiedBy: {
          name: 'Admin User',
          userId: 'admin',
          role: 'Admin'
        }
      });

      setMessage({ type: 'success', text: 'Template updated successfully!' });
      await loadTemplates();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Failed to save: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const sampleData = getSampleData(editedTemplate.templateType);
      
      const preview = await EmailTemplateService.previewTemplate(
        editedTemplate._id,
        sampleData
      );

      setPreviewContent(preview);
      setPreviewDialog(true);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate preview' });
    }
  };

  const getSampleData = (templateType) => {
    const commonData = {
      CustomerName: 'John Doe',
      AccountNumber: 'ACC12345',
      LetterNumber: 'STL-2024-001',
      BranchName: 'Mumbai Branch',
      SupportPhone: '1800-XXX-XXXX'
    };

    switch (templateType) {
      case 'LetterApproved':
        return {
          ...commonData,
          SettlementAmount: '50,000',
          WaiverAmount: '10,000',
          WaiverPercentage: '20.00',
          InstallmentSchedule: `<table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #FFAB40; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">Installment</th><th style="padding: 10px; border: 1px solid #ddd;">Due Date</th><th style="padding: 10px; border: 1px solid #ddd;">Amount</th></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">#1</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">15 Dec 2024</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹10,000</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">#2</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">15 Jan 2025</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹10,000</td></tr>
          </table>`,
          PaymentMethod: 'Online Banking'
        };
      case 'PaymentReminder':
        return {
          ...commonData,
          InstallmentNumber: '2',
          AmountDue: '10,000',
          DueDate: '15 Jan 2025',
          PaymentMethod: 'Online Banking'
        };
      case 'OverdueAlert':
        return {
          ...commonData,
          InstallmentNumber: '2',
          AmountDue: '10,000',
          DueDate: '15 Jan 2025',
          DaysOverdue: '7'
        };
      case 'CancellationConfirmation':
        return {
          ...commonData,
          CancellationDate: '15 Nov 2024',
          CancellationReason: 'Customer requested better terms'
        };
      default:
        return commonData;
    }
  };

  if (loading && templates.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Template Selection */}
        <Grid item xs={12} md={3}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Email Templates
              </Typography>
              <List>
                {templateTypes.map((temp, index) => {
                  const template = templates.find(t => t.templateType === temp.type);
                  const isSelected = selectedTemplate?.templateType === temp.type;
                  
                  return (
                    <React.Fragment key={temp.type}>
                      <ListItem
                        button
                        selected={isSelected}
                        onClick={() => template && handleTemplateSelect(template)}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: isSelected ? `${temp.color}15` : 'transparent',
                          '&:hover': {
                            bgcolor: `${temp.color}25`
                          }
                        }}
                      >
                        <Email sx={{ mr: 2, color: temp.color }} />
                        <ListItemText
                          primary={temp.label}
                          secondary={template?.isActive ? 'Active' : 'Inactive'}
                        />
                        {template?.isActive && (
                          <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />
                        )}
                      </ListItem>
                      {index < templateTypes.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Template Editor */}
        <Grid item xs={12} md={9}>
          {editedTemplate ? (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {editedTemplate.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Template Type: {editedTemplate.templateType}
                    </Typography>
                  </Box>
                  <Chip
                    label={editedTemplate.isActive ? 'Active' : 'Inactive'}
                    color={editedTemplate.isActive ? 'success' : 'default'}
                  />
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

                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                  <Tab label="Edit Template" icon={<Edit />} iconPosition="start" />
                  <Tab label="Placeholders" icon={<Code />} iconPosition="start" />
                </Tabs>

                {activeTab === 0 && (
                  <Box>
                    {/* Subject */}
                    <TextField
                      fullWidth
                      label="Email Subject"
                      value={editedTemplate.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      sx={{ mb: 3 }}
                    />

                    {/* Body */}
                    <TextField
                      fullWidth
                      label="Email Body (HTML)"
                      value={editedTemplate.body}
                      onChange={(e) => handleInputChange('body', e.target.value)}
                      multiline
                      rows={20}
                      sx={{ 
                        mb: 3,
                        '& .MuiInputBase-input': {
                          fontFamily: 'monospace',
                          fontSize: '12px'
                        }
                      }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={handlePreview}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(135deg, #FFAB40 0%, #FFD180 100%)',
                          color: 'white',
                          fontWeight: 'bold',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #FF9800 0%, #FFAB40 100%)'
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Use these placeholders in your email subject and body. They will be replaced with actual data when emails are sent.
                    </Alert>

                    <Grid container spacing={2}>
                      {editedTemplate.placeholders?.map((placeholder, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace', color: '#E65100' }}>
                              {`{{${placeholder.key}}}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {placeholder.description}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ mt: 3, p: 2, bgcolor: '#FFF3E0', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#E65100" gutterBottom>
                        Example Usage:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                        Dear {`{{CustomerName}}`},<br />
                        Your account {`{{AccountNumber}}`} has been updated.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {editedTemplate.lastModified && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Last modified: {new Date(editedTemplate.lastModified).toLocaleString()}
                      {editedTemplate.modifiedBy && ` by ${editedTemplate.modifiedBy.name}`}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Email sx={{ fontSize: 64, color: '#CCC', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a template to edit
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog} 
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Visibility sx={{ mr: 1, color: '#FFAB40' }} />
            Email Preview
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Subject:
          </Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ mb: 3 }}>
            {previewContent.subject}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Body:
          </Typography>
          <Box 
            sx={{ 
              border: '1px solid #DDD', 
              borderRadius: 1, 
              p: 2, 
              bgcolor: '#F9F9F9',
              maxHeight: 500,
              overflow: 'auto'
            }}
            dangerouslySetInnerHTML={{ __html: previewContent.body }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailTemplates;
