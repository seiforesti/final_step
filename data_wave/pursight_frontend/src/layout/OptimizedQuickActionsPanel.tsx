import React, { memo, useCallback, useMemo, useState, useRef } from 'react';
import { Box, IconButton, Tooltip, Fade, ClickAwayListener, Popper } from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  AccountCircle as AccountIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components for better performance
const QuickActionsContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 8px',
  backgroundColor: 'rgba(24, 28, 36, 0.95)',
  backdropFilter: 'blur(8px)',
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(35, 39, 51, 0.8)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 1000,
}));

const ActionButton = styled(IconButton)(() => ({
  width: 36,
  height: 36,
  padding: 6,
  color: 'rgba(224, 224, 224, 0.8)',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 6,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(35, 39, 51, 0.8)',
    color: 'rgba(92, 124, 250, 0.9)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
}));

const NotificationBadge = styled('span')(() => ({
  position: 'absolute',
  top: 2,
  right: 2,
  width: 8,
  height: 8,
  backgroundColor: '#ef4444',
  borderRadius: '50%',
  border: '1.5px solid rgba(24, 28, 36, 0.95)',
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
}));

const SearchPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(24, 28, 36, 0.98)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(35, 39, 51, 0.8)',
  borderRadius: theme.spacing(1),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  minWidth: 320,
  maxWidth: 400,
  zIndex: 1100,
}));

// Quick action item interface
interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  badge?: boolean;
  tooltip?: string;
}

// Memoized action item component
const QuickActionItem = memo<{ 
  item: QuickActionItem; 
  onClose?: () => void;
}>(({ item, onClose }) => {
  const handleClick = useCallback(() => {
    if (item.onClick && !item.disabled) {
      item.onClick();
      onClose?.();
    }
  }, [item, onClose]);

  return (
    <Tooltip 
      title={item.tooltip || item.label} 
      placement="bottom"
      enterDelay={500}
      leaveDelay={0}
    >
      <span>
        <ActionButton
          onClick={handleClick}
          disabled={item.disabled}
          size="small"
          aria-label={item.label}
        >
          <Box position="relative">
            {item.icon}
            {item.badge && <NotificationBadge />}
          </Box>
        </ActionButton>
      </span>
    </Tooltip>
  );
});

// Search component
const QuickSearch = memo<{ 
  open: boolean; 
  anchorEl: HTMLElement | null; 
  onClose: () => void;
}>(({ open, anchorEl, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleSearchSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      // Implement search logic here
      console.log('Search for:', searchQuery);
      onClose();
      setSearchQuery('');
    }
  }, [searchQuery, onClose]);

  // Focus input when opened
  React.useEffect(() => {
    if (open && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      transition
      disablePortal
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <SearchPanel>
            <ClickAwayListener onClickAway={onClose}>
              <Box>
                <form onSubmit={handleSearchSubmit}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'rgba(35, 39, 51, 0.6)',
                      borderRadius: 1,
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '8px 12px',
                      '&:focus-within': {
                        borderColor: 'rgba(59, 130, 246, 0.6)',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    <SearchIcon 
                      sx={{ 
                        color: 'rgba(160, 160, 160, 0.7)', 
                        marginRight: 1,
                        fontSize: 20 
                      }} 
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search everything..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: 'rgba(224, 224, 224, 0.9)',
                        fontSize: '14px',
                        width: '100%',
                        fontFamily: 'inherit',
                      }}
                    />
                    {searchQuery && (
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        sx={{ 
                          color: 'rgba(160, 160, 160, 0.7)',
                          padding: 0.5,
                        }}
                      >
                        ×
                      </IconButton>
                    )}
                  </Box>
                </form>
                
                {/* Recent searches or suggestions */}
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      fontSize: '12px',
                      color: 'rgba(160, 160, 160, 0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: 1,
                    }}
                  >
                    Quick Actions
                  </Box>
                  {[
                    'Search Data Sources',
                    'View Recent Scans',
                    'Check Compliance Status',
                    'Open Catalog',
                  ].map((action, index) => (
                    <Box
                      key={index}
                      sx={{
                        padding: '6px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: 'rgba(224, 224, 224, 0.7)',
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(35, 39, 51, 0.8)',
                          color: 'rgba(92, 124, 250, 0.9)',
                        },
                      }}
                      onClick={() => {
                        console.log('Quick action:', action);
                        onClose();
                      }}
                    >
                      {action}
                    </Box>
                  ))}
                </Box>
              </Box>
            </ClickAwayListener>
          </SearchPanel>
        </Fade>
      )}
    </Popper>
  );
});

// Main optimized quick actions panel
const OptimizedQuickActionsPanel: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState<HTMLElement | null>(null);
  
  // Memoized quick actions to prevent recreation
  const quickActions = useMemo<QuickActionItem[]>(() => [
    {
      id: 'add',
      label: 'Create New',
      icon: <AddIcon fontSize="small" />,
      tooltip: 'Create new data source, scan, or rule set',
      onClick: () => {
        console.log('Create new item');
        // Implement create new logic
      },
    },
    {
      id: 'search',
      label: 'Search',
      icon: <SearchIcon fontSize="small" />,
      tooltip: 'Search across all data and resources',
      onClick: (event) => {
        const target = event?.currentTarget as HTMLElement;
        setSearchAnchorEl(target);
        setSearchOpen(true);
      },
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <NotificationsIcon fontSize="small" />,
      badge: true, // Show notification badge
      tooltip: 'View system notifications and alerts',
      onClick: () => {
        console.log('Open notifications');
        // Implement notifications logic
      },
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RefreshIcon fontSize="small" />,
      tooltip: 'Refresh current data and dashboards',
      onClick: () => {
        console.log('Refresh data');
        // Implement refresh logic
        window.location.reload();
      },
    },
    {
      id: 'filter',
      label: 'Filter',
      icon: <FilterIcon fontSize="small" />,
      tooltip: 'Apply filters to current view',
      onClick: () => {
        console.log('Open filters');
        // Implement filter logic
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon fontSize="small" />,
      tooltip: 'Open application settings',
      onClick: () => {
        console.log('Open settings');
        // Implement settings logic
      },
    },
    {
      id: 'help',
      label: 'Help',
      icon: <HelpIcon fontSize="small" />,
      tooltip: 'Get help and documentation',
      onClick: () => {
        console.log('Open help');
        // Implement help logic
      },
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <AccountIcon fontSize="small" />,
      tooltip: 'View user profile and account settings',
      onClick: () => {
        console.log('Open profile');
        // Implement profile logic
      },
    },
  ], []);

  const handleCloseSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchAnchorEl(null);
  }, []);

  // Render quick action items
  const renderQuickActions = useMemo(() => {
    return quickActions.map((action) => (
      <QuickActionItem
        key={action.id}
        item={{
          ...action,
          onClick: action.id === 'search' 
            ? (event) => {
                const target = event?.currentTarget as HTMLElement;
                setSearchAnchorEl(target);
                setSearchOpen(true);
              }
            : action.onClick
        }}
        onClose={action.id === 'search' ? handleCloseSearch : undefined}
      />
    ));
  }, [quickActions, handleCloseSearch]);

  return (
    <>
      <QuickActionsContainer>
        {renderQuickActions}
      </QuickActionsContainer>
      
      {/* Search panel */}
      <QuickSearch
        open={searchOpen}
        anchorEl={searchAnchorEl}
        onClose={handleCloseSearch}
      />
    </>
  );
};

export default memo(OptimizedQuickActionsPanel);