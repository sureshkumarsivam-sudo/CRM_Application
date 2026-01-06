import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/modernTheme.css';
import './styles/glassmorphism.css';

// Global error handler
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the default behavior (logging to console)
  event.preventDefault();
});

window.addEventListener('error', event => {
  console.error('Global error:', event.error);
});

// Create a query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      keepPreviousData: true,
      refetchOnMount: 'always',
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});

// Create Material-UI theme with Modern Soft Blue/Teal Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#5B9BD5', // Muted Blue
      light: '#8BB7E0', // Light Blue
      dark: '#2B6DAA', // Dark Blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#70C1B3', // Soft Teal
      light: '#A0D8D0', // Light Teal
      dark: '#4A9B8E', // Dark Teal
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#E8AB94', // Accent Warm
      light: '#F0C5B5', // Light Warm
      dark: '#D89680', // Dark Warm
    },
    background: {
      default: 'linear-gradient(135deg, #F8FAFB 0%, #F5F7FA 25%, #F3F6F9 50%, #F5F7FA 75%, #FAFBFC 100%)',
      paper: 'rgba(255, 255, 255, 0.98)',
    },
    success: {
      main: '#81C784',
      light: '#A5D6A7',
      dark: '#66BB6A',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFCC80',
      dark: '#FFA726',
    },
    error: {
      main: '#E57373',
      light: '#EF9A9A',
      dark: '#EF5350',
    },
    info: {
      main: '#64B5F6',
      light: '#90CAF9',
      dark: '#42A5F5',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#546E7A',
      disabled: '#B0BEC5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      color: '#2C3E50',
    },
    h2: {
      fontWeight: 700,
      color: '#2C3E50',
    },
    h3: {
      fontWeight: 600,
      color: '#2C3E50',
    },
    h4: {
      fontWeight: 600,
      color: '#2C3E50',
    },
    h5: {
      fontWeight: 600,
      color: '#2C3E50',
    },
    h6: {
      fontWeight: 600,
      color: '#546E7A',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'fixed',
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #F8FAFB 0%, #F5F7FA 25%, #F3F6F9 50%, #F5F7FA 75%, #FAFBFC 100%)',
          backgroundAttachment: 'fixed',
          overflow: 'hidden',
          position: 'fixed',
        },
        '#root': {
          margin: 0,
          padding: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          boxShadow: 'none',
          transition: 'all 0.25s ease',
          padding: '8px 20px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(91, 155, 213, 0.25)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #5B9BD5 0%, #8BB7E0 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #2B6DAA 0%, #5B9BD5 100%)',
          },
        },
        outlined: {
          borderColor: '#D1DBE5',
          color: '#546E7A',
          background: '#ffffff',
          '&:hover': {
            borderColor: '#5B9BD5',
            background: 'rgba(91, 155, 213, 0.05)',
            color: '#5B9BD5',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: 14,
          border: '1px solid #E8EDF2',
          transition: 'all 0.25s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: 12,
          border: '1px solid #E8EDF2',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          color: '#2C3E50',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #E8EDF2',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#ffffff',
          border: 'none',
          boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '4px 8px',
          '&.Mui-selected': {
            background: 'rgba(91, 155, 213, 0.1)',
            borderLeft: '4px solid #5B9BD5',
            '&:hover': {
              background: 'rgba(91, 155, 213, 0.15)',
            },
          },
          '&:hover': {
            background: 'rgba(91, 155, 213, 0.05)',
            borderRadius: 10,
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          borderRadius: 8,
          background: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e0e0e0',
          },
          '& .MuiDataGrid-columnHeaders': {
            background: '#2C8C99',
            color: '#ffffff',
            borderBottom: '2px solid #1A6B75',
            fontWeight: 600,
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              background: '#E0F7FA',
            },
            '&.Mui-selected': {
              background: '#B3E5FC',
              '&:hover': {
                background: '#81D4FA',
              },
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: '#ffffff',
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#2C8C99',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2C8C99',
              boxShadow: '0 0 0 3px rgba(44, 140, 153, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666',
            '&.Mui-focused': {
              color: '#2C8C99',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: '#B3E5FC',
          color: '#000000',
          fontWeight: 500,
          borderRadius: 16,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  fontWeight: 500,
                },
                success: {
                  style: {
                    background: '#2C8C99',
                    color: '#ffffff',
                    border: '1px solid #1A6B75',
                  },
                },
                error: {
                  style: {
                    background: '#f44336',
                    color: '#ffffff',
                    border: '1px solid #d32f2f',
                  },
                },
                loading: {
                  style: {
                    background: '#B3E5FC',
                    color: '#000000',
                    border: '1px solid #81D4FA',
                  },
                },
              }}
            />
          </BrowserRouter>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);