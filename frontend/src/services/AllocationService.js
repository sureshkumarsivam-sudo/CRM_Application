import axios from 'axios';

/**
 * Allocation Service - Handles all allocation-related API calls
 */
class AllocationService {
  constructor() {
    this.baseURL = '/api/allocations';
    this.timeout = 8000; // 8 second timeout
  }

  /**
   * Get allocations with pagination and filters
   */
  async getAllocations(params = {}) {
    try {
      const response = await axios.get(this.baseURL, {
        params,
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch allocations:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch allocations');
    }
  }

  /**
   * Get single allocation by ID
   */
  async getAllocationById(id) {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`, {
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch allocation:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch allocation');
    }
  }

  /**
   * Create new allocation
   */
  async createAllocation(allocationData) {
    try {
      const response = await axios.post(this.baseURL, allocationData, {
        timeout: 10000 // 10 second timeout for creation
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create allocation:', error);
      throw new Error(error.response?.data?.message || 'Failed to create allocation');
    }
  }

  /**
   * Update allocation
   */
  async updateAllocation(id, updates) {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, updates, {
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update allocation:', error);
      throw new Error(error.response?.data?.message || 'Failed to update allocation');
    }
  }

  /**
   * Reallocate accounts
   */
  async reallocateAccounts(reallocationData) {
    try {
      const response = await axios.post(`${this.baseURL}/reallocate`, reallocationData, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Failed to reallocate accounts:', error);
      throw new Error(error.response?.data?.message || 'Failed to reallocate accounts');
    }
  }

  /**
   * Cancel allocation
   */
  async cancelAllocation(id, reason, cancelledBy) {
    try {
      const response = await axios.post(`${this.baseURL}/${id}/cancel`, {
        reason,
        cancelledBy
      }, {
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      console.error('Failed to cancel allocation:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel allocation');
    }
  }

  /**
   * Get allocation statistics
   */
  async getAllocationStats(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/stats/summary`, {
        params,
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch allocation stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch allocation stats');
    }
  }

  /**
   * Get allocation history
   */
  async getAllocationHistory(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/history/all`, {
        params,
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch allocation history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch allocation history');
    }
  }

  /**
   * Format allocation data for display
   */
  formatAllocation(allocation) {
    return {
      ...allocation,
      formattedDate: this.formatDate(allocation.allocationDate),
      formattedDeadline: allocation.deadline ? this.formatDate(allocation.deadline) : '-',
      formattedAmount: this.formatCurrency(allocation.totalOutstanding),
      statusColor: this.getStatusColor(allocation.status),
      priorityColor: this.getPriorityColor(allocation.priority)
    };
  }

  /**
   * Get status color
   */
  getStatusColor(status) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'primary';
      case 'Reassigned':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority) {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  }

  /**
   * Calculate days since allocation
   */
  daysSinceAllocation(allocationDate) {
    const now = new Date();
    const allocated = new Date(allocationDate);
    const diff = now - allocated;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

export default new AllocationService();
