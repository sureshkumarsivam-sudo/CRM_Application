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
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock privileges generator based on role
const getMockPrivilegesForRole = (role) => {
  const privilegeTemplates = {
    'Super Admin': {
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: true,
        settings: true,
        employees: true,
        audit: true,
        admin: true
      },
      privileges: {
        grant_privileges: true,
        revoke_privileges: true,
        manage_status_codes: true
      }
    },
    'Admin': {
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: true,
        settings: true,
        employees: true,
        audit: true,
        admin: true
      },
      privileges: {
        grant_privileges: true,
        revoke_privileges: true,
        manage_status_codes: true
      }
    },
    'Team Lead': {
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: true,
        settings: false,
        employees: true,
        audit: false,
        admin: false
      },
      privileges: {}
    },
    'Manager': {
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: true,
        settings: false,
        employees: true,
        audit: false,
        admin: false
      },
      privileges: {}
    },
    'Caller': {
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: false,
        field_executive: false,
        documents: true,
        reports: false,
        settings: false,
        employees: false,
        audit: false,
        admin: false
      },
      privileges: {}
    },
    'Field Executive': {
      menu_access: {
        dashboard: true,
        accounts: true,
        allocations: true,
        collections: true,
        settlements: true,
        field_executive: true,
        documents: true,
        reports: false,
        settings: false,
        employees: false,
        audit: false,
        admin: false
      },
      privileges: {}
    }
  };
  
  return privilegeTemplates[role] || { menu_access: {}, privileges: {} };
};

const LoginPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
    role: ''
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form validation
  const [touched, setTouched] = useState({});
  
  // Available roles
  const roles = [
    'Super Admin',
    'Admin',
    'Team Lead',
    'Manager',
    'Caller',
    'Field Executive'
  ];
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error on input change
  };
  
  // Handle blur to mark field as touched
  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };
  
  // Validate form
  const isFormValid = () => {
    return (
      formData.emailOrUsername.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.role !== ''
    );
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, simulate successful login for testing
      
      // Uncomment below when backend API is ready:
      /*
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailOrUsername: formData.emailOrUsername,
          password: formData.password,
          role: formData.role
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials or role mismatch');
      }
      
      // Store auth token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      */
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For testing: Create a mock token and user data
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUser = {
        _id: 'user-' + Date.now(),
        fullName: formData.emailOrUsername,
        email: formData.emailOrUsername + '@example.com',
        role: formData.role,
        accountStatus: 'Active'
      };
      
      // Store mock auth token and user data
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUser));
      
      // Mock privileges based on role
      const mockPrivileges = getMockPrivilegesForRole(formData.role);
      localStorage.setItem('userPrivileges', JSON.stringify(mockPrivileges));
      
      // Redirect based on role
      switch (formData.role) {
        case 'Super Admin':
        case 'Admin':
          navigate('/dashboard', { replace: true });
          break;
        case 'Team Lead':
          navigate('/dashboard', { replace: true });
          break;
        case 'Manager':
          navigate('/dashboard', { replace: true });
          break;
        case 'Caller':
          navigate('/dashboard', { replace: true });
          break;
        case 'Field Executive':
          navigate('/dashboard', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E8F1FD 0%, #F5F9FF 100%)',
        padding: 3
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo/Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2
              }}
            >
              <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#1F2937',
                mb: 1
              }}
            >
              CRM ERP System
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6B7280' }}
            >
              Sign in to your account
            </Typography>
          </Box>
          
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email/Username Field */}
            <TextField
              fullWidth
              label="Username / Email"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              onBlur={() => handleBlur('emailOrUsername')}
              required
              placeholder="Enter your username or email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#6B7280' }} />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2.5 }}
              error={touched.emailOrUsername && !formData.emailOrUsername}
              helperText={touched.emailOrUsername && !formData.emailOrUsername ? 'This field is required' : ''}
            />
            
            {/* Password Field */}
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              required
              placeholder="Enter your password"
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
              sx={{ mb: 2.5 }}
              error={touched.password && !formData.password}
              helperText={touched.password && !formData.password ? 'This field is required' : ''}
            />
            
            {/* Role Selector */}
            <FormControl fullWidth sx={{ mb: 3 }} required>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={() => handleBlur('role')}
                label="Role"
                startAdornment={
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: '#6B7280', ml: 1 }} />
                  </InputAdornment>
                }
                error={touched.role && !formData.role}
              >
                <MenuItem value="">
                  <em>Select your role</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/forgot-password');
                }}
                sx={{
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot Password?
              </Link>
            </Box>
            
            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isFormValid() || loading}
              sx={{
                background: isFormValid() && !loading
                  ? 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'
                  : 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)',
                color: 'white',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)',
                '&:hover': {
                  background: isFormValid() && !loading
                    ? 'linear-gradient(135deg, #357ABD 0%, #2868A8 100%)'
                    : 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)',
                  boxShadow: '0 4px 12px rgba(74, 144, 226, 0.4)'
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
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              OR
            </Typography>
          </Divider>
          
          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Don't have an account?{' '}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/signup');
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
                Sign Up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
