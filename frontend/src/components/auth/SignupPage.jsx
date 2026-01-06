import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    employeeId: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form validation
  const [touched, setTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  
  // Available roles (excluding Super Admin)
  const roles = [
    'Admin',
    'Team Lead',
    'Manager',
    'Caller',
    'Field Executive'
  ];
  
  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validateMobile = (mobile) => {
    const re = /^[0-9]{10}$/;
    return re.test(mobile);
  };
  
  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors for this field
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setError(null);
    
    // Real-time validation
    validateField(name, value);
  };
  
  // Validate individual field
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (value && !validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'mobileNumber':
        if (value && !validateMobile(value)) {
          error = 'Please enter a valid 10-digit mobile number';
        }
        break;
      case 'password':
        if (value && !validatePassword(value)) {
          error = 'Password must be at least 8 characters with uppercase, lowercase, and number';
        }
        break;
      case 'confirmPassword':
        if (value && value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  // Handle blur
  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, formData[field]);
  };
  
  // Validate entire form
  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      validateEmail(formData.email) &&
      formData.mobileNumber.trim() !== '' &&
      validateMobile(formData.mobileNumber) &&
      formData.employeeId.trim() !== '' &&
      formData.role !== '' &&
      formData.password.trim() !== '' &&
      validatePassword(formData.password) &&
      formData.confirmPassword.trim() !== '' &&
      formData.password === formData.confirmPassword &&
      Object.values(validationErrors).every(err => err === '')
    );
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please fill in all required fields correctly');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, simulate successful signup and redirect to login
      
      // Uncomment below when backend API is ready:
      /*
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          employeeId: formData.employeeId,
          role: formData.role,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      */
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess(true);
      
      // Clear form
      setFormData({
        fullName: '',
        email: '',
        mobileNumber: '',
        employeeId: '',
        role: '',
        password: '',
        confirmPassword: ''
      });
      
      // Redirect to login after showing success message (2 seconds)
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { text: '', color: '' };
    if (password.length < 8) return { text: 'Weak', color: '#EF4444' };
    if (!validatePassword(password)) return { text: 'Medium', color: '#F59E0B' };
    return { text: 'Strong', color: '#10B981' };
  };
  
  const passwordStrength = getPasswordStrength();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E6F4F1 0%, #F2FBF9 100%)',
        padding: 3
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 700,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2
              }}
            >
              <PersonAddIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#1F2937',
                mb: 1
              }}
            >
              Create Your Account
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6B7280' }}
            >
              Register for ERP system access
            </Typography>
          </Box>
          
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {/* Success Alert */}
          {success && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Account created successfully!
              </Typography>
              <Typography variant="body2">
                Your account is pending approval. Redirecting to login page...
              </Typography>
            </Alert>
          )}
          
          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  required
                  placeholder="Enter your full name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#6B7280' }} />
                      </InputAdornment>
                    )
                  }}
                  error={touched.fullName && !formData.fullName}
                  helperText={touched.fullName && !formData.fullName ? 'Full name is required' : ''}
                />
              </Grid>
              
              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email ID"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  required
                  placeholder="your.email@company.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#6B7280' }} />
                      </InputAdornment>
                    )
                  }}
                  error={touched.email && (validationErrors.email || !formData.email)}
                  helperText={
                    touched.email && validationErrors.email
                      ? validationErrors.email
                      : touched.email && !formData.email
                      ? 'Email is required'
                      : ''
                  }
                />
              </Grid>
              
              {/* Mobile Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={() => handleBlur('mobileNumber')}
                  required
                  placeholder="10-digit mobile number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#6B7280' }} />
                      </InputAdornment>
                    )
                  }}
                  error={touched.mobileNumber && (validationErrors.mobileNumber || !formData.mobileNumber)}
                  helperText={
                    touched.mobileNumber && validationErrors.mobileNumber
                      ? validationErrors.mobileNumber
                      : touched.mobileNumber && !formData.mobileNumber
                      ? 'Mobile number is required'
                      : ''
                  }
                />
              </Grid>
              
              {/* Employee ID */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  onBlur={() => handleBlur('employeeId')}
                  required
                  placeholder="Enter employee ID"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: '#6B7280' }} />
                      </InputAdornment>
                    )
                  }}
                  error={touched.employeeId && !formData.employeeId}
                  helperText={touched.employeeId && !formData.employeeId ? 'Employee ID is required' : ''}
                />
              </Grid>
              
              {/* Role Selector */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>User Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    onBlur={() => handleBlur('role')}
                    label="User Role"
                    startAdornment={
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: '#6B7280', ml: 1 }} />
                      </InputAdornment>
                    }
                    error={touched.role && !formData.role}
                  >
                    <MenuItem value="">
                      <em>Select role</em>
                    </MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  required
                  placeholder="Create strong password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#6B7280' }} />
                      </InputAdornment>
                    ),
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
                  error={touched.password && (validationErrors.password || !formData.password)}
                  helperText={
                    touched.password && validationErrors.password
                      ? validationErrors.password
                      : ''
                  }
                />
                {formData.password && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: passwordStrength.color,
                      fontWeight: 600,
                      mt: 0.5,
                      display: 'block'
                    }}
                  >
                    Password Strength: {passwordStrength.text}
                  </Typography>
                )}
              </Grid>
              
              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  required
                  placeholder="Re-enter password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#6B7280' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  error={touched.confirmPassword && (validationErrors.confirmPassword || !formData.confirmPassword)}
                  helperText={
                    touched.confirmPassword && validationErrors.confirmPassword
                      ? validationErrors.confirmPassword
                      : ''
                  }
                />
              </Grid>
              
              {/* Password Requirements */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Password Requirements:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
                    • Minimum 8 characters • At least 1 uppercase letter • At least 1 lowercase letter • At least 1 number
                  </Typography>
                </Box>
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={!isFormValid() || loading || success}
                  sx={{
                    background: isFormValid() && !loading && !success
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)',
                    color: 'white',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    '&:hover': {
                      background: isFormValid() && !loading && !success
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : success ? (
                    'Account Created!'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
          
          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              OR
            </Typography>
          </Divider>
          
          {/* Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Already have an account?{' '}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                sx={{
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignupPage;
