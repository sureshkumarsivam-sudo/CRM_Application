import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  Description as DocumentIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import EmployeeService from '../../services/EmployeeService';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const EmployeeFormNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Personal Details
    employeeCode: '',
    fullName: '',
    gender: '',
    dateOfBirth: null,
    bloodGroup: '',
    contactNumber: '',
    emailId: '',
    permanentAddress: '',
    presentAddress: '',
    sameAsPermanent: false,
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    
    // Employment Details
    companyName: '',
    branch: '',
    designation: '',
    reportingManager: '',
    dateOfJoining: null,
    employmentStatus: 'Active',
    status: 'Probation',
    idCardStatus: 'Pending',
    referralName: '',
    
    // Educational Details
    qualification: '',
    institutionName: '',
    yearOfPassing: '',
    percentageGrade: '',
    
    // Work Experience
    previousCompanyName: '',
    previousDesignation: '',
    durationFrom: null,
    durationTo: null,
    reasonForLeaving: '',
    
    // Statutory & Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    uanNumber: '',
    pfNumber: '',
    esicNumber: '',
    
    // Form metadata
    formStatus: 'Draft',
    formCompletionPercentage: 0,
  });

  useEffect(() => {
    if (isEdit) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await EmployeeService.getEmployee(id);
      const emp = response.data;
      
      setFormData({
        ...emp,
        dateOfBirth: emp.dateOfBirth ? dayjs(emp.dateOfBirth) : null,
        dateOfJoining: emp.dateOfJoining ? dayjs(emp.dateOfJoining) : null,
        durationFrom: emp.durationFrom ? dayjs(emp.durationFrom) : null,
        durationTo: emp.durationTo ? dayjs(emp.durationTo) : null,
      });
      
      if (emp.uploadPhoto?.path) {
        setPhotoPreview(emp.uploadPhoto.path);
      }
    } catch (err) {
      setError('Failed to load employee data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-fill present address if same as permanent
    if (field === 'sameAsPermanent' && value === true) {
      setFormData(prev => ({
        ...prev,
        presentAddress: prev.permanentAddress
      }));
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload if editing
    if (isEdit && id) {
      try {
        await EmployeeService.uploadPhoto(id, file);
        setSuccess('Photo uploaded successfully');
      } catch (err) {
        setError('Failed to upload photo');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const dataToSubmit = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
        dateOfJoining: formData.dateOfJoining ? formData.dateOfJoining.toISOString() : null,
        durationFrom: formData.durationFrom ? formData.durationFrom.toISOString() : null,
        durationTo: formData.durationTo ? formData.durationTo.toISOString() : null,
        formStatus: 'Submitted',
      };
      
      if (isEdit) {
        await EmployeeService.updateEmployee(id, dataToSubmit);
        setSuccess('Employee updated successfully');
      } else {
        await EmployeeService.createEmployee(dataToSubmit);
        setSuccess('Employee created successfully');
      }
      
      setTimeout(() => {
        navigate('/employees');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dataToSubmit = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
        dateOfJoining: formData.dateOfJoining ? formData.dateOfJoining.toISOString() : null,
        durationFrom: formData.durationFrom ? formData.durationFrom.toISOString() : null,
        durationTo: formData.durationTo ? formData.durationTo.toISOString() : null,
        formStatus: 'Draft',
      };
      
      if (isEdit) {
        await EmployeeService.updateEmployee(id, dataToSubmit);
        setSuccess('Draft saved successfully');
      } else {
        const response = await EmployeeService.createEmployee(dataToSubmit);
        setSuccess('Draft saved successfully');
        // Navigate to edit mode with the new ID
        if (response.data._id) {
          setTimeout(() => {
            navigate(`/employees/edit/${response.data._id}`);
          }, 1000);
        }
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextTab = () => {
    if (tabValue < 5) {
      setTabValue(tabValue + 1);
    }
  };

  const handlePreviousTab = () => {
    if (tabValue > 0) {
      setTabValue(tabValue - 1);
    }
  };

  const calculateFormCompletion = () => {
    let completed = 0;
    let total = 0;

    // Personal Details (8 required fields)
    const personalFields = ['employeeCode', 'fullName', 'gender', 'dateOfBirth', 'contactNumber', 'emailId'];
    personalFields.forEach(field => {
      total++;
      if (formData[field]) completed++;
    });

    // Employment Details (4 fields)
    const employmentFields = ['branch', 'designation', 'dateOfJoining', 'employmentStatus'];
    employmentFields.forEach(field => {
      total++;
      if (formData[field]) completed++;
    });

    return Math.round((completed / total) * 100);
  };

  const handleCancel = () => {
    navigate('/employees');
  };

  if (loading && isEdit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#2C8C99' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2, width: '100%', height: '100%' }}>
        {/* Header */}
        <Box sx={{ 
          mb: 3,
          p: 3,
          background: '#fff',
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton
              onClick={() => navigate('/employees')}
              sx={{ color: '#2C8C99' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h5" 
                sx={{
                  color: '#333',
                  fontWeight: 600,
                }}
              >
                Employee Information & Joining Formality
              </Typography>
            </Box>
          </Box>
          
          {/* Form Completion Progress */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Form Completion
              </Typography>
              <Typography variant="body2" sx={{ color: '#2C8C99', fontWeight: 600 }}>
                {calculateFormCompletion()}%
              </Typography>
            </Box>
            <Box sx={{ 
              width: '100%', 
              height: 4, 
              bgcolor: '#e0e0e0', 
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                width: `${calculateFormCompletion()}%`, 
                height: '100%', 
                bgcolor: '#2C8C99',
                transition: 'width 0.3s ease'
              }} />
            </Box>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Form */}
        <Paper sx={{ borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#666',
                  textTransform: 'none',
                  minHeight: 48,
                  px: 2,
                },
                '& .Mui-selected': {
                  color: '#fff !important',
                  backgroundColor: '#2C8C99',
                  borderRadius: '4px 4px 0 0',
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Personal Details" />
              <Tab icon={<WorkIcon fontSize="small" />} iconPosition="start" label="Employment Details" />
              <Tab icon={<SchoolIcon fontSize="small" />} iconPosition="start" label="Educational Details" />
              <Tab icon={<BusinessIcon fontSize="small" />} iconPosition="start" label="Work Experience" />
              <Tab icon={<BankIcon fontSize="small" />} iconPosition="start" label="Statutory & Bank" />
              <Tab icon={<DocumentIcon fontSize="small" />} iconPosition="start" label="Documents" />
            </Tabs>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ p: 3 }}>
              {/* Tab 1: Personal Details */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  {/* Photo Upload */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar
                        src={photoPreview}
                        sx={{ width: 120, height: 120, bgcolor: '#2C8C99' }}
                      >
                        {formData.fullName?.charAt(0) || 'E'}
                      </Avatar>
                      <Box>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          sx={{
                            borderColor: '#2C8C99',
                            color: '#2C8C99',
                            '&:hover': {
                              borderColor: '#1e6370',
                              backgroundColor: 'rgba(44, 140, 153, 0.05)',
                            },
                          }}
                        >
                          Upload Photo
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handlePhotoChange}
                          />
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: '#666' }}>
                          Maximum file size: 5MB
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Employee Code"
                      fullWidth
                      required
                      value={formData.employeeCode}
                      onChange={(e) => handleChange('employeeCode', e.target.value)}
                      disabled={isEdit}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={formData.gender}
                        label="Gender"
                        onChange={(e) => handleChange('gender', e.target.value)}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.dateOfBirth}
                      onChange={(date) => handleChange('dateOfBirth', date)}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Blood Group</InputLabel>
                      <Select
                        value={formData.bloodGroup}
                        label="Blood Group"
                        onChange={(e) => handleChange('bloodGroup', e.target.value)}
                      >
                        <MenuItem value="A+">A+</MenuItem>
                        <MenuItem value="A-">A-</MenuItem>
                        <MenuItem value="B+">B+</MenuItem>
                        <MenuItem value="B-">B-</MenuItem>
                        <MenuItem value="AB+">AB+</MenuItem>
                        <MenuItem value="AB-">AB-</MenuItem>
                        <MenuItem value="O+">O+</MenuItem>
                        <MenuItem value="O-">O-</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Contact Number"
                      fullWidth
                      required
                      value={formData.contactNumber}
                      onChange={(e) => handleChange('contactNumber', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email ID"
                      type="email"
                      fullWidth
                      required
                      value={formData.emailId}
                      onChange={(e) => handleChange('emailId', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Permanent Address"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.permanentAddress}
                      onChange={(e) => handleChange('permanentAddress', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.sameAsPermanent}
                          onChange={(e) => handleChange('sameAsPermanent', e.target.checked)}
                          sx={{
                            color: '#2C8C99',
                            '&.Mui-checked': {
                              color: '#2C8C99',
                            },
                          }}
                        />
                      }
                      label="Present Address same as Permanent Address"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Present Address"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.presentAddress}
                      onChange={(e) => handleChange('presentAddress', e.target.value)}
                      disabled={formData.sameAsPermanent}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, color: '#2C8C99' }}>
                      Emergency Contact
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Emergency Contact Name"
                      fullWidth
                      value={formData.emergencyContactName}
                      onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Relationship"
                      fullWidth
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Emergency Contact Number"
                      fullWidth
                      value={formData.emergencyContactNumber}
                      onChange={(e) => handleChange('emergencyContactNumber', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Tab 2: Employment Details */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Company Name"
                      fullWidth
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Branch"
                      fullWidth
                      value={formData.branch}
                      onChange={(e) => handleChange('branch', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Designation"
                      fullWidth
                      value={formData.designation}
                      onChange={(e) => handleChange('designation', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Reporting Manager"
                      fullWidth
                      value={formData.reportingManager}
                      onChange={(e) => handleChange('reportingManager', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Date of Joining"
                      value={formData.dateOfJoining}
                      onChange={(date) => handleChange('dateOfJoining', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Employment Status</InputLabel>
                      <Select
                        value={formData.employmentStatus}
                        label="Employment Status"
                        onChange={(e) => handleChange('employmentStatus', e.target.value)}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                        <MenuItem value="On Leave">On Leave</MenuItem>
                        <MenuItem value="Resigned">Resigned</MenuItem>
                        <MenuItem value="Terminated">Terminated</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => handleChange('status', e.target.value)}
                      >
                        <MenuItem value="Probation">Probation</MenuItem>
                        <MenuItem value="Confirmed">Confirmed</MenuItem>
                        <MenuItem value="Contract">Contract</MenuItem>
                        <MenuItem value="Trainee">Trainee</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>ID Card Status</InputLabel>
                      <Select
                        value={formData.idCardStatus}
                        label="ID Card Status"
                        onChange={(e) => handleChange('idCardStatus', e.target.value)}
                      >
                        <MenuItem value="Issued">Issued</MenuItem>
                        <MenuItem value="Not Issued">Not Issued</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Referral Name (if any)"
                      fullWidth
                      value={formData.referralName}
                      onChange={(e) => handleChange('referralName', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Tab 3: Educational Details */}
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Qualification"
                      fullWidth
                      value={formData.qualification}
                      onChange={(e) => handleChange('qualification', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Institution Name"
                      fullWidth
                      value={formData.institutionName}
                      onChange={(e) => handleChange('institutionName', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Year of Passing"
                      fullWidth
                      value={formData.yearOfPassing}
                      onChange={(e) => handleChange('yearOfPassing', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Percentage/Grade"
                      fullWidth
                      value={formData.percentageGrade}
                      onChange={(e) => handleChange('percentageGrade', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Tab 4: Work Experience */}
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Previous Company Name"
                      fullWidth
                      value={formData.previousCompanyName}
                      onChange={(e) => handleChange('previousCompanyName', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Previous Designation"
                      fullWidth
                      value={formData.previousDesignation}
                      onChange={(e) => handleChange('previousDesignation', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Duration From"
                      value={formData.durationFrom}
                      onChange={(date) => handleChange('durationFrom', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Duration To"
                      value={formData.durationTo}
                      onChange={(date) => handleChange('durationTo', date)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Reason for Leaving"
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.reasonForLeaving}
                      onChange={(e) => handleChange('reasonForLeaving', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Tab 5: Statutory & Bank Details */}
              <TabPanel value={tabValue} index={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#2C8C99' }}>
                      Bank Details
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Bank Name"
                      fullWidth
                      value={formData.bankName}
                      onChange={(e) => handleChange('bankName', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Account Number"
                      fullWidth
                      value={formData.accountNumber}
                      onChange={(e) => handleChange('accountNumber', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="IFSC Code"
                      fullWidth
                      value={formData.ifscCode}
                      onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, color: '#2C8C99' }}>
                      Statutory Details
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="UAN Number"
                      fullWidth
                      value={formData.uanNumber}
                      onChange={(e) => handleChange('uanNumber', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="PF Number"
                      fullWidth
                      value={formData.pfNumber}
                      onChange={(e) => handleChange('pfNumber', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="ESIC Number"
                      fullWidth
                      value={formData.esicNumber}
                      onChange={(e) => handleChange('esicNumber', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Tab 6: Documents */}
              <TabPanel value={tabValue} index={5}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Document upload functionality is available after saving the employee record.
                      {isEdit && ' You can upload documents now.'}
                    </Alert>
                  </Grid>

                  {isEdit && (
                    <>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Aadhar Card
                            </Typography>
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<CloudUploadIcon />}
                              fullWidth
                            >
                              Upload Aadhar Card
                              <input type="file" hidden accept="image/*,application/pdf" />
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              PAN Card
                            </Typography>
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<CloudUploadIcon />}
                              fullWidth
                            >
                              Upload PAN Card
                              <input type="file" hidden accept="image/*,application/pdf" />
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Educational Certificates
                            </Typography>
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<CloudUploadIcon />}
                              fullWidth
                            >
                              Upload Certificates
                              <input type="file" hidden accept="image/*,application/pdf" multiple />
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Experience Certificates
                            </Typography>
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<CloudUploadIcon />}
                              fullWidth
                            >
                              Upload Certificates
                              <input type="file" hidden accept="image/*,application/pdf" multiple />
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    </>
                  )}
                </Grid>
              </TabPanel>

              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'space-between', 
                mt: 4,
                pt: 3,
                borderTop: '1px solid #e0e0e0'
              }}>
                {/* Left side - Clear Form */}
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear the form?')) {
                      setFormData({
                        employeeCode: '',
                        fullName: '',
                        gender: '',
                        dateOfBirth: null,
                        bloodGroup: '',
                        contactNumber: '',
                        emailId: '',
                        permanentAddress: '',
                        presentAddress: '',
                        sameAsPermanent: false,
                        emergencyContactName: '',
                        emergencyContactRelationship: '',
                        emergencyContactNumber: '',
                        companyName: '',
                        branch: '',
                        designation: '',
                        reportingManager: '',
                        dateOfJoining: null,
                        employmentStatus: 'Active',
                        status: 'Probation',
                        idCardStatus: 'Pending',
                        referralName: '',
                        qualification: '',
                        institutionName: '',
                        yearOfPassing: '',
                        percentageGrade: '',
                        previousCompanyName: '',
                        previousDesignation: '',
                        durationFrom: null,
                        durationTo: null,
                        reasonForLeaving: '',
                        bankName: '',
                        accountNumber: '',
                        ifscCode: '',
                        uanNumber: '',
                        pfNumber: '',
                        esicNumber: '',
                        formStatus: 'Draft',
                        formCompletionPercentage: 0,
                      });
                      setTabValue(0);
                    }
                  }}
                  disabled={loading}
                  sx={{
                    borderColor: '#999',
                    color: '#666',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#666',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                >
                  Clear Form
                </Button>

                {/* Right side - Navigation and Submit buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Previous button (except on first tab) */}
                  {tabValue > 0 && (
                    <Button
                      variant="outlined"
                      onClick={handlePreviousTab}
                      disabled={loading}
                      sx={{
                        borderColor: '#2C8C99',
                        color: '#2C8C99',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#1e6370',
                          backgroundColor: 'rgba(44, 140, 153, 0.05)',
                        },
                      }}
                    >
                      Previous
                    </Button>
                  )}

                  {/* Save Draft button */}
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveDraft}
                    disabled={loading}
                    sx={{
                      borderColor: '#9C27B0',
                      color: '#9C27B0',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#7B1FA2',
                        backgroundColor: 'rgba(156, 39, 176, 0.05)',
                      },
                    }}
                  >
                    Save Draft
                  </Button>

                  {/* Next/Submit button */}
                  {tabValue < 5 ? (
                    <Button
                      variant="contained"
                      onClick={handleNextTab}
                      disabled={loading}
                      sx={{
                        background: '#2C8C99',
                        color: '#fff',
                        textTransform: 'none',
                        px: 4,
                        '&:hover': {
                          background: '#1e6370',
                        },
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                      sx={{
                        background: '#2C8C99',
                        color: '#fff',
                        textTransform: 'none',
                        px: 4,
                        '&:hover': {
                          background: '#1e6370',
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit for Approval'}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default EmployeeFormNew;
