import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

import ErrorBoundary from './components/ErrorBoundary';
import LazyWrapper, { LoadingFallback } from './components/LazyWrapper';
import Layout from './components/Layout';
import { routes } from './components/RouteConfig';

function App() {
  const location = useLocation();
  
  // Routes that should not have the Layout (no sidebar/header)
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.includes(location.pathname);

  return (
    <ErrorBoundary>
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          m: 0,
          p: 0,
          overflow: 'hidden',
          background: isAuthRoute 
            ? 'linear-gradient(135deg, #E8F1FD 0%, #F5F9FF 100%)'
            : 'linear-gradient(135deg, #F8FAFB 0%, #F5F7FA 25%, #F3F6F9 50%, #F5F7FA 75%, #FAFBFC 100%)',
          backgroundAttachment: 'fixed',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isAuthRoute
              ? 'none'
              : 'radial-gradient(circle at 20% 20%, rgba(91, 155, 213, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(112, 193, 179, 0.03) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: 0,
          },
        }}
        className="gradient-bg"
      >
        {isAuthRoute ? (
          // Authentication routes without Layout
          <Suspense fallback={<LoadingFallback message="Loading..." />}>
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <ErrorBoundary>
                      <LazyWrapper fallback={route.fallback}>
                        {route.element}
                      </LazyWrapper>
                    </ErrorBoundary>
                  }
                />
              ))}
            </Routes>
          </Suspense>
        ) : (
          // Main app routes with Layout
          <Layout>
            <Suspense fallback={<LoadingFallback message="Loading application..." />}>
              <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <ErrorBoundary>
                        <LazyWrapper fallback={route.fallback}>
                          {route.element}
                        </LazyWrapper>
                      </ErrorBoundary>
                    }
                  />
                ))}
              </Routes>
            </Suspense>
          </Layout>
        )}
      </Box>
    </ErrorBoundary>
  );
}

export default App;