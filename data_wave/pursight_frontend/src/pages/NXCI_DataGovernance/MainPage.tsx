import React, { useState, useEffect, useRef, memo } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';
import { 
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Rule as RuleIcon,
  Settings as SettingsIcon,
  Map as MapIcon,
  Insights as InsightsIcon,
  Policy as PolicyIcon,
  Collections as CollectionsIcon,
  Monitor as MonitoringIcon,
  Category as CategoryIcon,
  Class as ClassIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Factory as FactoryIcon
} from '@mui/icons-material';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiUser,
  FiTag,
  FiMessageCircle,
  FiBell,
  FiInfo
} from "react-icons/fi";


// Import custom icons
import {
  CatalogIcon,
  DatabaseIcon,
  ChevronRightIcon as CustomChevronRightIcon,
  ChevronDownIcon,
  ServerIcon,
  AlertIcon,
  HistoryIcon,
  CogIcon
} from '../../icons/icon';

// Import components
import DataSourceManagement from './DataSourceManagement';
import ScanRuleSetManagement from './ScanRuleSetManagement';
import DataGovernanceMainPage from './DataGovernanceMainPage';
import DataCatalogManagement from './DataCatalogManagement';
import CatalogManagement from './CatalogManagement';
import ComplianceManagement from './ComplianceManagement';
import SensitivityManagement from './SensitivityManagement';
import ScanManagement from './ScanManagement';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const expandIn = keyframes`
  from { max-height: 0; opacity: 0; }
  to { max-height: 500px; opacity: 1; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 122, 204, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(0, 122, 204, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 122, 204, 0); }
`;

// Styled components
const AnimatedContent = styled('div')(`
  animation: ${fadeIn} 0.3s ease-out;
`);

// --- Notification badge component ---
const NotificationBadge: React.FC<{ count?: number; active?: boolean }> = ({
  count,
  active,
}) =>
  count && count > 0 ? (
    <span
      style={{
        background: active ? theme.accent : "#e74c3c",
        color: "#fff",
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 700,
        padding: "1px 7px",
        marginLeft: 7,
        minWidth: 18,
        display: "inline-block",
        textAlign: "center",
        boxShadow: "0 1px 4px #0002",
        verticalAlign: "middle",
      }}
      aria-label={count + " new notifications"}
    >
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

// Theme configuration
const theme = {
  bg: "#0e1117",
  header: "#1a1d24",
  sidebar: "#16191f",
  sidebarBorder: "#232733",
  sidebarActive: "#007acc",
  sidebarHover: "#232733",
  accent: "#007acc",
  accentSoft: "#5c7cfa22",
  accentText: "#5c7cfa",
  border: "#232733",
  text: "#e0e0e0",
  textSecondary: "#a0a0a0",
  tableHeader: "#181c24",
  tableRowAlt: "#181c24",
  tableRow: "#16191f",
  tableBorder: "#232733",
  tagBg: "#232733",
  tagText: "#5c7cfa",
  shadow: "0 2px 8px #0002",
};


interface SidebarContainerProps {
  expanded: boolean;
  isSecond: boolean;
}

const SidebarContainer = styled('div')<SidebarContainerProps>(({ expanded, isSecond }) => (`
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${expanded ? '16rem' : '4rem'};
  border-right: 1px solid ${theme.sidebarBorder};
  padding: 0.75rem;
  overflow-y: auto;
  background-color: ${isSecond ? theme.sidebar : theme.bg};
  backdrop-filter: blur(8px);
  box-shadow: ${expanded ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none'};
  z-index: ${isSecond ? 10 : 20};
  height: 100%;
`));

const ResizeHandle = styled("div")(`
  position: absolute;
  top: 0;
  right: -5px;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
`);

const SidebarItem = memo<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  notifications?: number;
  hasChildren?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  level?: number;
}>(({ icon, label, active, onClick, notifications, hasChildren, expanded, onToggleExpand, level = 0 }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 12px",
        marginLeft: level * 16,
        borderRadius: 4,
        cursor: "pointer",
        backgroundColor: active ? theme.accentSoft : "transparent",
        color: active ? theme.accent : theme.textSecondary,
        transition: "background-color 0.15s, color 0.15s",
        fontSize: 14,
        fontWeight: active ? 500 : 400,
        position: "relative",
      }}
    >
      <span style={{ marginRight: 10, fontSize: 18, display: "flex" }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {notifications && <NotificationBadge count={notifications} active={active} />}
      {hasChildren && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
          }}
          style={{ fontSize: 18, marginLeft: 4 }}
        >
          <FiChevronDown
            style={{
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s",
            }}
          />
        </span>
      )}
    </div>
  );
});

