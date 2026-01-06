import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const UserService = {
  // Get all users with filters
  getUsers: async (filters = {}) => {
    try {
      const response = await axios.get(API_URL, {
        params: filters,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user' };
    }
  },
  
  // Get users by role
  getUsersByRole: async (role) => {
    try {
      const response = await axios.get(`${API_URL}?role=${role}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users by role' };
    }
  },
  
  // Get pending approval users
  getPendingApprovalUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/pending-approval`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pending users' };
    }
  },
  
  // Approve user
  approveUser: async (userId, approvalData) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}/approve`, approvalData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve user' };
    }
  },
  
  // Reject user
  rejectUser: async (userId, reason) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}/reject`, { reason }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject user' };
    }
  },
  
  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}`, userData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update user' };
    }
  },
  
  // Delete user (soft delete)
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },
  
  // Get user privileges
  getUserPrivileges: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}/privileges`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user privileges' };
    }
  },
  
  // Update user privilege (grant or revoke)
  updateUserPrivilege: async (userId, privilegeKey, value) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}/privileges`, {
        privilegeKey,
        value
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update privilege' };
    }
  },
  
  // Bulk update privileges
  bulkUpdatePrivileges: async (changes) => {
    try {
      const response = await axios.put(`${API_URL}/privileges/bulk-update`, {
        changes
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to bulk update privileges' };
    }
  },
  
  // Get privilege audit log
  getPrivilegeAuditLog: async (userId, limit = 50) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}/privilege-audit-log`, {
        params: { limit },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch audit log' };
    }
  },
  
  // Lock user account
  lockUser: async (userId, reason) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}/lock`, { reason }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to lock user' };
    }
  },
  
  // Unlock user account
  unlockUser: async (userId) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}/unlock`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to unlock user' };
    }
  },
  
  // Change user role
  changeUserRole: async (userId, newRole) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}/role`, { newRole }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change user role' };
    }
  }
};

export default UserService;
