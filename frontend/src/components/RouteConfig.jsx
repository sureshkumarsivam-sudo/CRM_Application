import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingFallback } from './LazyWrapper';
import ProtectedRoute from './auth/ProtectedRoute';

// Authentication components
const LoginPage = lazy(() => 
  import('./auth/LoginPage').catch(() => ({
    default: () => <div>Login page failed to load. Please refresh the page.</div>
  }))
);

const SignupPage = lazy(() => 
  import('./auth/SignupPage').catch(() => ({
    default: () => <div>Signup page failed to load. Please refresh the page.</div>
  }))
);

const RolePrivilegeManagement = lazy(() => 
  import('./admin/RolePrivilegeManagement').catch(() => ({
    default: () => <div>Privileges management failed to load. Please refresh the page.</div>
  }))
);

// Lazy load components with error handling
const Dashboard = lazy(() => 
  import('./Dashboard').catch(() => ({
    default: () => <div>Dashboard component failed to load. Please check the implementation.</div>
  }))
);

const CustomersPageSimple = lazy(() => 
  import('./customers/CustomersPageSimple').catch(() => ({
    default: () => <div>Customer page failed to load. Please check the implementation.</div>
  }))
);

const CustomerDetail = lazy(() => 
  import('./customers/CustomerDetail').catch(() => ({
    default: () => <div>Customer detail failed to load. Please check the implementation.</div>
  }))
);

const CustomerForm = lazy(() => 
  import('./customers/CustomerForm').catch(() => ({
    default: () => <div>Customer form failed to load. Please check the implementation.</div>
  }))
);

// Employee components with fallbacks
const EmployeeManagement = lazy(() => 
  import('./employees/EmployeeManagementNew').catch(() => ({
    default: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Employee Management</h2>
        <p>This feature is currently under development. Please try again later.</p>
      </div>
    )
  }))
);

const EmployeeDetail = lazy(() => 
  import('./employees/EmployeeDetail').catch(() => ({
    default: () => <div>Employee detail failed to load. This feature is under development.</div>
  }))
);

const EmployeeForm = lazy(() => 
  import('./employees/EmployeeFormNew').catch(() => ({
    default: () => <div>Employee form failed to load. This feature is under development.</div>
  }))
);

// Account Management components with fallbacks
const AccountManagement = lazy(() => 
  import('./accounts/AccountManagement').catch(() => ({
    default: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Account Management</h2>
        <p>This feature is currently under development. Please try again later.</p>
      </div>
    )
  }))
);

const AccountDetails = lazy(() => 
  import('./accounts/AccountDetails').catch(() => ({
    default: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Account Details</h2>
        <p>This feature is currently under development. Please try again later.</p>
      </div>
    )
  }))
);

// Master Data components with fallbacks
const MasterData = lazy(() => 
  import('./masterdata/MasterData').catch(() => ({
    default: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Master Data Management</h2>
        <p>This feature is currently under development. Please try again later.</p>
      </div>
    )
  }))
);

// New components
const EnhancedDashboard = lazy(() => 
  import('./EnhancedDashboard').catch(() => ({
    default: () => <div>Dashboard failed to load. Please try again later.</div>
  }))
);

const AllocationManagement = lazy(() => 
  import('./allocations/AllocationManagement').catch(() => ({
    default: () => <div>Allocation Management failed to load. Please try again later.</div>
  }))
);

const SettlementManagement = lazy(() => 
  import('./settlements/SettlementManagement').catch(() => ({
    default: () => <div>Settlement Management failed to load. Please try again later.</div>
  }))
);

const NewProposal = lazy(() => 
  import('./settlements/NewProposal').catch(() => ({
    default: () => <div>New Proposal form failed to load. Please try again later.</div>
  }))
);

const DocumentGeneration = lazy(() => 
  import('./documents/DocumentGeneration').catch(() => ({
    default: () => <div>Document Generation failed to load. Please try again later.</div>
  }))
);

