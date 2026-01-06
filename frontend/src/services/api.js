import axios from 'axios';
import toast from 'react-hot-toast';

// Get base URL from environment or default
const getBaseURL = () => {
  // Try different possible backend URLs
  const possibleURLs = [
    'http://localhost:5000/api',
    'http://localhost:5002/api',
    'http://localhost:5001/api',
    'http://127.0.0.1:5000/api',
    'http://127.0.0.1:5002/api',
    'http://127.0.0.1:5001/api'
  ];
  
  // In development, return the first one (we'll handle retries)
  return possibleURLs[0];
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Network retry utility
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // If it's a network error, try different ports
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        const alternateURL = i === 0 ? 'http://localhost:5001/api' : 'http://localhost:5002/api';
        api.defaults.baseURL = alternateURL;
        console.log(`Retrying with alternate URL: ${alternateURL}`);
      }
      
      console.log(`Request failed, retrying in ${delay}ms... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('🚨 API Error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', message);
          break;
        case 401:
          console.error('Unauthorized:', message);
          localStorage.removeItem('authToken');
          break;
        case 403:
          console.error('Forbidden:', message);
          break;
        case 404:
          console.error('Not Found:', message);
          break;
        case 500:
          console.error('Server Error:', message);
          toast.error('Server error occurred. Please try again.');
          break;
        default:
          console.error(`HTTP ${status}:`, message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network Error - No response received:', error.request);
      toast.error('Network error. Please check your connection and try again.');
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Health check function
const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Backend health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    return false;
  }
};

// Initialize API with health check
const initializeAPI = async () => {
  const isHealthy = await healthCheck();
  if (!isHealthy) {
    console.warn('⚠️ Backend is not responding. Some features may not work.');
  }
  return isHealthy;
};

// Customer API
export const customerAPI = {
  // Get all customers with pagination and filters
  getCustomers: async (params = {}) => {
    return retryRequest(async () => {
      const response = await api.get('/customers', { params });
      return response.data;
    });
  },

  // Get customer by ID
  getCustomer: async (id) => {
    return retryRequest(async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    });
  },

  // Get customer by loan ID
  getCustomerByLoanId: async (loanId) => {
    return retryRequest(async () => {
      const response = await api.get(`/customers/loan/${loanId}`);
      return response.data;
    });
  },

  // Create new customer
  createCustomer: async (customerData) => {
    return retryRequest(async () => {
      const response = await api.post('/customers', customerData);
      return response.data;
    });
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    return retryRequest(async () => {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    });
  },

  // Delete customer
  deleteCustomer: async (id) => {
    return retryRequest(async () => {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    });
  },

  // Bulk delete customers
  bulkDeleteCustomers: async (ids) => {
    return retryRequest(async () => {
      const response = await api.delete('/customers', { data: { ids } });
      return response.data;
    });
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    return retryRequest(async () => {
      const response = await api.get('/customers/stats/dashboard');
      return response.data;
    });
  },
};

// Employee API
export const employeeAPI = {
  // Get all employees with pagination and filters
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  // Get single employee
  getEmployee: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create new employee
  createEmployee: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Bulk delete employees
  bulkDeleteEmployees: async (ids) => {
    const response = await api.delete('/employees', { data: { ids } });
    return response.data;
  },

  // Get employee summary (Total, Active, Inactive)
  getSummary: async () => {
    const response = await api.get('/employees/summary');
    return response.data;
  },

  // Get employee dashboard statistics
  getEmployeeDashboardStats: async () => {
    const response = await api.get('/employees/stats/dashboard');
    return response.data;
  },

  // Get filter options
  getFilterOptions: async () => {
    const response = await api.get('/employees/filters/options');
    return response.data;
  },
}

// Health check
export const healthAPI = {
  check: async () => {
    return retryRequest(async () => {
      const response = await api.get('/health');
      return response.data;
    });
  },
};

// Export utilities
export { initializeAPI, healthCheck, retryRequest };

export default api;