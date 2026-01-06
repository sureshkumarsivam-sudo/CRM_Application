import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin-settings';

const AdminSettingsService = {
  // User Role Waiver Limits
  getWaiverLimits: async () => {
    try {
      const response = await axios.get(`${API_URL}/waiver-limits`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch waiver limits' };
    }
  },

  getWaiverLimitByRole: async (role) => {
    try {
      const response = await axios.get(`${API_URL}/waiver-limits/${role}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch waiver limit' };
    }
  },

  saveWaiverLimit: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/waiver-limits`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save waiver limit' };
    }
  },

  updateWaiverLimit: async (role, data) => {
    try {
      const response = await axios.put(`${API_URL}/waiver-limits/${role}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update waiver limit' };
    }
  },

  // Global Waiver Policy
  getGlobalPolicy: async () => {
    try {
      const response = await axios.get(`${API_URL}/global-policy`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch global policy' };
    }
  },

  saveGlobalPolicy: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/global-policy`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save global policy' };
    }
  },

  // Installment Defaults
  getInstallmentDefaults: async () => {
    try {
      const response = await axios.get(`${API_URL}/installment-defaults`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch installment defaults' };
    }
  },

  saveInstallmentDefaults: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/installment-defaults`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save installment defaults' };
    }
  },

  // Letter Templates
  getLetterTemplates: async () => {
    try {
      const response = await axios.get(`${API_URL}/letter-templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch letter templates' };
    }
  },

  getLetterTemplateById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/letter-templates/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch letter template' };
    }
  },

  createLetterTemplate: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/letter-templates`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create letter template' };
    }
  },

  updateLetterTemplate: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/letter-templates/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update letter template' };
    }
  },

  deleteLetterTemplate: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/letter-templates/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete letter template' };
    }
  },

  // Audit Trail
  getAuditTrail: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/audit-trail`, {
        params: filters,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch audit trail' };
    }
  },

  // Initialize default settings
  initializeSettings: async () => {
    try {
      const response = await axios.post(`${API_URL}/initialize`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to initialize settings' };
    }
  }
};

export default AdminSettingsService;
