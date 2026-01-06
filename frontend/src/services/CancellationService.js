import api from './api';

class CancellationService {
  // Create cancellation request
  static async createCancellationRequest(data) {
    try {
      const response = await api.post('/cancellation-requests', data);
      return response.data;
    } catch (error) {
      console.error('Error creating cancellation request:', error);
      throw error;
    }
  }

  // Get all cancellation requests with filters
  static async getCancellationRequests(params = {}) {
    try {
      const response = await api.get('/cancellation-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching cancellation requests:', error);
      throw error;
    }
  }

  // Get pending L1 cancellations
  static async getPendingL1Cancellations() {
    try {
      const response = await api.get('/cancellation-requests/pending-l1');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending L1 cancellations:', error);
      throw error;
    }
  }

  // Get pending admin finalizations
  static async getPendingAdminFinalizations() {
    try {
      const response = await api.get('/cancellation-requests/pending-admin');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending admin finalizations:', error);
      throw error;
    }
  }

  // Get single cancellation request
  static async getCancellationRequestById(id) {
    try {
      const response = await api.get(`/cancellation-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cancellation request:', error);
      throw error;
    }
  }

  // L1 Manager review
  static async l1Review(id, decision, comments, reviewedBy) {
    try {
      const response = await api.post(`/cancellation-requests/${id}/l1-review`, {
        decision,
        comments,
        reviewedBy
      });
      return response.data;
    } catch (error) {
      console.error('Error processing L1 review:', error);
      throw error;
    }
  }

  // Admin finalization
  static async adminFinalize(id, comments, finalizedBy) {
    try {
      const response = await api.post(`/cancellation-requests/${id}/admin-finalize`, {
        comments,
        finalizedBy
      });
      return response.data;
    } catch (error) {
      console.error('Error finalizing cancellation:', error);
      throw error;
    }
  }

  // Get cancellation history for a proposal
  static async getCancellationHistory(proposalId) {
    try {
      const response = await api.get(`/cancellation-requests/proposal/${proposalId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cancellation history:', error);
      throw error;
    }
  }

  // Helper methods
  static getCancellationReasonOptions() {
    return [
      'Customer requested cancellation',
      'Account settled through other means',
      'Customer default/unable to pay',
      'Administrative correction needed',
      'Other'
    ];
  }

  static getStatusColor(status) {
    const statusColors = {
      'Awaiting L1 Manager Review': { bg: '#FFE0B2', color: '#E65100', border: '#FF9800' },
      'L1 Approved - Awaiting Admin': { bg: '#C8E6C9', color: '#1B5E20', border: '#4CAF50' },
      'L1 Rejected': { bg: '#FFCDD2', color: '#B71C1C', border: '#F44336' },
      'Admin Finalized': { bg: '#B3E5FC', color: '#01579B', border: '#03A9F4' },
      'Cancelled': { bg: '#E0E0E0', color: '#424242', border: '#9E9E9E' }
    };
    return statusColors[status] || { bg: '#E0E0E0', color: '#424242', border: '#9E9E9E' };
  }

  static formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  static formatDateTime(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default CancellationService;