// Types for sidebar items
interface SidebarItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
}

// Types for the second sidebar items
interface SecondSidebarItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  path?: string;
  section?: string;
}

// Main sidebar items
const mainSidebarItems: SidebarItem[] = [
  {
    id: 'data-catalog',
    name: 'Data Catalog',
    icon: <CollectionsIcon />,
    children: [
      {
        id: 'catalog-management',
        name: 'Catalog Management',
        icon: <CategoryIcon />,
        path: '/data-governance/catalog-management'
      },
      {
        id: 'data-catalog-management',
        name: 'Data Catalog Management',
        icon: <CollectionsIcon />,
        path: '/data-governance/data-catalog'
      }
    ]
  },
  {
    id: 'data-map',
    name: 'Data Map',
    icon: <MapIcon />,
    children: [
      {
        id: 'resources',
        name: 'Resources',
        icon: <StorageIcon />,
        path: '/data-governance/data-sources'
      },
      {
        id: 'collections',
        name: 'Collections',
        icon: <CollectionsIcon />,
        path: '/data-governance/collections'
      },
      {
        id: 'monitoring',
        name: 'Monitoring',
        icon: <MonitoringIcon />,
        path: '/data-governance/monitoring'
      },
      {
        id: 'scan-rule-sets',
        name: 'Scan rule sets',
        icon: <CogIcon />,
        path: '/data-governance/scan-rule-sets'
      }
    ]
  },
  {
    id: 'data-insights',
    name: 'Data Insights & Analytics',
    icon: <InsightsIcon />,
    path: '/data-governance/insights'
  },
  {
    id: 'data-policy',
    name: 'Data Policy & Management',
    icon: <PolicyIcon />,
    path: '/data-governance/policy'
  }
];

// Second sidebar items for Data Map
const dataMapSidebarItems: SecondSidebarItem[] = [
  {
    id: 'resources',
    name: 'Resources',
    icon: <StorageIcon />,
    path: '/data-governance/data-sources',
    section: 'resources'
  },
  {
    id: 'collections',
    name: 'Collections',
    icon: <CollectionsIcon />,
    path: '/data-governance/collections',
    section: 'resources'
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: <MonitoringIcon />,
    path: '/data-governance/monitoring',
    section: 'resources'
  },
  {
    id: 'scan-rule-sets',
    name: 'Scan Rule Sets',
    icon: <RuleIcon />,
    path: '/data-governance/scan-rule-sets',
    section: 'scan-rules'
  },
  {
    id: 'scan',
    name: 'Scan',
    icon: <RefreshIcon />,
    path: '/data-governance/scan',
    section: 'scan-rules'
  },
  {
    id: 'pattern-rules',
    name: 'Pattern Rules',
    icon: <CategoryIcon />,
    path: '/data-governance/pattern-rules',
    section: 'scan-rules'
  },
  {
    id: 'nxci-factory-runtimes',
    name: 'NXCI_Factory Runtimes',
    icon: <FactoryIcon />,
    path: '/data-governance/nxci-factory-runtimes',
    section: 'scan-rules'
  },
  {
    id: 'classifications',
    name: 'Classifications',
    icon: <ClassIcon />,
    path: '/data-governance/classifications',
    section: 'annotation'
  },
  {
    id: 'classification-rules',
    name: 'Classification Rules',
    icon: <RuleIcon />,
    path: '/data-governance/classification-rules',
    section: 'annotation'
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: <SecurityIcon />,
    path: '/data-governance/compliance',
    section: 'additional'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/data-governance/dashboard',
    section: 'additional'
  },
  {
    id: 'sensitivity',
    name: 'Sensitivity',
    icon: <SecurityIcon />,
    path: '/data-governance/sensitivity',
    section: 'additional'
  }
];

// Group second sidebar items by section
const groupedSecondSidebarItems = dataMapSidebarItems.reduce((acc, item) => {
  if (!acc[item.section || 'other']) {
    acc[item.section || 'other'] = [];
  }
  acc[item.section || 'other'].push(item);
  return acc;
}, {} as Record<string, SecondSidebarItem[]>);

