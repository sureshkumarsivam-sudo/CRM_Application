import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  AccountBalance as BankIcon,
  ContactPhone as ContactIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { useEmployee, useCreateEmployee, useUpdateEmployee } from '../../hooks/useEmployees';

// Validation schema
const schema = yup.object({
  empCode: yup.string().required('Employee code is required'),
  name: yup.string().required('Employee name is required'),
  branch: yup.string().required('Branch is required'),
  doj: yup.date().required('Date of joining is required'),
  company: yup.string().required('Company is required'),
  status: yup.string().required('Status is required'),
  gender: yup.string().required('Gender is required'),
  dob: yup.date().required('Date of birth is required'),
  department: yup.string().required('Department is required'),
  designation: yup.string().required('Designation is required'),
  employmentStatus: yup.string().required('Employment status is required'),
  contactNumber: yup.string().required('Contact number is required'),
  officialEmailId: yup.string().email('Invalid email').required('Official email is required'),
  personalEmailId: yup.string().email('Invalid email'),
  currentAddress: yup.string().required('Current address is required'),
  permanentAddress: yup.string().required('Permanent address is required'),
  experience: yup.number().min(0, 'Experience must be positive'),
  salaryOffered: yup.number().min(0, 'Salary must be positive'),
  annual: yup.number().min(0, 'Annual salary must be positive'),
});

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { data: employeeData, isLoading: isLoadingEmployee } = useEmployee(id);
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();

  const employee = employeeData?.data;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      empCode: '',
      name: '',
      branch: '',
      doj: null,
      reportingManager: '',
      company: '',
      status: 'Active',
      experience: 0,
      employmentStatus: 'Permanent',
      gender: '',
      dob: null,
      department: '',
      designation: '',
      qualification: '',
      salaryOffered: 0,
      annual: 0,
      contactNumber: '',
      maritalStatus: 'Single',
      panCardNo: '',
      aadharCardNo: '',
      bankAccountNumber: '',
      ifscCode: '',
      bankName: '',
      bankBranch: '',
      officialEmailId: '',
      personalEmailId: '',
      currentAddress: '',
      permanentAddress: '',
      emergencyContactNumber: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      referralName: '',
      uanNumber: '',
      pfNumber: '',
      esicNo: '',
      idCardDone: false,
      confirmedOrExtendedDate: null,
      exitDate: null,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEdit && employee) {
      const formData = {
        ...employee,
        doj: employee.doj ? dayjs(employee.doj) : null,
        dob: employee.dob ? dayjs(employee.dob) : null,
        confirmedOrExtendedDate: employee.confirmedOrExtendedDate ? dayjs(employee.confirmedOrExtendedDate) : null,
        exitDate: employee.exitDate ? dayjs(employee.exitDate) : null,
      };
      reset(formData);
    }
  }, [isEdit, employee, reset]);

  const onSubmit = async (data) => {
    try {
      const submitData = {
        ...data,
        doj: data.doj ? data.doj.toISOString() : null,
        dob: data.dob ? data.dob.toISOString() : null,
        confirmedOrExtendedDate: data.confirmedOrExtendedDate ? data.confirmedOrExtendedDate.toISOString() : null,
        exitDate: data.exitDate ? data.exitDate.toISOString() : null,
      };

      if (isEdit) {
        await updateEmployeeMutation.mutateAsync({ id, data: submitData });
      } else {
        await createEmployeeMutation.mutateAsync(submitData);
      }
      
      navigate('/employees');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    navigate('/employees');
  };

  if (isEdit && isLoadingEmployee) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading employee data...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2, width: '100%', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleCancel} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="empCode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Employee Code *"
                          fullWidth
                          error={!!errors.empCode}
                          helperText={errors.empCode?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Full Name *"
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="branch"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Branch *"
                          fullWidth
                          error={!!errors.branch}
                          helperText={errors.branch?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="doj"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Date of Joining *"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={!!errors.doj}
                              helperText={errors.doj?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="reportingManager"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Reporting Manager"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="company"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Company *"
                          fullWidth
                          error={!!errors.company}
                          helperText={errors.company?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.status}>
                          <InputLabel>Status *</InputLabel>
                          <Select {...field} label="Status *">
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                            <MenuItem value="Terminated">Terminated</MenuItem>
                            <MenuItem value="On Leave">On Leave</MenuItem>
                            <MenuItem value="Probation">Probation</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.gender}>
                          <InputLabel>Gender *</InputLabel>
                          <Select {...field} label="Gender *">
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="dob"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Date of Birth *"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={!!errors.dob}
                              helperText={errors.dob?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="maritalStatus"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Marital Status</InputLabel>
                          <Select {...field} label="Marital Status">
                            <MenuItem value="Single">Single</MenuItem>
                            <MenuItem value="Married">Married</MenuItem>
                            <MenuItem value="Divorced">Divorced</MenuItem>
                            <MenuItem value="Widowed">Widowed</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Professional Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon color="primary" />
                  Professional Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="department"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Department *"
                          fullWidth
                          error={!!errors.department}
                          helperText={errors.department?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="designation"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Designation *"
                          fullWidth
                          error={!!errors.designation}
                          helperText={errors.designation?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="qualification"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Qualification"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="experience"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Experience (Years)"
                          type="number"
                          fullWidth
                          error={!!errors.experience}
                          helperText={errors.experience?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="employmentStatus"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.employmentStatus}>
                          <InputLabel>Employment Status *</InputLabel>
                          <Select {...field} label="Employment Status *">
                            <MenuItem value="Permanent">Permanent</MenuItem>
                            <MenuItem value="Contract">Contract</MenuItem>
                            <MenuItem value="Temporary">Temporary</MenuItem>
                            <MenuItem value="Intern">Intern</MenuItem>
                            <MenuItem value="Consultant">Consultant</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="salaryOffered"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Monthly Salary Offered"
                          type="number"
                          fullWidth
                          error={!!errors.salaryOffered}
                          helperText={errors.salaryOffered?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="annual"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Annual Salary"
                          type="number"
                          fullWidth
                          error={!!errors.annual}
                          helperText={errors.annual?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="primary" />
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="contactNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Contact Number *"
                          fullWidth
                          error={!!errors.contactNumber}
                          helperText={errors.contactNumber?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="officialEmailId"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Official Email ID *"
                          type="email"
                          fullWidth
                          error={!!errors.officialEmailId}
                          helperText={errors.officialEmailId?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="personalEmailId"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Personal Email ID"
                          type="email"
                          fullWidth
                          error={!!errors.personalEmailId}
                          helperText={errors.personalEmailId?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon color="primary" />
                  Address Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="currentAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Current Address *"
                          multiline
                          rows={3}
                          fullWidth
                          error={!!errors.currentAddress}
                          helperText={errors.currentAddress?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="permanentAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Permanent Address *"
                          multiline
                          rows={3}
                          fullWidth
                          error={!!errors.permanentAddress}
                          helperText={errors.permanentAddress?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Identity Documents */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Identity Documents
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="panCardNo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="PAN Card Number"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="aadharCardNo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Aadhar Card Number"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Banking Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BankIcon color="primary" />
                  Banking Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="bankAccountNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Bank Account Number"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="ifscCode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="IFSC Code"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="bankName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Bank Name"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="bankBranch"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Bank Branch"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ContactIcon color="primary" />
                  Emergency Contact
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="emergencyContactName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Emergency Contact Name"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="emergencyContactNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Emergency Contact Number"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="emergencyContactRelationship"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Relationship</InputLabel>
                          <Select {...field} label="Relationship">
                            <MenuItem value="Father">Father</MenuItem>
                            <MenuItem value="Mother">Mother</MenuItem>
                            <MenuItem value="Spouse">Spouse</MenuItem>
                            <MenuItem value="Sibling">Sibling</MenuItem>
                            <MenuItem value="Friend">Friend</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="referralName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Referral Name"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="uanNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="UAN Number"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="pfNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="PF Number"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="esicNo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ESIC Number"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="confirmedOrExtendedDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Confirmed/Extended Date"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="exitDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Exit Date"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="idCardDone"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          }
                          label="ID Card Done"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Form Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Error Display */}
        {(createEmployeeMutation.error || updateEmployeeMutation.error) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {createEmployeeMutation.error?.response?.data?.message || 
             updateEmployeeMutation.error?.response?.data?.message || 
             'An error occurred while saving the employee'}
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default EmployeeForm;