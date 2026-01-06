import axios from 'axios';

const API_URL = 'http://localhost:5000/api/field-executives';

const FieldExecutiveService = {
  // Get all field executives with filters
  getAllFieldExecutives: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.region) params.append('region', filters.region);
      if (filters.team) params.append('team', filters.team);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await axios.get(`${API_URL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching field executives:', error);
      throw error;
    }
  },

  // Get field executive by ID
  getFieldExecutiveById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching field executive:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  getDashboardStats: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.region) params.append('region', filters.region);
      if (filters.team) params.append('team', filters.team);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      
      const response = await axios.get(`${API_URL}/stats/dashboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Create new field executive
  createFieldExecutive: async (data) => {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating field executive:', error);
      throw error;
    }
  },

  // Update field executive
  updateFieldExecutive: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating field executive:', error);
      throw error;
    }
  },

  // Delete field executive
  deleteFieldExecutive: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting field executive:', error);
      throw error;
    }
  },

  // Bulk import field executives
  bulkImport: async (fieldExecutives) => {
    try {
      const response = await axios.post(`${API_URL}/bulk-import`, { fieldExecutives });
      return response.data;
    } catch (error) {
      console.error('Error bulk importing field executives:', error);
      throw error;
    }
  },

  // Get regions
  getRegions: async () => {
    try {
      const response = await axios.get(`${API_URL}/filters/regions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },

  // Get teams
  getTeams: async () => {
    try {
      const response = await axios.get(`${API_URL}/filters/teams`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }
};

export default FieldExecutiveService;
