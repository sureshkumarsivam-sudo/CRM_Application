import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const PTPPaymentService = {
  // Get all PTP payments with filters and pagination
  getPTPPayments: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/ptp-payments`, { 
        params,
        timeout: 10000 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching PTP payments:', error);
      throw error.response?.data || { message: 'Failed to fetch PTP payments' };
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const response = await axios.get(`${API_URL}/ptp-payments/filters`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error.response?.data || { message: 'Failed to fetch filter options' };
    }
  },

  // Get summary statistics
  getSummary: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/ptp-payments/summary`, {
        params: filters,
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error.response?.data || { message: 'Failed to fetch summary' };
    }
  },

  // Get single PTP payment by ID
  getPTPPaymentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/ptp-payments/${id}`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching PTP payment:', error);
      throw error.response?.data || { message: 'Failed to fetch PTP payment' };
    }
  },

  // Create new PTP payment
  createPTPPayment: async (ptpPaymentData) => {
    try {
      const response = await axios.post(`${API_URL}/ptp-payments`, ptpPaymentData, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error creating PTP payment:', error);
      throw error.response?.data || { message: 'Failed to create PTP payment' };
    }
  },

  // Update PTP payment
  updatePTPPayment: async (id, ptpPaymentData) => {
    try {
      const response = await axios.put(`${API_URL}/ptp-payments/${id}`, ptpPaymentData, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error updating PTP payment:', error);
      throw error.response?.data || { message: 'Failed to update PTP payment' };
    }
  },

  // Delete PTP payment
  deletePTPPayment: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/ptp-payments/${id}`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting PTP payment:', error);
      throw error.response?.data || { message: 'Failed to delete PTP payment' };
    }
  },

  // Upload Excel/CSV file
  uploadExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/ptp-payments/upload-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000 // 60 seconds for file upload
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      throw error.response?.data || { message: 'Failed to upload Excel file' };
    }
  },

  // Download Excel (client-side generation)
  downloadExcel: async (filters = {}) => {
    try {
      // Get all records with filters
      const response = await axios.get(`${API_URL}/ptp-payments`, {
        params: { ...filters, limit: 10000 },
        timeout: 30000
      });

      const data = response.data.data || [];

      // Convert to CSV
      const headers = [
        'ACCOUNT_NUMBER',
        'CUSTOMER_NAME',
        'PTP_AMOUNT',
        'STATUS',
        'PAYMENT_DATE',
        'CONTACT_NUMBER',
        'CALLER_NAME',
        'AM_TL',
        'PROCESS'
      ];

      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          row.accountNumber || '',
          `"${(row.customerName || '').replace(/"/g, '""')}"`,
          row.ptpAmount || 0,
          row.status || '',
          row.paymentDate ? new Date(row.paymentDate).toISOString().split('T')[0] : '',
          row.contactNumber || '',
          `"${(row.callerName || '').replace(/"/g, '""')}"`,
          `"${(row.amAndTL || '').replace(/"/g, '""')}"`,
          `"${(row.process || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `ptp_payments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, message: 'Excel file downloaded successfully' };
    } catch (error) {
      console.error('Error downloading Excel:', error);
      throw error.response?.data || { message: 'Failed to download Excel file' };
    }
  },

  // Helper function to format currency
  formatCurrency: (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  },

  // Helper function to format date
  formatDate: (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '-';
    }
  },

  // Helper function to get status color
  getStatusColor: (status) => {
    const colors = {
      'PTP': { bg: '#FFF9E6', color: '#F57C00', border: '#FFB84D' },
      'COLLECTED': { bg: '#E8F5E9', color: '#2E7D32', border: '#4CAF50' },
      'PDC': { bg: '#E3F2FD', color: '#1565C0', border: '#2196F3' },
      'PART-PAYMENT': { bg: '#FFF3E0', color: '#E65100', border: '#FF9800' },
      'W-SETT': { bg: '#F3E5F5', color: '#6A1B9A', border: '#9C27B0' }
    };
    return colors[status] || { bg: '#F5F5F5', color: '#666', border: '#CCC' };
  }
};

export default PTPPaymentService;
