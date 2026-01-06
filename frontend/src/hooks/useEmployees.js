import { useQuery, useMutation, useQueryClient } from 'react-query';
import { employeeAPI } from '../services/api';
import toast from 'react-hot-toast';

// Query keys
export const EMPLOYEE_QUERY_KEYS = {
  employees: 'employees',
  employee: 'employee',
  employeeDashboardStats: 'employeeDashboardStats',
  employeeFilterOptions: 'employeeFilterOptions',
};

// Enhanced error handler
const handleQueryError = (error, context = '') => {
  console.error(`Employee ${context} error:`, error);
  
  // Don't show toast for network errors during initial load
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    console.warn('Network error detected, showing connection status instead of toast');
    return;
  }
  
  const message = error.response?.data?.message || error.message || 'An error occurred';
  toast.error(`${context}: ${message}`);
};

// Enhanced mutation error handler
const handleMutationError = (error, context = '') => {
  console.error(`Employee ${context} error:`, error);
  
  let message = 'An unexpected error occurred';
  
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    message = 'Network error. Please check your connection and try again.';
  } else {
    message = error.response?.data?.message || error.message || message;
  }
  
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

// Get employees with pagination and filters
export const useEmployees = (params = {}) => {
  return useQuery(
    [EMPLOYEE_QUERY_KEYS.employees, params],
    () => employeeAPI.getEmployees(params),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      ...getRetryConfig(),
      onError: (error) => handleQueryError(error, 'Loading employees'),
      refetchOnWindowFocus: false,
    }
  );
};

// Get single employee
export const useEmployee = (id) => {
  return useQuery(
    [EMPLOYEE_QUERY_KEYS.employee, id],
    () => employeeAPI.getEmployee(id),
    {
      enabled: !!id,
      ...getRetryConfig(),
      onError: (error) => handleQueryError(error, 'Loading employee'),
      refetchOnWindowFocus: false,
    }
  );
};

// Get employee dashboard statistics
export const useEmployeeDashboardStats = () => {
  return useQuery(
    [EMPLOYEE_QUERY_KEYS.employeeDashboardStats],
    () => employeeAPI.getEmployeeDashboardStats(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      ...getRetryConfig(),
      onError: (error) => handleQueryError(error, 'Loading employee dashboard statistics'),
      refetchOnWindowFocus: false,
    }
  );
};

// Get employee dashboard (alias for backward compatibility)
export const useEmployeeDashboard = () => {
  return useEmployeeDashboardStats();
};

// Get filter options
export const useEmployeeFilterOptions = () => {
  return useQuery(
    [EMPLOYEE_QUERY_KEYS.employeeFilterOptions],
    () => employeeAPI.getFilterOptions(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      ...getRetryConfig(),
      onError: (error) => handleQueryError(error, 'Loading filter options'),
      refetchOnWindowFocus: false,
    }
  );
};

// Create employee mutation
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (employeeData) => employeeAPI.createEmployee(employeeData),
    {
      onSuccess: (data) => {
        // Invalidate and refetch employees list
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employees]);
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employeeDashboardStats]);
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employeeFilterOptions]);
        toast.success('Employee created successfully!');
      },
      onError: (error) => handleMutationError(error, 'Creating employee'),
    }
  );
};

// Update employee mutation
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) => employeeAPI.updateEmployee(id, data),
    {
      onSuccess: (data, variables) => {
        // Update the specific employee in cache
        queryClient.setQueryData(
          [EMPLOYEE_QUERY_KEYS.employee, variables.id],
          data
        );
        
        // Invalidate employees list to refetch updated data
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employees]);
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employeeDashboardStats]);
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employeeFilterOptions]);
        
        toast.success('Employee updated successfully!');
      },
      onError: (error) => handleMutationError(error, 'Updating employee'),
    }
  );
};

// Delete employee mutation
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => employeeAPI.deleteEmployee(id),
    {
      onSuccess: () => {
        // Invalidate and refetch employees list
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employees]);
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employeeDashboardStats]);
        toast.success('Employee deleted successfully!');
      },
      onError: (error) => handleMutationError(error, 'Deleting employee'),
    }
  );
};

// Bulk delete employees mutation
export const useBulkDeleteEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (ids) => employeeAPI.bulkDeleteEmployees(ids),
    {
      onSuccess: (data) => {
        // Invalidate and refetch employees list
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employees]);
        queryClient.invalidateQueries([EMPLOYEE_QUERY_KEYS.employeeDashboardStats]);
        
        const message = data.message || 'Employees deleted successfully!';
        toast.success(message);
      },
      onError: (error) => handleMutationError(error, 'Bulk deleting employees'),
    }
  );
};