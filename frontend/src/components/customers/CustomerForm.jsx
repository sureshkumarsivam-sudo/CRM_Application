import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { useCustomer, useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers';

// Validation schema
const schema = yup.object({
  loanId: yup.string().required('Loan ID is required'),
  accountName: yup.string().required('Customer name is required'),
  gender: yup.string().required('Gender is required'),
  phoneNo: yup.string().required('Phone number is required'),
  mobileNo: yup.string().required('Mobile number is required'),
  city: yup.string().required('City is required'),
  pin: yup.string().required('PIN code is required'),
  state: yup.string().required('State is required'),
  addressDetails: yup.string().required('Address is required'),
  email: yup.string().email('Invalid email format'),
  sanctionAmount: yup.number().min(0, 'Amount must be positive'),
  disbursementAmount: yup.number().min(0, 'Amount must be positive'),
  emi: yup.number().min(0, 'EMI must be positive'),
  tenure: yup.number().min(0, 'Tenure must be positive'),
  interestRate: yup.number().min(0, 'Interest rate must be positive').max(100, 'Interest rate cannot exceed 100%'),
  principalDueOverDue: yup.number().min(0, 'Amount must be positive'),
  otherCharges: yup.number().min(0, 'Amount must be positive'),
  totalOverDue: yup.number().min(0, 'Amount must be positive'),
});

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { data: customerData, isLoading: isLoadingCustomer } = useCustomer(id);
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const customer = customerData?.data;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      loanId: '',
      parent: '',
      accountName: '',
      dob: null,
      pan: '',
      aadhaarNumber: '',
      gender: 'Male',
      occupation: '',
      profession: '',
      educationLevel: '',
      nationality: 'Indian',
      addressDetails: '',
      city: '',
      pin: '',
      state: '',
      location: '',
      team: '',
      phoneNo: '',
      mobileNo: '',
      email: '',
      employerType: '',
      employerName: '',
      employerAddress: '',
      sanctionDate: null,
      sanctionAmount: 0,
      disbursementAmount: 0,
      disbursementDate: null,
      emiStartDate: null,
      emi: 0,
      tenure: 0,
      maturityDate: null,
      principalDueOverDue: 0,
      otherCharges: 0,
      totalOverDue: 0,
      dateOfNPA: null,
      interestRate: 0,
      status: 'Active',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEdit && customer) {
      const formData = {
        ...customer,
        dob: customer.dob ? dayjs(customer.dob) : null,
        sanctionDate: customer.sanctionDate ? dayjs(customer.sanctionDate) : null,
        disbursementDate: customer.disbursementDate ? dayjs(customer.disbursementDate) : null,
        emiStartDate: customer.emiStartDate ? dayjs(customer.emiStartDate) : null,
        maturityDate: customer.maturityDate ? dayjs(customer.maturityDate) : null,
        dateOfNPA: customer.dateOfNPA ? dayjs(customer.dateOfNPA) : null,
      };
      reset(formData);
    }
  }, [customer, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      // Convert dayjs objects to ISO strings
      const submitData = {
        ...data,
        dob: data.dob ? data.dob.toISOString() : null,
        sanctionDate: data.sanctionDate ? data.sanctionDate.toISOString() : null,
        disbursementDate: data.disbursementDate ? data.disbursementDate.toISOString() : null,
        emiStartDate: data.emiStartDate ? data.emiStartDate.toISOString() : null,
        maturityDate: data.maturityDate ? data.maturityDate.toISOString() : null,
        dateOfNPA: data.dateOfNPA ? data.dateOfNPA.toISOString() : null,
      };

      if (isEdit) {
        await updateCustomerMutation.mutateAsync({ id, data: submitData });
        navigate(`/customers/${id}`);
      } else {
        const result = await createCustomerMutation.mutateAsync(submitData);
        navigate(`/customers/${result.data.id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (isEdit && isLoadingCustomer) {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton height={60} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Skeleton height={80} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/customers')}
            variant="outlined"
          >
            Back to Customers
          </Button>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {isEdit ? `Edit Customer - ${customer?.accountName}` : 'Add New Customer'}
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="loanId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Loan ID *"
                      error={!!errors.loanId}
                      helperText={errors.loanId?.message}
                      disabled={isEdit} // Don't allow editing loan ID
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="accountName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Customer Name *"
                      error={!!errors.accountName}
                      helperText={errors.accountName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Date of Birth"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dob,
                          helperText: errors.dob?.message,
                        },
                      }}
                      maxDate={dayjs()}
                    />
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
                      {errors.gender && (
                        <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                          {errors.gender.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="pan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="PAN Number"
                      error={!!errors.pan}
                      helperText={errors.pan?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="aadhaarNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Aadhaar Number"
                      error={!!errors.aadhaarNumber}
                      helperText={errors.aadhaarNumber?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="nationality"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nationality"
                      error={!!errors.nationality}
                      helperText={errors.nationality?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="educationLevel"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Education Level"
                      error={!!errors.educationLevel}
                      helperText={errors.educationLevel?.message}
                    />
                  )}
                />
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="phoneNo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number *"
                      error={!!errors.phoneNo}
                      helperText={errors.phoneNo?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="mobileNo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mobile Number *"
                      error={!!errors.mobileNo}
                      helperText={errors.mobileNo?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="addressDetails"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address Details *"
                      multiline
                      rows={3}
                      error={!!errors.addressDetails}
                      helperText={errors.addressDetails?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City *"
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="State *"
                      error={!!errors.state}
                      helperText={errors.state?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="pin"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="PIN Code *"
                      error={!!errors.pin}
                      helperText={errors.pin?.message}
                    />
                  )}
                />
              </Grid>

              {/* Employment Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Employment Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="occupation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Occupation"
                      error={!!errors.occupation}
                      helperText={errors.occupation?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="profession"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Profession"
                      error={!!errors.profession}
                      helperText={errors.profession?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="employerName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Employer Name"
                      error={!!errors.employerName}
                      helperText={errors.employerName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="employerType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Employer Type"
                      error={!!errors.employerType}
                      helperText={errors.employerType?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="employerAddress"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Employer Address"
                      multiline
                      rows={2}
                      error={!!errors.employerAddress}
                      helperText={errors.employerAddress?.message}
                    />
                  )}
                />
              </Grid>

              {/* Loan Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Loan Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="sanctionAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Sanction Amount"
                      type="number"
                      error={!!errors.sanctionAmount}
                      helperText={errors.sanctionAmount?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="disbursementAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Disbursement Amount"
                      type="number"
                      error={!!errors.disbursementAmount}
                      helperText={errors.disbursementAmount?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="emi"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="EMI"
                      type="number"
                      error={!!errors.emi}
                      helperText={errors.emi?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="tenure"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tenure (months)"
                      type="number"
                      error={!!errors.tenure}
                      helperText={errors.tenure?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="interestRate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Interest Rate (%)"
                      type="number"
                      error={!!errors.interestRate}
                      helperText={errors.interestRate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="NPA">NPA</MenuItem>
                        <MenuItem value="Closed">Closed</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Important Dates */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Important Dates
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="sanctionDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Sanction Date"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.sanctionDate,
                          helperText: errors.sanctionDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="disbursementDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Disbursement Date"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.disbursementDate,
                          helperText: errors.disbursementDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="emiStartDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="EMI Start Date"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.emiStartDate,
                          helperText: errors.emiStartDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="maturityDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Maturity Date"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.maturityDate,
                          helperText: errors.maturityDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Additional Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="team"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Team"
                      error={!!errors.team}
                      helperText={errors.team?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Location"
                      error={!!errors.location}
                      helperText={errors.location?.message}
                    />
                  )}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12} sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/customers')}
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
                  {isSubmitting ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default CustomerForm;