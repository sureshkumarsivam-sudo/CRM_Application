import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class EmployeeService {
  // Get all employees with pagination and filters
  static async getEmployees(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees-new`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  // Get single employee by ID
  static async getEmployee(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees-new/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  // Create new employee
  static async createEmployee(employeeData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/employees-new`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  // Update employee
  static async updateEmployee(id, employeeData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/employees-new/${id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  // Delete employee
  static async deleteEmployee(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/employees-new/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  // Bulk delete employees
  static async bulkDeleteEmployees(ids) {
    try {
      const response = await axios.post(`${API_BASE_URL}/employees-new/bulk-delete`, { ids });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting employees:', error);
      throw error;
    }
  }

  // Upload employee photo
  static async uploadPhoto(id, file) {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post(
        `${API_BASE_URL}/employees-new/${id}/upload-photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  // Upload documents
  static async uploadDocuments(id, files, documentType) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('documents', file);
      });
      formData.append('documentType', documentType);

      const response = await axios.post(
        `${API_BASE_URL}/employees-new/${id}/upload-documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }

  // Get employee summary (Total, Active, Inactive counts)
  static async getSummary() {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  }

  // Get employee statistics
  static async getStatistics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees-new/stats/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  // Get filter options
  static async getFilterOptions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/filters/options`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  }
}

export default EmployeeService;
