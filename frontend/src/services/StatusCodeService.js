import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class StatusCodeService {
  // Get all status codes with filtering
  static async getStatusCodes(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/status-code-matrix`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching status codes:', error);
      throw error;
    }
  }

  // Get status codes for caller
  static async getCallerStatusCodes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/status-code-matrix`, {
        params: {
          applicableFor: 'CALLER',
          isActive: true,
          limit: 1000
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching caller status codes:', error);
      throw error;
    }
  }

  // Get status codes for field executive
  static async getFieldExecutiveStatusCodes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/status-code-matrix`, {
        params: {
          applicableFor: 'FIELD_EXECUTIVE',
          isActive: true,
          limit: 1000
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching field executive status codes:', error);
      throw error;
    }
  }

  // Get a single status code by ID
  static async getStatusCodeById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/status-code-matrix/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching status code:', error);
      throw error;
    }
  }

  // Create a new status code
  static async createStatusCode(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/status-code-matrix`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating status code:', error);
      throw error;
    }
  }

  // Update a status code
  static async updateStatusCode(id, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/status-code-matrix/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating status code:', error);
      throw error;
    }
  }

  // Delete a status code
  static async deleteStatusCode(id, hardDelete = false) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/status-code-matrix/${id}`, {
        params: { hardDelete }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting status code:', error);
      throw error;
    }
  }

  // Get formatted status codes for dropdown
  static async getFormattedStatusCodes(applicableFor = null) {
    try {
      const params = {
        isActive: true,
        limit: 1000
      };
      
      if (applicableFor) {
        params.applicableFor = applicableFor;
      }
      
      const response = await axios.get(`${API_BASE_URL}/status-code-matrix`, { params });
      const codes = response.data.data || [];
      
      return codes.map(code => ({
        value: code.code,
        label: `${code.code} - ${code.statusName}`,
        description: code.description,
        nextAction: code.nextActionTrigger,
        color: code.color,
        priority: code.priority
      }));
    } catch (error) {
      console.error('Error fetching formatted status codes:', error);
      return [];
    }
  }
}

export default StatusCodeService;
