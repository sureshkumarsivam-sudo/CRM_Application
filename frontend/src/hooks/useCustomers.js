import { useQuery, useMutation, useQueryClient } from 'react-query';
import { customerAPI } from '../services/api';
import toast from 'react-hot-toast';

// Query keys
export const QUERY_KEYS = {
  customers: 'customers',
  customer: 'customer',
  dashboardStats: 'dashboardStats',
};

// Enhanced error handler
const handleQueryError = (error, context = '') => {
  console.error(`Customer ${context} error:`, error);
  
  // Don't show toast for network errors during initial load
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    console.warn('Network error detected, showing connection status instead of toast');
    return;
  }
  
  const message = error.response?.data?.message || error.message || 'An error occurred';
  toast.error(`${context}: ${message}`);
};

// Enhanced retry logic
const getRetryConfig = () => ({
  retry: (failureCount, error) => {
    // Don't retry 4xx errors
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }
    // Retry network errors up to 3 times
    return failureCount < 3;
  },
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});

// Get customers with pagination and filters
export const useCustomers = (params = {}) => {
  return useQuery(
    [QUERY_KEYS.customers, params],
    () => customerAPI.getCustomers(params),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      ...getRetryConfig(),
      onError: (error) => handleQueryError(error, 'Loading customers'),
      refetchOnWindowFocus: false,
    }
  );
};

// Get single customer
export const useCustomer = (id) => {
  return useQuery(
    [QUERY_KEYS.customer, id],
    () => customerAPI.getCustomer(id),
    {
      enabled: !!id,
      ...getRetryConfig(),
      onError: (error) => handleQueryError(error, 'Loading customer'),
      refetchOnWindowFocus: false,
    }
  );
};

// Get dashboard statistics
export const useDashboardStats = () => {
  return useQuery(
    [QUERY_KEYS.dashboardStats],
    () => customerAPI.getDashboardStats(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      ...getRetryConfig(),
      onError: (error) => handleQueryError(error, 'Loading dashboard statistics'),
      refetchOnWindowFocus: false,
    }
  );
};

// Enhanced mutation error handler
const handleMutationError = (error, context = '') => {
  console.error(`Customer ${context} error:`, error);
  
  let message = 'An unexpected error occurred';
  
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    message = 'Network error. Please check your connection and try again.';
  } else {
    message = error.response?.data?.message || error.message || message;
  }
  
  toast.error(`${context}: ${message}`);
};

// Create customer mutation
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (customerData) => customerAPI.createCustomer(customerData),
    {
      onSuccess: (data) => {
        // Invalidate and refetch customers list
        queryClient.invalidateQueries([QUERY_KEYS.customers]);
        queryClient.invalidateQueries([QUERY_KEYS.dashboardStats]);
        toast.success('Customer created successfully!');
      },
      onError: (error) => handleMutationError(error, 'Creating customer'),
    }
  );
};

// Update customer mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) => customerAPI.updateCustomer(id, data),
    {
      onSuccess: (data, variables) => {
        // Update the specific customer in cache
        queryClient.setQueryData([QUERY_KEYS.customer, variables.id], data);
        // Invalidate customers list
        queryClient.invalidateQueries([QUERY_KEYS.customers]);
        queryClient.invalidateQueries([QUERY_KEYS.dashboardStats]);
        toast.success('Customer updated successfully!');
      },
      onError: (error) => handleMutationError(error, 'Updating customer'),
    }
  );
};

// Delete customer mutation
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => customerAPI.deleteCustomer(id),
    {
      onSuccess: () => {
        // Invalidate queries
        queryClient.invalidateQueries([QUERY_KEYS.customers]);
        queryClient.invalidateQueries([QUERY_KEYS.dashboardStats]);
        toast.success('Customer deleted successfully!');
      },
      onError: (error) => handleMutationError(error, 'Deleting customer'),
    }
  );
};

// Bulk delete customers mutation
export const useBulkDeleteCustomers = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (ids) => customerAPI.bulkDeleteCustomers(ids),
    {
      onSuccess: (data) => {
        // Invalidate queries
        queryClient.invalidateQueries([QUERY_KEYS.customers]);
        queryClient.invalidateQueries([QUERY_KEYS.dashboardStats]);
        toast.success(`${data.deletedCount} customers deleted successfully!`);
      },
      onError: (error) => handleMutationError(error, 'Bulk deleting customers'),
    }
  );
};