// Section titles for the second sidebar
const sectionTitles: Record<string, string> = {
  'resources': 'Resources',
  'scan-rules': 'Scan Rules',
  'annotation': 'Annotation Management',
  'additional': 'Additional Governance Management'
};

const MainPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for active sidebar item
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('data-map');
  
  // State for expanded sidebar items
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'data-map': true,
    'data-catalog': false,
    'main': true,
    'second': true
  });
  
  // State for active second sidebar item
  const [activeSecondSidebarItem, setActiveSecondSidebarItem] = useState<string>('resources');
  
  // State for sidebar width
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  
  // Determine active items based on URL path
  useEffect(() => {
    const path = location.pathname;
    
    // Set active second sidebar item based on path
    if (path.includes('/data-sources')) {
      setActiveSecondSidebarItem('resources');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/collections')) {
      setActiveSecondSidebarItem('collections');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/monitoring')) {
      setActiveSecondSidebarItem('monitoring');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/scan-rule-sets')) {
      setActiveSecondSidebarItem('scan-rule-sets');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/scan') && !path.includes('/scan-rule-sets')) {
      setActiveSecondSidebarItem('scan');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/pattern-rules')) {
      setActiveSecondSidebarItem('pattern-rules');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/nxci-factory-runtimes')) {
      setActiveSecondSidebarItem('nxci-factory-runtimes');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/classifications')) {
      setActiveSecondSidebarItem('classifications');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/classification-rules')) {
      setActiveSecondSidebarItem('classification-rules');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/compliance')) {
      setActiveSecondSidebarItem('compliance');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/dashboard')) {
      setActiveSecondSidebarItem('dashboard');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/sensitivity')) {
      setActiveSecondSidebarItem('sensitivity');
      setActiveSidebarItem('data-map');
    } else if (path.includes('/catalog-management')) {
      setActiveSidebarItem('data-catalog');
      setExpandedItems(prev => ({ ...prev, 'data-catalog': true }));
    } else if (path.includes('/data-catalog')) {
      setActiveSidebarItem('data-catalog');
      setExpandedItems(prev => ({ ...prev, 'data-catalog': true }));
    } else if (path.includes('/insights')) {
      setActiveSidebarItem('data-insights');
    } else if (path.includes('/policy')) {
      setActiveSidebarItem('data-policy');
    }
  }, [location.pathname]);
  
  // Toggle expanded state of sidebar items
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  // Handle click on main sidebar item
  const handleSidebarItemClick = (item: SidebarItem) => {
    if (item.children) {
      toggleExpand(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
    setActiveSidebarItem(item.id);
  };
  
  // Toggle main sidebar expansion
  const toggleMainSidebar = () => {
    setExpandedItems(prev => ({
      ...prev,
      'main': !prev['main']
    }));
  };
  
  // Toggle second sidebar expansion
  const toggleSecondSidebar = () => {
    setExpandedItems(prev => ({
      ...prev,
      'second': !prev['second']
    }));
  };
  
  // Handle click on second sidebar item
  const handleSecondSidebarItemClick = (item: SecondSidebarItem) => {
    if (item.path) {
      navigate(item.path);
    }
    setActiveSecondSidebarItem(item.id);
  };
  
  // Handle sidebar resize
  const handleResizeStart = (e: React.MouseEvent) => {
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingRef.current) {
        const newWidth = startWidthRef.current + (e.clientX - startXRef.current);
        if (newWidth >= 180 && newWidth <= 400) {
          setSidebarWidth(newWidth);
        }
      }
    };
    
    const handleMouseUp = () => {
      resizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Render main sidebar item
  const renderMainSidebarItem = (item: SidebarItem) => {
    const isActive = activeSidebarItem === item.id;
    const isItemExpanded = expandedItems[item.id];
    const hasChildren = item.children && item.children.length > 0;
    const isSidebarExpanded = expandedItems['main'];
    
    return (
      <div key={item.id} className="mb-3">
        <SidebarItem
          icon={item.icon}
          label={item.name}
          active={isActive}
          onClick={() => handleSidebarItemClick(item)}
          hasChildren={hasChildren}
          expanded={isItemExpanded}
          onToggleExpand={() => toggleExpand(item.id)}
        />
        
        {hasChildren && isItemExpanded && isSidebarExpanded && (
          <div 
            className="ml-6 mt-2 space-y-2 overflow-hidden" 
            style={{ animation: `${expandIn} 0.3s ease-out forwards` }}
          >
            {item.children?.map(child => {
              const isChildActive = activeSecondSidebarItem === child.id;
              return (
                <SidebarItem
                  key={child.id}
                  icon={child.icon}
                  label={child.name}
                  active={isChildActive}
                  onClick={() => handleSecondSidebarItemClick(child)}
                  level={1}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  // Render second sidebar section
  const renderSecondSidebarSection = (sectionKey: string, items: SecondSidebarItem[]) => {
    const isSidebarExpanded = expandedItems['second'];
    
    return (
      <div key={sectionKey} className="mb-6">
        {isSidebarExpanded && (
          <div className="relative mb-4">
            <Typography 
              variant="subtitle2" 
              className="text-gray-300 uppercase text-xs font-bold px-3 py-1 border-l-2 border-indigo-500 pl-3"
              sx={{
                background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0) 100%)',
                borderRadius: '0 4px 4px 0',
              }}
            >
              {sectionTitles[sectionKey] || sectionKey}
            </Typography>
          </div>
        )}
        <div className="space-y-2">
          {items.map(item => {
            const isActive = activeSecondSidebarItem === item.id;
            return (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.name}
                active={isActive}
                onClick={() => handleSecondSidebarItemClick(item)}
              />
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render content based on active items
  const renderContent = () => {
    interface ContentWrapperProps {
      children: React.ReactNode;
    }
    
    const ContentWrapper: React.FC<ContentWrapperProps> = ({ children }) => (
      <div style={{
        padding: '24px',
        backgroundColor: theme.bg,
        borderRadius: '8px',
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
        animation: `${fadeIn} 0.3s ease-out`,
        height: '100%',
        overflow: 'auto'
      }}>
        {children}
      </div>
    );

    // Default content when no item is selected
    if (!activeSidebarItem) {
      return (
        <ContentWrapper>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Typography variant="h4" style={{ 
              marginBottom: '16px', 
              fontWeight: 600,
              color: theme.text
            }}>
              Welcome to Data Governance
            </Typography>
            <Typography variant="body1" style={{ 
              color: theme.textSecondary, 
              marginBottom: '32px' 
            }}>
              Select an option from the sidebar to get started.
            </Typography>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '16px', 
              flexWrap: 'wrap' 
            }}>
              {mainSidebarItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSidebarItemClick(item)}
                  style={{
                    padding: '24px',
                    width: '200px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: theme.sidebar,
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ 
                    fontSize: '2rem', 
                    marginBottom: '16px', 
                    color: theme.accent 
                  }}>
                    {item.icon}
                  </div>
                  <Typography variant="h6" style={{ 
                    marginBottom: '8px',
                    color: theme.text
                  }}>
                    {item.name}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </ContentWrapper>
      );
    }

    // If data-map is active and a second sidebar item is selected
    if (activeSidebarItem === 'data-map') {
      if (!activeSecondSidebarItem) {
        return (
          <ContentWrapper>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Typography variant="h4" style={{ 
                marginBottom: '16px', 
                fontWeight: 600,
                color: theme.text
              }}>
                Data Map
              </Typography>
              <Typography variant="body1" style={{ 
                color: theme.textSecondary, 
                marginBottom: '32px' 
              }}>
                Select a category from the sidebar to explore the data map.
              </Typography>
            </div>
          </ContentWrapper>
        );
      }
      
      if (activeSecondSidebarItem === 'resources') {
        return <ContentWrapper><DataSourceManagement /></ContentWrapper>;
      } else if (activeSecondSidebarItem === 'scan-rule-sets') {
        return <ContentWrapper><ScanRuleSetManagement /></ContentWrapper>;
      } else if (activeSecondSidebarItem === 'scan') {
        return <ContentWrapper><ScanManagement /></ContentWrapper>;
      } else if (activeSecondSidebarItem === 'compliance') {
        return <ContentWrapper><ComplianceManagement /></ContentWrapper>;
      } else if (activeSecondSidebarItem === 'sensitivity') {
        return <ContentWrapper><SensitivityManagement /></ContentWrapper>;
      } else if (activeSecondSidebarItem === 'dashboard') {
        return <ContentWrapper><DataGovernanceMainPage /></ContentWrapper>;
      } else {
        // For other items that don't have components yet
        return (
          <ContentWrapper>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" className="mb-4">
                {dataMapSidebarItems.find(item => item.id === activeSecondSidebarItem)?.name || 'Content'}
              </Typography>
              <Paper elevation={3} className="p-4">
                <Typography>
                  {activeSecondSidebarItem === 'collections' && 'Collections content will be displayed here.'}
                  {activeSecondSidebarItem === 'monitoring' && 'Monitoring content will be displayed here.'}
                  {activeSecondSidebarItem === 'pattern-rules' && 'Pattern Rules content will be displayed here.'}
                  {activeSecondSidebarItem === 'nxci-factory-runtimes' && 'NXCI_Factory Runtimes content will be displayed here.'}
                  {activeSecondSidebarItem === 'classifications' && 'Classifications content will be displayed here.'}
                  {activeSecondSidebarItem === 'classification-rules' && 'Classification Rules content will be displayed here.'}
                </Typography>
              </Paper>
            </Box>
          </ContentWrapper>
        );
      }
    } else if (activeSidebarItem === 'data-catalog') {
      // Check which data catalog item is active
      const path = location.pathname;
      if (path.includes('/catalog-management')) {
        return <ContentWrapper><CatalogManagement /></ContentWrapper>;
      } else {
        return <ContentWrapper><DataCatalogManagement /></ContentWrapper>;
      }
    } else if (activeSidebarItem === 'data-insights') {
      return (
        <ContentWrapper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" className="mb-4">Data Insights & Analytics</Typography>
            <Paper elevation={3} className="p-4">
              <Typography>Data insights and analytics content will be displayed here.</Typography>
            </Paper>
          </Box>
        </ContentWrapper>
      );
    } else if (activeSidebarItem === 'data-policy') {
      return (
        <ContentWrapper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" className="mb-4">Data Policy & Management</Typography>
            <Paper elevation={3} className="p-4">
              <Typography>Data policy and management content will be displayed here.</Typography>
            </Paper>
          </Box>
        </ContentWrapper>
      );
    }
    
    // Default content
    return <ContentWrapper><DataGovernanceMainPage /></ContentWrapper>;
  };
  
  const mainSidebarExpanded = expandedItems['main'];
  const secondSidebarExpanded = expandedItems['second'];
  
  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: theme.bg,
      color: theme.text
    }}>
      {/* Main Sidebar */}
      <SidebarContainer expanded={expandedItems['main']} isSecond={false}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            {expandedItems['main'] ? (
              <Typography variant="h6" className="font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Data Governance
              </Typography>
            ) : (
              <Typography variant="h6" className="font-bold text-center w-full bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                DG
              </Typography>
            )}
            <IconButton 
                size="small" 
                onClick={toggleMainSidebar} 
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)' 
                  } 
                }}
              >
                {expandedItems['main'] ? <FiChevronLeft /> : <FiChevronRight />}
              </IconButton>
          </div>
          <div className="space-y-2">
            {mainSidebarItems.map(renderMainSidebarItem)}
          </div>
        </div>
      </SidebarContainer>
      
      {/* Second Sidebar - Only visible when Data Map is active */}
      {activeSidebarItem === 'data-map' && (
        <SidebarContainer expanded={expandedItems['second']} isSecond={true}>
          <div className="flex items-center justify-between mb-6">
            {expandedItems['second'] ? (
              <Typography variant="h6" className="font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Data Map
              </Typography>
            ) : (
              <Typography variant="h6" className="font-bold text-center w-full bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                DM
              </Typography>
            )}
            <IconButton 
              size="small" 
              onClick={toggleSecondSidebar} 
              className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(99, 102, 241, 0.1)' 
                } 
              }}
            >
              {expandedItems['second'] ? <FiChevronLeft /> : <FiChevronRight />}
            </IconButton>
          </div>
          {Object.entries(groupedSecondSidebarItems).map(([sectionKey, items]) => 
            renderSecondSidebarSection(sectionKey, items)
          )}
        </SidebarContainer>
      )}
      
      {/* Main Content */}
      <div className="flex-grow overflow-y-auto bg-gray-800/80 backdrop-blur-sm p-4">
        <AnimatedContent className="h-full rounded-lg overflow-hidden shadow-xl bg-gray-800/50 backdrop-blur-sm">
          {renderContent()}
        </AnimatedContent>
      </div>
    </div>
  );
};

export default MainPage;