const ReportsAnalytics = lazy(() => 
  import('./reports/ReportsAnalytics').catch(() => ({
    default: () => <div>Reports & Analytics failed to load. Please try again later.</div>
  }))
);

const Settings = lazy(() => 
  import('./settings/Settings').catch(() => ({
    default: () => <div>Settings failed to load. Please try again later.</div>
  }))
);

const AdminSettings = lazy(() => 
  import('./settings/AdminSettings').catch(() => ({
    default: () => <div>Admin Settings failed to load. Please try again later.</div>
  }))
);

const UnderDevelopmentPage = lazy(() => 
  import('./UnderDevelopmentPage').catch(() => ({
    default: () => <div>Page failed to load. Please try again later.</div>
  }))
);

const PTPPaymentTracker = lazy(() => 
  import('./collections/PTPPaymentTracker').catch(() => ({
    default: () => <div>PTP Payment Tracker failed to load. Please try again later.</div>
  }))
);

// Theme Showcase component
const ThemeShowcase = lazy(() => 
  import('./ThemeShowcase').catch(() => ({
    default: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Theme Showcase</h2>
        <p>Theme showcase failed to load. Please try again later.</p>
      </div>
    )
  }))
);

const FieldExecutivePerformance = lazy(() => 
  import('./fieldexecutive/FieldExecutivePerformance').catch(() => ({
    default: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Field Executive Performance</h2>
        <p>Field Executive module failed to load. Please try again later.</p>
      </div>
    )
  }))
);

// Master Menu components
const StatusCode = lazy(() => 
  import('./master/StatusCode').catch(() => ({
    default: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Status Code Management</h2>
        <p>Status Code module failed to load. Please try again later.</p>
      </div>
    )
  }))
);

const ProcessManagement = lazy(() => 
  import('./master/ProcessManagement').catch(() => ({
    default: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Process Management</h2>
        <p>This feature is currently under development. Please try again later.</p>
      </div>
    )
  }))
);

