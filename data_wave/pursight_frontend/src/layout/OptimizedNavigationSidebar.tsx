import React, { memo, useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ChevronDownIcon,
  DatabaseIcon,
  CogIcon,
  AlertIcon,
  HistoryIcon,
  WarehouseIcon,
  EngineeringIcon,
  JobIcon,
  MLIcon,
  PlaygroundIcon,
  AIBuilderIcon,
  BetaIcon,
  ExperimentIcon,
  FeatureIcon,
  ModelIcon,
  ServerIcon,
  WorkspaceIcon,
  RecentIcon,
  CatalogIcon,
  PlusIcon,
  CheckIcon,
  CrossIcon,
  WarningIcon,
  LightningSmallIcon,
  DataIngestionIcon,
  PipelineSmallIcon,
} from "../icons/icon";
import { useSidebar } from "../context/SidebarContext";
import { useRBAC } from "../hooks/useRBAC";

// Optimized types
interface NavItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  path?: string;
  badge?: "checked" | "cross" | "warning" | "lightning" | "data" | "pipeline";
  subItems?: NavItem[];
  isSection?: boolean;
}

// Static navigation items - moved outside component to prevent recreation
const BASE_NAV_ITEMS: NavItem[] = [
  {
    id: "workspace",
    name: "Workspace",
    icon: <WorkspaceIcon />,
    path: "/workspace",
  },
  {
    id: "data-governance",
    name: "Data Governance",
    icon: <CatalogIcon />,
    isSection: true,
    path: "/data-governance",
    subItems: [
      {
        id: "data-governance-main",
        name: "Main Page",
        path: "/data-governance",
        icon: <CatalogIcon />,
      },
      {
        id: "data-sources",
        name: "Data Sources",
        path: "/data-sources",
        icon: <DatabaseIcon />,
      },
      {
        id: "scan-rule-sets",
        name: "Scan Rule Sets",
        path: "/scan-rule-sets",
        icon: <ServerIcon />,
      },
      {
        id: "scans",
        name: "Scans",
        path: "/scans",
        icon: <DataIngestionIcon />,
      },
    ],
  },
  {
    id: "recents",
    name: "Recents",
    icon: <RecentIcon />,
    path: "/recents",
    badge: "cross",
  },
  {
    id: "catalog",
    name: "Catalog",
    icon: <CatalogIcon />,
    path: "/catalog",
    badge: "warning",
  },
  {
    id: "proposals",
    name: "Proposals",
    icon: <DatabaseIcon />,
    path: "/proposals",
  },
  {
    id: "reviews",
    name: "Reviews",
    icon: <CheckIcon />,
    path: "/reviews",
  },
  {
    id: "sensitivity-labels",
    name: "Sensitivity Labels",
    icon: <CatalogIcon />,
    path: "/sensitivity-labels",
    badge: "checked",
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: <AlertIcon />,
    path: "/notifications",
  },
  {
    id: "ml-feedback",
    name: "ML Feedback",
    icon: <MLIcon />,
    path: "/ml-feedback",
  },
  {
    id: "audit-trail",
    name: "Audit Trail",
    icon: <HistoryIcon />,
    path: "/audit-trail",
  },
  {
    id: "admin",
    name: "Admin",
    icon: <CogIcon />,
    path: "/admin",
  },
  {
    id: "sql",
    name: "SQL",
    icon: <DatabaseIcon />,
    isSection: true,
    subItems: [
      {
        id: "sql-editor",
        name: "SQL Editor",
        path: "/sql/editor",
        icon: <CogIcon />,
      },
      {
        id: "queries",
        name: "Queries",
        path: "/sql/queries",
        icon: <CheckIcon />,
        badge: "checked",
      },
      {
        id: "dashboards",
        name: "Dashboards",
        path: "/sql/dashboards",
        icon: <CrossIcon />,
        badge: "cross",
      },
      {
        id: "genie",
        name: "Genie",
        path: "/sql/genie",
        icon: <CheckIcon />,
        badge: "checked",
      },
      {
        id: "alerts",
        name: "Alerts",
        path: "/sql/alerts",
        icon: <AlertIcon />,
        badge: "checked",
      },
      {
        id: "query-history",
        name: "Query History",
        path: "/sql/history",
        icon: <HistoryIcon />,
        badge: "cross",
      },
      {
        id: "sql-warehouses",
        name: "SQL Warehouses",
        path: "/sql/warehouses",
        icon: <WarehouseIcon />,
        badge: "warning",
      },
    ],
  },
  {
    id: "data-engineering",
    name: "Data Engineering",
    icon: <EngineeringIcon />,
    isSection: true,
    subItems: [
      {
        id: "job-runs",
        name: "Job Runs",
        path: "/data-engineering/jobs",
        icon: <JobIcon />,
        badge: "lightning",
      },
      {
        id: "data-ingestion",
        name: "Data Ingestion",
        path: "/data-engineering/ingestion",
        icon: <DataIngestionIcon />,
        badge: "data",
      },
      {
        id: "pipelines",
        name: "Pipelines",
        path: "/data-engineering/pipelines",
        icon: <PipelineSmallIcon />,
        badge: "pipeline",
      },
    ],
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    icon: <MLIcon />,
    isSection: true,
    subItems: [
      {
        id: "playground",
        name: "Playground",
        path: "/ml/playground",
        icon: <PlaygroundIcon />,
      },
      {
        id: "ai-builder",
        name: "AI Builder",
        path: "/ml/ai-builder",
        icon: <AIBuilderIcon />,
      },
      {
        id: "beta",
        name: "Beta",
        path: "/ml/beta",
        icon: <BetaIcon />,
      },
      {
        id: "experiments",
        name: "Experiments",
        path: "/ml/experiments",
        icon: <ExperimentIcon />,
      },
      {
        id: "features",
        name: "Features",
        path: "/ml/features",
        icon: <FeatureIcon />,
      },
      {
        id: "models",
        name: "Models",
        path: "/ml/models",
        icon: <ModelIcon />,
      },
      {
        id: "serving",
        name: "Serving",
        path: "/ml/serving",
        icon: <ServerIcon />,
      },
    ],
  },
];

