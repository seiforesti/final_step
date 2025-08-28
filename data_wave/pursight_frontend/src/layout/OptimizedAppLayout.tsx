import React, { memo, useMemo, Suspense } from 'react';
import { Outlet } from 'react-router';
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import AppHeader from './AppHeader';
import Backdrop from './Backdrop';
import OptimizedNavigationSidebar from './OptimizedNavigationSidebar';
import OptimizedQuickActionsPanel from './OptimizedQuickActionsPanel';

const HEADER_HEIGHT = 56; // Must match AppHeader height

// Styled components for better performance
const LayoutContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  backgroundColor: '#181c24',
  position: 'relative',
  overflow: 'hidden',
});

const SidebarSection = styled(Box)({
  position: 'relative',
  zIndex: 40,
});

const ContentSection = styled(Box)<{
  sidebarExpanded: boolean;
  sidebarHovered: boolean;
  mobileSidebarOpen: boolean;
}>(({ sidebarExpanded, sidebarHovered, mobileSidebarOpen }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  marginLeft: '0',
  minHeight: '100vh',
  background: '#181c24',
  position: 'relative',
  
  '@media (min-width: 1024px)': {
    marginLeft: (sidebarExpanded || sidebarHovered) ? '240px' : '64px',
  },
  
  ...(mobileSidebarOpen && {
    '@media (max-width: 1023px)': {
      marginLeft: '0',
    },
  }),
}));

const HeaderSection = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: HEADER_HEIGHT,
  zIndex: 50,
  backgroundColor: '#181c24',
  borderBottom: '1px solid #232733',
});

const QuickActionsContainer = styled(Box)({
  position: 'fixed',
  top: 16,
  right: 24,
  zIndex: 1000,
});

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  marginTop: HEADER_HEIGHT,
  minHeight: 0,
  minWidth: 0,
  width: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
});

const OutletWrapper = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  minWidth: 0,
  overflow: 'auto',
  position: 'relative',
});

// Loading fallback for Suspense
const LoadingFallback = memo(() => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#181c24',
    }}
  >
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
  </Box>
));

// Layout content component
const OptimizedLayoutContent = memo(() => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Memoize layout calculations
  const layoutProps = useMemo(() => ({
    sidebarExpanded: isExpanded,
    sidebarHovered: isHovered,
    mobileSidebarOpen: isMobileOpen,
  }), [isExpanded, isHovered, isMobileOpen]);

  return (
    <LayoutContainer>
      {/* Sidebar Section */}
      <SidebarSection>
        <OptimizedNavigationSidebar />
        <Backdrop />
      </SidebarSection>

      {/* Content Section */}
      <ContentSection {...layoutProps}>
        {/* Fixed Header */}
        <HeaderSection>
          <AppHeader />
        </HeaderSection>

        {/* Quick Actions Panel */}
        <QuickActionsContainer>
          <OptimizedQuickActionsPanel />
        </QuickActionsContainer>

        {/* Main Content Area */}
        <MainContent>
          <OutletWrapper>
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </OutletWrapper>
        </MainContent>
      </ContentSection>
    </LayoutContainer>
  );
});

// Main optimized app layout component
const OptimizedAppLayout = memo(() => {
  return (
    <SidebarProvider>
      <OptimizedLayoutContent />
    </SidebarProvider>
  );
});

OptimizedAppLayout.displayName = 'OptimizedAppLayout';

export default OptimizedAppLayout;