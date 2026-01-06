import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Skeleton,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  ContactPhone as ContactIcon,
  Home as HomeIcon,
  AccountBalance as BankIcon,
  LocalHospital as EmergencyIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { useEmployee, useDeleteEmployee } from '../../hooks/useEmployees';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, isLoading, error } = useEmployee(id);
  const deleteEmployeeMutation = useDeleteEmployee();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : '-';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'Terminated': return 'error';
      case 'On Leave': return 'warning';
      case 'Probation': return 'info';
      default: return 'default';
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await deleteEmployeeMutation.mutateAsync(id);
      navigate('/employees');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={600} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading employee: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Employee not found
        </Alert>
      </Box>
    );
  }

  const emp = employee.data;

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/employees')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            {emp.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {emp.empCode} • {emp.designation}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/employees/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleteEmployeeMutation.isLoading}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Employee Code</Typography>
                  <Typography variant="body1" fontWeight="bold">{emp.empCode}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box>
                    <Chip label={emp.status} color={getStatusColor(emp.status)} size="small" />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">{emp.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Father's Name</Typography>
                  <Typography variant="body1">{emp.fatherName || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1">{formatDate(emp.dob)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Gender</Typography>
                  <Typography variant="body1">{emp.gender || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Blood Group</Typography>
                  <Typography variant="body1">{emp.bloodGroup || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Marital Status</Typography>
                  <Typography variant="body1">{emp.maritalStatus || '-'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Professional Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WorkIcon color="primary" />
                Professional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{emp.department}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Designation</Typography>
                  <Typography variant="body1">{emp.designation}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Branch</Typography>
                  <Typography variant="body1">{emp.branch}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Reporting Manager</Typography>
                  <Typography variant="body1">{emp.reportingManager || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Date of Joining</Typography>
                  <Typography variant="body1">{formatDate(emp.doj)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Experience</Typography>
                  <Typography variant="body1">{emp.experience || 0} years</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Employment Type</Typography>
                  <Typography variant="body1">{emp.employmentType || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Work Mode</Typography>
                  <Typography variant="body1">{emp.workMode || '-'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ContactIcon color="primary" />
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Personal Email</Typography>
                  <Typography variant="body1">{emp.personalEmailId || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Official Email</Typography>
                  <Typography variant="body1">{emp.officialEmailId || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Contact Number</Typography>
                  <Typography variant="body1">{emp.contactNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Alternate Number</Typography>
                  <Typography variant="body1">{emp.alternateContactNumber || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">WhatsApp Number</Typography>
                  <Typography variant="body1">{emp.whatsappNumber || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">LinkedIn Profile</Typography>
                  <Typography variant="body1">{emp.linkedinProfile || '-'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Address Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <HomeIcon color="primary" />
                Address Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Current Address</Typography>
                  <Typography variant="body1">
                    {emp.currentAddress || '-'}
                  </Typography>
                  {emp.currentCity && (
                    <Typography variant="body2" color="text.secondary">
                      {emp.currentCity}, {emp.currentState} - {emp.currentPincode}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Permanent Address</Typography>
                  <Typography variant="body1">
                    {emp.permanentAddress || '-'}
                  </Typography>
                  {emp.permanentCity && (
                    <Typography variant="body2" color="text.secondary">
                      {emp.permanentCity}, {emp.permanentState} - {emp.permanentPincode}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BankIcon color="primary" />
                Financial Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Salary Offered</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(emp.salaryOffered)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Current CTC</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(emp.currentCtc)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Bank Name</Typography>
                  <Typography variant="body1">{emp.bankName || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1">{emp.accountNumber || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">IFSC Code</Typography>
                  <Typography variant="body1">{emp.ifscCode || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">PAN Number</Typography>
                  <Typography variant="body1">{emp.panNumber || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Aadhar Number</Typography>
                  <Typography variant="body1">{emp.aadharNumber || '-'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmergencyIcon color="primary" />
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Contact Name</Typography>
                  <Typography variant="body1">{emp.emergencyContactName || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Relationship</Typography>
                  <Typography variant="body1">{emp.emergencyContactRelation || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Contact Number</Typography>
                  <Typography variant="body1">{emp.emergencyContactNumber || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{emp.emergencyContactEmail || '-'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Education & Company */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SchoolIcon color="primary" />
                    Education & Skills
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Highest Qualification</Typography>
                      <Typography variant="body1">{emp.qualification || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">College/University</Typography>
                      <Typography variant="body1">{emp.college || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Skills</Typography>
                      <Typography variant="body1">{emp.skills || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Certifications</Typography>
                      <Typography variant="body1">{emp.certifications || '-'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon color="primary" />
                    Company Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Company</Typography>
                      <Typography variant="body1">{emp.company || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Previous Company</Typography>
                      <Typography variant="body1">{emp.previousCompany || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Notice Period</Typography>
                      <Typography variant="body1">{emp.noticePeriod || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Last Working Day</Typography>
                      <Typography variant="body1">{formatDate(emp.lastWorkingDay)}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information */}
        {emp.remarks && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Remarks
                </Typography>
                <Typography variant="body1">
                  {emp.remarks}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Loading State for Delete */}
      {deleteEmployeeMutation.isLoading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Deleting employee...
        </Alert>
      )}
    </Box>
  );
};

export default EmployeeDetail;