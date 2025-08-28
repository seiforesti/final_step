import React, { memo, Suspense, lazy, useCallback, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert, Typography, Fade } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { styled } from '@mui/material/styles';

// Lazy load components for better performance
const DataGovernanceMainPage = lazy(() => import('./NXCI_DataGovernance/DataGovernanceMainPage'));
const DataSourceManagement = lazy(() => import('./NXCI_DataGovernance/DataSourceManagement'));
const ScanRuleSetManagement = lazy(() => import('./NXCI_DataGovernance/ScanRuleSetManagement'));
const ScanManagement = lazy(() => import('./NXCI_DataGovernance/ScanManagement'));
const ComplianceManagement = lazy(() => import('./NXCI_DataGovernance/ComplianceManagement'));
const SensitivityManagement = lazy(() => import('./NXCI_DataGovernance/SensitivityManagement'));
const DataCatalogManagement = lazy(() => import('./NXCI_DataGovernance/DataCatalogManagement'));
const CatalogManagement = lazy(() => import('./NXCI_DataGovernance/CatalogManagement'));

// Styled components for better performance
const MainContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
  backgroundColor: '#0e1117',
  color: '#e0e0e0',
  overflow: 'hidden',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: theme.spacing(2),
  position: 'relative',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: theme.spacing(2),
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(3),
  textAlign: 'center',
}));

// Enhanced loading component
const LoadingFallback = memo<{ message?: string }>(({ message = 'Loading...' }) => (
  <LoadingContainer>
    <CircularProgress 
      size={40} 
      thickness={4}
      sx={{ 
        color: '#007acc',
        '& .MuiCircularProgress-circle': {
          strokeLinecap: 'round',
        },
      }} 
    />
    <Typography 
      variant="body2" 
      sx={{ 
        color: 'rgba(224, 224, 224, 0.7)',
        fontSize: '14px',
        fontWeight: 400,
      }}
    >
      {message}
    </Typography>
  </LoadingContainer>
));

// Enhanced error boundary fallback
const ErrorFallback = memo<{ 
  error: Error; 
  resetErrorBoundary: () => void; 
}>(({ error, resetErrorBoundary }) => (
  <ErrorContainer>
    <Alert 
      severity="error" 
      sx={{ 
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#e0e0e0',
        '& .MuiAlert-icon': {
          color: '#ef4444',
        },
        marginBottom: 2,
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: 1 }}>
        Something went wrong
      </Typography>
      <Typography variant="body2" sx={{ marginBottom: 2, opacity: 0.8 }}>
        {error.message || 'An unexpected error occurred'}
      </Typography>
      <button
        onClick={resetErrorBoundary}
        style={{
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        Try Again
      </button>
    </Alert>
  </ErrorContainer>
));

// Route configuration for better maintainability
const ROUTE_CONFIG = [
  {
    path: '/data-governance',
    component: DataGovernanceMainPage,
    title: 'Data Governance Dashboard',
    preload: true, // Preload this component
  },
  {
    path: '/data-governance/data-sources',
    component: DataSourceManagement,
    title: 'Data Sources',
  },
  {
    path: '/data-governance/scan-rule-sets',
    component: ScanRuleSetManagement,
    title: 'Scan Rule Sets',
  },
  {
    path: '/data-governance/scan',
    component: ScanManagement,
    title: 'Scans',
  },
  {
    path: '/data-governance/compliance',
    component: ComplianceManagement,
    title: 'Compliance',
  },
  {
    path: '/data-governance/sensitivity',
    component: SensitivityManagement,
    title: 'Sensitivity Management',
  },
  {
    path: '/data-governance/data-catalog',
    component: DataCatalogManagement,
    title: 'Data Catalog',
  },
  {
    path: '/data-governance/catalog-management',
    component: CatalogManagement,
    title: 'Catalog Management',
  },
] as const;

// Component wrapper with error boundary and loading
const RouteWrapper = memo<{ 
  Component: React.ComponentType; 
  title: string;
}>(({ Component, title }) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={(error, errorInfo) => {
      console.error('Route component error:', error, errorInfo);
      // Here you could send to error reporting service
    }}
  >
    <Suspense fallback={<LoadingFallback message={`Loading ${title}...`} />}>
      <Fade in timeout={300}>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          <Component />
        </Box>
      </Fade>
    </Suspense>
  </ErrorBoundary>
));

// Hook for preloading components
const useComponentPreloader = () => {
  useEffect(() => {
    // Preload critical components after a short delay
    const preloadTimer = setTimeout(() => {
      const preloadRoutes = ROUTE_CONFIG.filter(route => route.preload);
      preloadRoutes.forEach(route => {
        // This will trigger the lazy loading without mounting
        route.component();
      });
    }, 2000);

    return () => clearTimeout(preloadTimer);
  }, []);
};

// Hook for route analytics (optional)
const useRouteAnalytics = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track route changes for analytics
    const currentRoute = ROUTE_CONFIG.find(route => 
      location.pathname === route.path || location.pathname.startsWith(route.path + '/')
    );
    
    if (currentRoute) {
      console.log('Route accessed:', currentRoute.title, currentRoute.path);
      // Here you could send analytics data
    }
  }, [location.pathname]);
};

// Main optimized manager component
const OptimizedMainManager: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Custom hooks
  useComponentPreloader();
  useRouteAnalytics();
  
  // Memoized route elements
  const routeElements = useMemo(() => {
    return ROUTE_CONFIG.map(({ path, component: Component, title }) => (
      <Route
        key={path}
        path={path}
        element={<RouteWrapper Component={Component} title={title} />}
      />
    ));
  }, []);

  // Default redirect handler
  const handleDefaultRedirect = useCallback(() => {
    if (location.pathname === '/data-governance' || location.pathname === '/data-governance/') {
      return;
    }
    navigate('/data-governance', { replace: true });
  }, [location.pathname, navigate]);

  // Effect to handle default routing
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/app') {
      handleDefaultRedirect();
    }
  }, [location.pathname, handleDefaultRedirect]);

  return (
    <MainContainer>
      <ContentArea>
        <Routes>
          {routeElements}
          {/* Default route */}
          <Route
            path="/"
            element={
              <RouteWrapper 
                Component={DataGovernanceMainPage} 
                title="Data Governance Dashboard" 
              />
            }
          />
          {/* Catch-all route */}
          <Route
            path="*"
            element={
              <ErrorContainer>
                <Alert 
                  severity="info"
                  sx={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#e0e0e0',
                    '& .MuiAlert-icon': {
                      color: '#3b82f6',
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    Page Not Found
                  </Typography>
                  <Typography variant="body2" sx={{ marginBottom: 2, opacity: 0.8 }}>
                    The page you're looking for doesn't exist or has been moved.
                  </Typography>
                  <button
                    onClick={() => navigate('/data-governance')}
                    style={{
                      backgroundColor: '#007acc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    Go to Dashboard
                  </button>
                </Alert>
              </ErrorContainer>
            }
          />
        </Routes>
      </ContentArea>
    </MainContainer>
  );
};

export default memo(OptimizedMainManager);