// Route configuration with error handling
export const routes = [
  // Authentication Routes
  {
    path: "/login",
    element: <LoginPage />,
    fallback: <LoadingFallback message="Loading Login..." />,
    errorElement: <div>Login page is temporarily unavailable.</div>
  },
  {
    path: "/signup",
    element: <SignupPage />,
    fallback: <LoadingFallback message="Loading Signup..." />,
    errorElement: <div>Signup page is temporarily unavailable.</div>
  },
  {
    path: "/admin/privileges",
    element: <ProtectedRoute><RolePrivilegeManagement /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Privileges Management..." />,
    errorElement: <div>Privileges management is temporarily unavailable.</div>
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
    errorElement: <Navigate to="/login" replace />
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><EnhancedDashboard /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Dashboard..." />,
    errorElement: <div>Dashboard is temporarily unavailable. Please refresh the page.</div>
  },
  {
    path: "/accounts",
    element: <ProtectedRoute><AccountManagement /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Account Management..." />,
    errorElement: <div>Account management is temporarily unavailable.</div>
  },
  {
    path: "/accounts/:id",
    element: <ProtectedRoute><AccountDetails /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Account Details..." />,
    errorElement: <div>Account details are temporarily unavailable.</div>
  },
  {
    path: "/allocations",
    element: <ProtectedRoute><AllocationManagement /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Allocations..." />,
    errorElement: <div>Allocation management is temporarily unavailable.</div>
  },
  {
    path: "/collections",
    element: <ProtectedRoute><PTPPaymentTracker /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading PTP Payment Tracker..." />,
    errorElement: <div>PTP Payment Tracker is temporarily unavailable.</div>
  },
  {
    path: "/settlements",
    element: <ProtectedRoute><SettlementManagement /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Settlements..." />,
    errorElement: <div>Settlement management is temporarily unavailable.</div>
  },
  {
    path: "/settlements/edit/:id",
    element: <ProtectedRoute><NewProposal /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Proposal Editor..." />,
    errorElement: <div>Proposal editor is temporarily unavailable.</div>
  },
  {
    path: "/field-executive",
    element: <ProtectedRoute><FieldExecutivePerformance /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Field Executive Performance..." />,
    errorElement: <div>Field Executive Performance is temporarily unavailable.</div>
  },
  {
    path: "/documents",
    element: <ProtectedRoute><DocumentGeneration /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Documents..." />,
    errorElement: <div>Document generation is temporarily unavailable.</div>
  },
  {
    path: "/reports",
    element: <ProtectedRoute><ReportsAnalytics /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Reports..." />,
    errorElement: <div>Reports & Analytics is temporarily unavailable.</div>
  },
  {
    path: "/audit",
    element: <ProtectedRoute><UnderDevelopmentPage /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Audit..." />,
    errorElement: <div>Audit is temporarily unavailable.</div>
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Settings..." />,
    errorElement: <div>Settings is temporarily unavailable.</div>
  },
  {
    path: "/customers",
    element: <ProtectedRoute><CustomersPageSimple /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Customers..." />,
    errorElement: <div>Customer management is temporarily unavailable.</div>
  },
  {
    path: "/customers/new",
    element: <ProtectedRoute><CustomerForm /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Customer Form..." />
  },
  {
    path: "/customers/:id",
    element: <ProtectedRoute><CustomerDetail /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Customer Details..." />
  },
  {
    path: "/customers/:id/edit",
    element: <ProtectedRoute><CustomerForm /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Customer Form..." />
  },
  {
    path: "/employees",
    element: <ProtectedRoute><EmployeeManagement /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Employee Management..." />
  },
  {
    path: "/employees/new",
    element: <ProtectedRoute><EmployeeForm /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Employee Form..." />
  },
  {
    path: "/employees/edit/:id",
    element: <ProtectedRoute><EmployeeForm /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Employee Form..." />
  },
  {
    path: "/employees/view/:id",
    element: <ProtectedRoute><EmployeeDetail /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Employee Details..." />
  },
  {
    path: "/employees/:id",
    element: <ProtectedRoute><EmployeeDetail /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Employee Details..." />
  },
  {
    path: "/master-data",
    element: <ProtectedRoute><MasterData /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Master Data..." />
  },
  {
    path: "/theme-showcase",
    element: <ProtectedRoute><ThemeShowcase /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Theme Showcase..." />
  },
  {
    path: "/master/status-code",
    element: <ProtectedRoute><StatusCode /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Status Code..." />,
    errorElement: <div>Status Code management is temporarily unavailable.</div>
  },
  {
    path: "/master/process",
    element: <ProtectedRoute><ProcessManagement /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Process Management..." />,
    errorElement: <div>Process Management is temporarily unavailable.</div>
  },
  {
    path: "/settings/admin",
    element: <ProtectedRoute><AdminSettings /></ProtectedRoute>,
    fallback: <LoadingFallback message="Loading Admin Settings..." />,
    errorElement: <div>Admin Settings is temporarily unavailable.</div>
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />
  }
];

export {
  // Authentication
  LoginPage,
  SignupPage,
  RolePrivilegeManagement,
  // Main Components
  AccountManagement,
  AccountDetails,
  EnhancedDashboard,
  AllocationManagement,
  PTPPaymentTracker,
  SettlementManagement,
  DocumentGeneration,
  ReportsAnalytics,
  Settings,
  AdminSettings,
  UnderDevelopmentPage,
  Dashboard,
  CustomersPageSimple,
  CustomerDetail,
  CustomerForm,
  EmployeeManagement,
  EmployeeDetail,
  EmployeeForm,
  MasterData,
  ThemeShowcase,
  FieldExecutivePerformance,
  StatusCode,
  ProcessManagement
};