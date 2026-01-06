import api from './api';

class SettlementService {
  // Get all proposals with filters
  static async getProposals(params = {}) {
    try {
      const response = await api.get('/settlement-proposals', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const response = await api.get('/settlement-proposals/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get single proposal
  static async getProposalById(id) {
    try {
      const response = await api.get(`/settlement-proposals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching proposal:', error);
      throw error;
    }
  }

  // Create new proposal
  static async createProposal(data) {
    try {
      const response = await api.post('/settlement-proposals', data);
      return response.data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }

  // Update proposal
  static async updateProposal(id, data) {
    try {
      const response = await api.put(`/settlement-proposals/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  }

  // Delete proposal
  static async deleteProposal(id) {
    try {
      const response = await api.delete(`/settlement-proposals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting proposal:', error);
      throw error;
    }
  }

  // L1 Approval
  static async approveL1(id, approved, comments, approverName) {
    try {
      const response = await api.post(`/settlement-proposals/${id}/approve-l1`, {
        approved,
        comments,
        approverName
      });
      return response.data;
    } catch (error) {
      console.error('Error in L1 approval:', error);
      throw error;
    }
  }

  // L2 Approval
  static async approveL2(id, approved, comments, approverName) {
    try {
      const response = await api.post(`/settlement-proposals/${id}/approve-l2`, {
        approved,
        comments,
        approverName
      });
      return response.data;
    } catch (error) {
      console.error('Error in L2 approval:', error);
      throw error;
    }
  }

  // Mark installment as paid
  static async markInstallmentPaid(id, installmentNumber) {
    try {
      const response = await api.post(`/settlement-proposals/${id}/mark-paid`, {
        installmentNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error marking installment as paid:', error);
      throw error;
    }
  }

  // Get pending approvals
  static async getPendingApprovals(level) {
    try {
      const response = await api.get('/settlement-proposals/approvals/pending', {
        params: { level }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  // Get audit log for a proposal
  static async getAuditLog(id) {
    try {
      const response = await api.get(`/settlement-proposals/${id}/audit-log`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }
  }

  // Get all audit logs
  static async getAllAuditLogs(params = {}) {
    try {
      const response = await api.get('/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  // Export audit logs
  static async exportAuditLogs() {
    try {
      const response = await api.get('/audit-logs/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  // Check if account is locked
  static async checkAccountLock(accountNumber) {
    try {
      const response = await api.get(`/settlement-proposals/check-lock/${accountNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error checking account lock:', error);
      throw error;
    }
  }

  // Cancel letter
  static async cancelLetter(id, reason) {
    try {
      const response = await api.post(`/settlement-proposals/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling letter:', error);
      throw error;
    }
  }

  // Check overdue payments
  static async checkOverduePayments() {
    try {
      const response = await api.post('/settlement-proposals/check-overdue');
      return response.data;
    } catch (error) {
      console.error('Error checking overdue payments:', error);
      throw error;
    }
  }

  // Get payment dashboard statistics
  static async getPaymentDashboardStats() {
    try {
      const response = await api.get('/settlement-proposals/payment-dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment dashboard stats:', error);
      throw error;
    }
  }

  // Helper methods
  static formatCurrency(amount) {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  }

  static formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  static getStatusColor(status) {
    const statusColors = {
      'Pending L1': { bg: '#FFE0B2', color: '#E65100', border: '#FF9800' },
      'L1 Approved': { bg: '#C8E6C9', color: '#1B5E20', border: '#4CAF50' },
      'Pending L2': { bg: '#FFE0B2', color: '#E65100', border: '#FF9800' },
      'Active': { bg: '#B3E5FC', color: '#01579B', border: '#03A9F4' },
      'Completed': { bg: '#C8E6C9', color: '#1B5E20', border: '#4CAF50' },
      'Rejected': { bg: '#FFCDD2', color: '#B71C1C', border: '#F44336' },
      'Cancelled': { bg: '#E0E0E0', color: '#424242', border: '#9E9E9E' },
      'Broken Settlement': { bg: '#FFCDD2', color: '#B71C1C', border: '#F44336' },
      'Invalid Proposal': { bg: '#E0E0E0', color: '#424242', border: '#9E9E9E' }
    };
    return statusColors[status] || { bg: '#E0E0E0', color: '#424242', border: '#9E9E9E' };
  }

  static getProposalTypeColor(type) {
    return type === 'Settlement' 
      ? { bg: '#B3E5FC', color: '#01579B' }
      : { bg: '#F8BBD0', color: '#880E4F' };
  }
}

export default SettlementService;