// Memoized badge renderer
const Badge = memo<{ type: string }>(({ type }) => {
  const badgeConfig = useMemo(() => {
    switch (type) {
      case "checked":
        return { icon: CheckIcon, className: "w-3 h-3 text-green-500" };
      case "cross":
        return { icon: CrossIcon, className: "w-3 h-3 text-red-500" };
      case "warning":
        return { icon: WarningIcon, className: "w-3 h-3 text-yellow-500" };
      case "lightning":
        return { icon: LightningSmallIcon, className: "w-3 h-3 text-blue-500" };
      case "data":
        return { icon: DataIngestionIcon, className: "w-3 h-3 text-purple-500" };
      case "pipeline":
        return { icon: PipelineSmallIcon, className: "w-3 h-3 text-teal-500" };
      default:
        return null;
    }
  }, [type]);

  if (!badgeConfig) return null;
  
  const IconComponent = badgeConfig.icon;
  return <IconComponent className={badgeConfig.className} />;
});

// Memoized sidebar item component
const SidebarItem = memo<{
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  hasChildren: boolean;
  onItemClick: (item: NavItem) => void;
  onToggleExpand: (id: string) => void;
  subMenuExpanded?: boolean;
  level?: number;
}>(({ 
  item, 
  isActive, 
  isExpanded, 
  isHovered, 
  isMobileOpen, 
  hasChildren, 
  onItemClick, 
  onToggleExpand, 
  subMenuExpanded = false,
  level = 0 
}) => {
  const showText = isExpanded || isHovered || isMobileOpen;
  const justifyClass = !isExpanded && !isHovered ? "lg:justify-center" : "justify-start";
  
  const handleClick = useCallback(() => {
    onItemClick(item);
  }, [item, onItemClick]);
  
  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(item.id);
  }, [item.id, onToggleExpand]);

  const baseClasses = `flex items-center w-full px-3 py-2 text-sm font-medium rounded-md group transition-all duration-200 ${justifyClass}`;
  const activeClasses = isActive 
    ? "bg-[#232733] text-blue-400" 
    : "text-gray-300 hover:bg-[#232733] hover:text-blue-300";
  
  const iconClasses = isActive 
    ? "text-blue-400" 
    : "text-gray-400 group-hover:text-blue-300";

  const Element = item.path ? Link : "button";
  const elementProps = item.path ? { to: item.path } : { onClick: handleClick };

  return (
    <li style={{ marginLeft: level * 16 }}>
      <Element
        {...elementProps}
        className={`${baseClasses} ${activeClasses}`}
      >
        <span className={`flex-shrink-0 ${iconClasses}`}>
          {item.icon}
        </span>
        {showText && (
          <>
            <span className="ml-3 truncate">{item.name}</span>
            {item.badge && (
              <span className="ml-auto">
                <Badge type={item.badge} />
              </span>
            )}
            {hasChildren && (
              <button
                onClick={handleToggleExpand}
                className="ml-auto p-1 rounded transition-transform duration-200"
                aria-label={`Toggle ${item.name} submenu`}
              >
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    subMenuExpanded 
                      ? "rotate-180 text-blue-300" 
                      : "text-gray-400 group-hover:text-blue-300"
                  }`}
                />
              </button>
            )}
          </>
        )}
      </Element>
    </li>
  );
});

// Main optimized sidebar component
const OptimizedNavigationSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { can } = useRBAC();

  // Local state for expanded submenus - using Set for better performance
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set(['data-governance']));

  // Memoized navigation items with RBAC
  const navigationItems = useMemo(() => {
    const rbacItems = can("manage", "rbac") ? [{
      id: "rbac-admin",
      name: "RBAC Admin",
      icon: <CogIcon className="text-yellow-400" />,
      path: "/rbac-admin",
    }] : [];
    
    return [...BASE_NAV_ITEMS, ...rbacItems];
  }, [can]);

  // Memoized active item detection
  const activeItemId = useMemo(() => {
    const path = location.pathname;
    
    // Direct path matching
    for (const item of navigationItems) {
      if (item.path === path) return item.id;
      
      // Check subitems
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.path === path) return subItem.id;
        }
      }
    }
    
    // Fallback to path-based matching
    if (path.startsWith('/data-governance')) return 'data-governance';
    if (path.startsWith('/sql')) return 'sql';
    if (path.startsWith('/data-engineering')) return 'data-engineering';
    if (path.startsWith('/ml')) return 'machine-learning';
    
    return null;
  }, [location.pathname, navigationItems]);

  // Optimized handlers
  const handleItemClick = useCallback((item: NavItem) => {
    if (item.isSection && item.subItems) {
      setExpandedSubmenus(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else if (item.path) {
      navigate(item.path);
    }
  }, [navigate]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleCatalogClick = useCallback(() => {
    navigate("/schema-information");
  }, [navigate]);

  // Render optimized navigation items
  const renderNavigationItems = useMemo(() => {
    return navigationItems.map((item) => {
      const isActive = activeItemId === item.id;
      const hasChildren = Boolean(item.subItems?.length);
      const subMenuExpanded = expandedSubmenus.has(item.id);
      const showText = isExpanded || isHovered || isMobileOpen;

      return (
        <React.Fragment key={item.id}>
          {item.id === "catalog" ? (
            <li>
              <button
                onClick={handleCatalogClick}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md group transition-all duration-200 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                } ${
                  isActive
                    ? "bg-[#232733] text-blue-400"
                    : "text-gray-300 hover:bg-[#232733] hover:text-blue-300"
                }`}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive
                      ? "text-blue-400"
                      : "text-gray-400 group-hover:text-blue-300"
                  }`}
                >
                  {item.icon}
                </span>
                {showText && (
                  <>
                    <span className="ml-3 truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto">
                        <Badge type={item.badge} />
                      </span>
                    )}
                  </>
                )}
              </button>
            </li>
          ) : (
            <>
              <SidebarItem
                item={item}
                isActive={isActive}
                isExpanded={isExpanded}
                isHovered={isHovered}
                isMobileOpen={isMobileOpen}
                hasChildren={hasChildren}
                onItemClick={handleItemClick}
                onToggleExpand={handleToggleExpand}
                subMenuExpanded={subMenuExpanded}
              />
              
              {/* Render subitems */}
              {hasChildren && subMenuExpanded && showText && (
                <li className="ml-6 mt-1 space-y-1 overflow-hidden">
                  <ul className="space-y-1">
                    {item.subItems?.map((subItem) => (
                      <SidebarItem
                        key={subItem.id}
                        item={subItem}
                        isActive={activeItemId === subItem.id}
                        isExpanded={isExpanded}
                        isHovered={isHovered}
                        isMobileOpen={isMobileOpen}
                        hasChildren={false}
                        onItemClick={handleItemClick}
                        onToggleExpand={handleToggleExpand}
                        level={1}
                      />
                    ))}
                  </ul>
                </li>
              )}
            </>
          )}
        </React.Fragment>
      );
    });
  }, [
    navigationItems,
    activeItemId,
    expandedSubmenus,
    isExpanded,
    isHovered,
    isMobileOpen,
    handleItemClick,
    handleToggleExpand,
    handleCatalogClick
  ]);

  return (
    <aside
      className={`fixed top-16 left-0 flex flex-col h-[calc(100vh-4rem)] px-4 bg-[#181c24] border-r border-[#232733] z-40 transition-all duration-300 ease-in-out
        ${
          isExpanded || isMobileOpen
            ? "w-[240px]"
            : isHovered
            ? "w-[240px]"
            : "w-[64px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* New button - optimized positioning */}
      <div className="sticky top-0 z-10 py-4 bg-[#181c24]">
        <button
          className={`flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none transition-colors duration-200 ${
            !isExpanded && !isHovered ? "px-2" : "px-3"
          }`}
          aria-label="Create new item"
        >
          <PlusIcon className="w-5 h-5" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="ml-2">New</span>
          )}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 py-2">
          {renderNavigationItems}
        </ul>
      </nav>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #232733 #181c24;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #232733;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #181c24;
        }
        nav {
          scrollbar-width: thin;
          scrollbar-color: #232733 #181c24;
        }
        nav::-webkit-scrollbar {
          width: 6px;
        }
        nav::-webkit-scrollbar-thumb {
          background: #232733;
          border-radius: 3px;
        }
        nav::-webkit-scrollbar-track {
          background: #181c24;
        }
      `}</style>
    </aside>
  );
};

export default memo(OptimizedNavigationSidebar);