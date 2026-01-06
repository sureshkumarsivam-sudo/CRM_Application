import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const AuthService = {
  // Login
  login: async (emailOrUsername, password, role) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        emailOrUsername,
        password,
        role
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Fetch and store role privileges
        if (response.data.user.role) {
          try {
            const privilegesResponse = await axios.get(
              `http://localhost:5000/api/roles/privileges/${response.data.user.role}`,
              {
                headers: {
                  'Authorization': `Bearer ${response.data.token}`
                }
              }
            );
            
            if (privilegesResponse.data.privileges) {
              localStorage.setItem('userPrivileges', JSON.stringify(privilegesResponse.data.privileges));
            }
          } catch (privError) {
            console.error('Failed to fetch privileges:', privError);
            // Set default empty privileges if fetch fails
            localStorage.setItem('userPrivileges', JSON.stringify({
              menu_access: {},
              privileges: {}
            }));
          }
        }
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },
  
  // Signup
  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Signup failed' };
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userPrivileges');
  },
  
  // Get current user
  getCurrentUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  // Get auth token
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  // Refresh token
  refreshToken: async () => {
    try {
      const response = await axios.post(`${API_URL}/refresh-token`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token refresh failed' };
    }
  },
  
  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset request failed' };
    }
  },
  
  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(`${API_URL}/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password change failed' };
    }
  },
  
  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Email verification failed' };
    }
  },
  
  // Get user privileges
  getUserPrivileges: () => {
    const privileges = localStorage.getItem('userPrivileges');
    return privileges ? JSON.parse(privileges) : { menu_access: {}, privileges: {} };
  },
  
  // Check if user has menu access
  hasMenuAccess: (menuKey) => {
    const privileges = AuthService.getUserPrivileges();
    return privileges.menu_access?.[menuKey] === true;
  },
  
  // Check privilege
  hasPrivilege: (category, privilegeKey) => {
    const privileges = AuthService.getUserPrivileges();
    if (!privileges.privileges) return false;
    
    // If only one parameter, treat as privilegeKey and search all categories
    if (arguments.length === 1) {
      const key = category;
      for (const cat in privileges.privileges) {
        if (privileges.privileges[cat][key] === true) {
          return true;
        }
      }
      return false;
    }
    
    // Two parameters: category and privilegeKey
    return privileges.privileges?.[category]?.[privilegeKey] === true;
  },
  
  // Get user role
  getUserRole: () => {
    const user = AuthService.getCurrentUser();
    return user?.role || null;
  },
  
  // Refresh user privileges
  refreshPrivileges: async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || !user.role) return;
      
      const response = await axios.get(
        `http://localhost:5000/api/roles/privileges/${user.role}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      if (response.data.privileges) {
        localStorage.setItem('userPrivileges', JSON.stringify(response.data.privileges));
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to refresh privileges:', error);
      throw error;
    }
  }
};

export default AuthService;
