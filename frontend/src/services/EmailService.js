import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const EmailConfigService = {
  // Get active email configuration
  async getActiveConfig() {
    const response = await axios.get(`${API_URL}/email-config/active`);
    return response.data;
  },

  // Get all configurations
  async getAllConfigs() {
    const response = await axios.get(`${API_URL}/email-config`);
    return response.data;
  },

  // Create new configuration
  async createConfig(configData) {
    const response = await axios.post(`${API_URL}/email-config`, configData);
    return response.data;
  },

  // Update configuration
  async updateConfig(id, configData) {
    const response = await axios.put(`${API_URL}/email-config/${id}`, configData);
    return response.data;
  },

  // Test connection
  async testConnection(configData) {
    const response = await axios.post(`${API_URL}/email-config/test-connection`, configData);
    return response.data;
  },

  // Send test email
  async sendTestEmail(emailData) {
    const response = await axios.post(`${API_URL}/email-config/send-test`, emailData);
    return response.data;
  },

  // Delete configuration
  async deleteConfig(id) {
    const response = await axios.delete(`${API_URL}/email-config/${id}`);
    return response.data;
  }
};

export const EmailTemplateService = {
  // Get all templates
  async getAllTemplates() {
    const response = await axios.get(`${API_URL}/email-templates`);
    return response.data;
  },

  // Get template by type
  async getTemplateByType(templateType) {
    const response = await axios.get(`${API_URL}/email-templates/type/${templateType}`);
    return response.data;
  },

  // Update template
  async updateTemplate(id, templateData) {
    const response = await axios.put(`${API_URL}/email-templates/${id}`, templateData);
    return response.data;
  },

  // Toggle template active status
  async toggleActive(id) {
    const response = await axios.patch(`${API_URL}/email-templates/${id}/toggle-active`);
    return response.data;
  },

  // Preview template with sample data
  async previewTemplate(templateId, sampleData) {
    const response = await axios.post(`${API_URL}/email-templates/preview`, {
      templateId,
      sampleData
    });
    return response.data;
  }
};

export const EmailLogService = {
  // Get all logs with filters
  async getLogs(params = {}) {
    const response = await axios.get(`${API_URL}/email-logs`, { params });
    return response.data;
  },

  // Get log by ID
  async getLogById(id) {
    const response = await axios.get(`${API_URL}/email-logs/${id}`);
    return response.data;
  },

  // Retry failed email
  async retryEmail(id) {
    const response = await axios.post(`${API_URL}/email-logs/${id}/retry`);
    return response.data;
  },

  // Get email statistics
  async getStats() {
    const response = await axios.get(`${API_URL}/email-logs/stats/summary`);
    return response.data;
  },

  // Export logs to CSV
  async exportToCSV(params = {}) {
    const response = await axios.get(`${API_URL}/email-logs/export/csv`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};
