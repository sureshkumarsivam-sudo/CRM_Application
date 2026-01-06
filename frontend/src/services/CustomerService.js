import axios from 'axios';

/**
 * Customer Service - Handles all customer-related API calls
 */
class CustomerService {
  constructor() {
    this.baseURL = '/api/customers';
    this.timeout = 8000; // 8 second timeout
  }

  /**
   * Fetch recent customers with activity data
   */
  async getRecentAccountActivities(limit = 10) {
    try {
      const response = await axios.get(`${this.baseURL}`, {
        params: {
          page: 1,
          limit,
          sortBy: 'sanctionDate',
          sortOrder: 'desc'
        },
        timeout: this.timeout
      });

      const customers = response.data?.customers || response.data?.data || [];
      
      // Transform customer data to account activity format
      return customers.map(customer => ({
        id: customer.id || customer._id,
        loanId: customer.loanId,
        customerName: customer.accountName,
        activity: this.getActivityType(customer),
        date: customer.sanctionDate || customer.updatedAt || customer.createdAt,
        status: customer.status,
        amount: customer.totalOverDue || 0,
        principalDue: customer.principalDueOverdue || 0,
        dob: customer.dob,
        gender: customer.gender,
        mobile: customer.mobileNo,
        city: customer.city,
        state: customer.state,
        statusColor: this.getStatusColor(customer.status),
        priority: customer.totalOverDue > 0 ? 'High' : customer.principalDueOverdue > 0 ? 'Medium' : 'Low',
        // Additional fields for detailed view
        email: customer.email || 'Not Available',
        address: customer.address || 'Not Available',
        occupation: customer.occupation || 'Not Available',
        income: customer.income || 0,
        loanAmount: customer.loanAmount || 0,
        tenure: customer.tenure || 0,
        interestRate: customer.interestRate || 0,
        emi: customer.emi || 0,
        lastPaymentDate: customer.lastPaymentDate,
        nextDueDate: customer.nextDueDate,
        // Full customer object for detailed operations
        fullCustomerData: customer
      }));
    } catch (error) {
      console.error('Failed to fetch recent account activities:', error);
      throw new Error('Unable to load recent account activities');
    }
  }

  /**
   * Fetch overdue accounts
   */
  async getOverdueAccounts(limit = 10) {
    try {
      const response = await axios.get(`${this.baseURL}`, {
        params: {
          page: 1,
          limit,
          overdue: true
        },
        timeout: this.timeout
      });

      const customers = response.data?.customers || response.data?.data || [];
      
      return customers
        .filter(customer => customer.totalOverDue > 0)
        .map(customer => ({
          id: customer.id || customer._id,
          loanId: customer.loanId,
          customerName: customer.accountName,
          overdueAmount: customer.totalOverDue,
          principalDue: customer.principalDueOverdue,
          daysOverdue: this.calculateDaysOverdue(customer.sanctionDate),
          status: customer.status,
          mobile: customer.mobileNo,
          city: customer.city,
          state: customer.state
        }));
    } catch (error) {
      console.error('Failed to fetch overdue accounts:', error);
      throw new Error('Unable to load overdue accounts');
    }
  }

  /**
   * Fetch account statistics
   */
  async getAccountStatistics() {
    try {
      const response = await axios.get(`${this.baseURL}/stats/dashboard`, {
        timeout: this.timeout
      });

      return response.data || {};
    } catch (error) {
      console.error('Failed to fetch account statistics:', error);
      // Return default stats if API fails
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        overdueAccounts: 0,
        totalOverdueAmount: 0
      };
    }
  }

  /**
   * Fetch customers with pagination and search
   */
  async getCustomers({ page = 1, limit = 10, search = '' } = {}) {
    try {
      const params = {
        page,
        limit
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await axios.get(`${this.baseURL}`, {
        params,
        timeout: this.timeout
      });

      // Handle the response structure from the backend
      return {
        data: response.data?.data || response.data?.customers || [],
        pagination: response.data?.pagination || {
          totalRecords: response.data?.data?.length || 0,
          currentPage: page,
          totalPages: Math.ceil((response.data?.data?.length || 0) / limit),
          limit
        }
      };
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw new Error('Unable to load customer data');
    }
  }

  /**
   * Fetch a single customer by ID
   */
  async getCustomerById(id) {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`, {
        timeout: this.timeout
      });

      const customer = response.data?.data || response.data?.customer || response.data;
      
      // Ensure _id is present (sometimes it's in the response but gets lost)
      if (customer && !customer._id && id) {
        customer._id = id;
      }
      
      console.log('CustomerService.getCustomerById - returned customer:', customer);
      return customer;
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      throw new Error('Unable to load customer details');
    }
  }

  /**
   * Fetch a single customer by Loan ID (Account Number)
   */
  async getCustomerByLoanId(loanId) {
    try {
      const response = await axios.get(`${this.baseURL}/loan/${loanId}`, {
        timeout: this.timeout
      });

      const customer = response.data?.data || response.data?.customer || response.data;
      
      console.log('CustomerService.getCustomerByLoanId - returned customer:', customer);
      return customer;
    } catch (error) {
      console.error('Failed to fetch customer by loan ID:', error);
      throw new Error('Unable to load customer details');
    }
  }

  /**
   * Get activity type based on customer data
   */
  getActivityType(customer) {
    if (customer.totalOverDue > 0) {
      return 'Payment Overdue';
    } else if (customer.principalDueOverdue > 0) {
      return 'Principal Due';
    } else if (customer.status === 'Active') {
      return 'Account Active';
    } else {
      return 'Account Created';
    }
  }

  /**
   * Get status color
   */
  getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  }

  /**
   * Calculate days overdue
   */
  calculateDaysOverdue(sanctionDate) {
    if (!sanctionDate) return 0;
    
    const sanction = new Date(sanctionDate);
    const today = new Date();
    const diffTime = Math.abs(today - sanction);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Assuming 30 days is the payment due period
    return Math.max(0, diffDays - 30);
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
   * Upload CSV file with customer data
   */
  async uploadCSV(file, overwriteMode = false) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('overwrite', overwriteMode);

      const response = await axios.post(`${this.baseURL}/upload-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for file upload
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload CSV:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload CSV file');
    }
  }

  /**
   * Get all unique filter options from all records
   */
  async getFilterOptions() {
    try {
      const response = await axios.get(`${this.baseURL}/filter-options`, {
        timeout: this.timeout
      });

      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      // Return empty object if API fails
      return {
        productType: [],
        accountStatus: [],
        allocation: [],
        callerName: [],
        teamLeader: [],
        manager: [],
      };
    }
  }

  /**
   * Delete a single customer
   */
  async deleteCustomer(customerId) {
    try {
      const response = await axios.delete(`${this.baseURL}/${customerId}`, {
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      console.error('Failed to delete customer:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete customer');
    }
  }

  /**
   * Bulk delete customers
   */
  async bulkDeleteCustomers(customerIds) {
    try {
      const response = await axios.post(`${this.baseURL}/bulk-delete`, {
        ids: customerIds
      }, {
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete customers:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete customers');
    }
  }
}

export default new CustomerService();