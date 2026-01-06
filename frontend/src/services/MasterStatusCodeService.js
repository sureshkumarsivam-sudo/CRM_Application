import api from './api';

const MasterStatusCodeService = {
  // Get all status codes with pagination, sorting, and filtering
  async getStatusCodes(params = {}) {
    try {
      const response = await api.get('/status-codes', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching status codes:', error);
      throw error;
    }
  },

  // Get single status code by ID
  async getStatusCodeById(id) {
    try {
      const response = await api.get(`/status-codes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching status code:', error);
      throw error;
    }
  },

  // Get status code by code
  async getStatusCodeByCode(code) {
    try {
      const response = await api.get(`/status-codes/code/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching status code by code:', error);
      throw error;
    }
  },

  // Get available categories
  async getCategories() {
    try {
      const response = await api.get('/status-codes/filters/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create new status code
  async createStatusCode(statusCodeData) {
    try {
      const response = await api.post('/status-codes', statusCodeData);
      return response.data;
    } catch (error) {
      console.error('Error creating status code:', error);
      throw error;
    }
  },

  // Update status code
  async updateStatusCode(id, statusCodeData) {
    try {
      const response = await api.put(`/status-codes/${id}`, statusCodeData);
      return response.data;
    } catch (error) {
      console.error('Error updating status code:', error);
      throw error;
    }
  },

  // Delete status code
  async deleteStatusCode(id) {
    try {
      const response = await api.delete(`/status-codes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting status code:', error);
      throw error;
    }
  }
};

export default MasterStatusCodeService;
