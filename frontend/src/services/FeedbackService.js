import api from './api';

const FeedbackService = {
  // Get all feedback for a customer
  getFeedbackByCustomerId: async (customerId) => {
    try {
      const response = await api.get(`/feedback/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  // Get feedback by loan ID
  getFeedbackByLoanId: async (loanId) => {
    try {
      const response = await api.get(`/feedback/loan/${loanId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  // Create new feedback
  createFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  // Update feedback
  updateFeedback: async (id, updates) => {
    try {
      const response = await api.put(`/feedback/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    try {
      const response = await api.delete(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },

  // Get feedback statistics
  getFeedbackStats: async (customerId) => {
    try {
      const response = await api.get(`/feedback/stats/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      throw error;
    }
  }
};

export default FeedbackService;
