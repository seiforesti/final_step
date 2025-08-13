import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import { useModal } from "../pages/fenetresModales/ModalContext";
import { useRBAC } from "../hooks/useRBAC";

import {
  ChevronDownIcon,
  DatabaseIcon,
  CogIcon,
  MarketIcon,
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
  WorkflowIcon,
  ComputeIcon,
  PlusIcon,
  CheckIcon,
  CrossIcon,
  WarningIcon,
  LightningSmallIcon,
  DataIngestionIcon,
  PipelineSmallIcon,
} from "../icons/icon";
import { useSidebar } from "../context/SidebarContext";
import NewItemModal from "../pages/fenetresModales/NewItemModal";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  badge?: "checked" | "cross" | "warning" | "lightning" | "data" | "pipeline";
  subItems?: {
    name: string;
    path: string;
    icon?: React.ReactNode;
    badge?: "checked" | "cross" | "warning" | "lightning" | "data" | "pipeline";
  }[];
  isSection?: boolean;
};

const navItems: NavItem[] = [
  {
    name: "Workspace",
    icon: <WorkspaceIcon />,
    path: "/workspace",
  },
  {
    name: "Data Governance",
    icon: <CatalogIcon />,
    isSection: true,
    path: "/data-governance/*", // Added for routing
    subItems: [
      {
        name: "Main Page",
        path: "/data-governance",
        icon: <CatalogIcon />,
      },
      {
        name: "Data Sources",
        path: "/data-sources",
        icon: <DatabaseIcon />,
      },
      {
        name: "Scan Rule Sets",
        path: "/scan-rule-sets",
        icon: <ServerIcon />,
      },
      {
        name: "Scans",
        path: "/scans",
        icon: <DataIngestionIcon />,
      },
    ],
  },
  {
    name: "Recents",
    icon: <RecentIcon />,
    path: "/recents",
    badge: "cross",
  },
  {
    name: "Catalog",
    icon: <CatalogIcon />,
    path: "/catalog",
    badge: "warning",
  },
  // --- Main Data & Analytics Section ---
  {
    name: "Proposals",
    icon: <DatabaseIcon />, // Use a valid icon from icons/icon.tsx
    path: "/proposals",
  },
  {
    name: "Reviews",
    icon: <CheckIcon />,
    path: "/reviews",
  },
  {
    name: "Sensitivity Labels",
    icon: <CatalogIcon />,
    path: "/sensitivity-labels",
    badge: "checked",
  },
  {
    name: "Notifications",
    icon: <AlertIcon />,
    path: "/notifications",
  },
  {
    name: "ML Feedback",
    icon: <MLIcon />,
    path: "/ml-feedback",
  },
  {
    name: "Audit Trail",
    icon: <HistoryIcon />,
    path: "/audit-trail",
  },
  // --- Admin Section ---
  {
    name: "Admin",
    icon: <CogIcon />,
    path: "/admin",
  },
  {
    name: "SQL",
    icon: <DatabaseIcon />,
    isSection: true,
    subItems: [
      {
        name: "SQL Editor",
        path: "/sql/editor",
        icon: <CogIcon />,
      },
      {
        name: "Queries",
        path: "/sql/queries",
        icon: <CheckIcon />,
        badge: "checked",
      },
      {
        name: "Dashboards",
        path: "/sql/dashboards",
        icon: <CrossIcon />,
        badge: "cross",
      },
      {
        name: "Genie",
        path: "/sql/genie",
        icon: <CheckIcon />,
        badge: "checked",
      },
      {
        name: "Alerts",
        path: "/sql/alerts",
        icon: <AlertIcon />,
        badge: "checked",
      },
      {
        name: "Query History",
        path: "/sql/history",
        icon: <HistoryIcon />,
        badge: "cross",
      },
      {
        name: "SQL Warehouses",
        path: "/sql/warehouses",
        icon: <WarehouseIcon />,
        badge: "warning",
      },
    ],
  },
  {
    name: "Data Engineering",
    icon: <EngineeringIcon />,
    isSection: true,
    subItems: [
      {
        name: "Job Runs",
        path: "/data-engineering/jobs",
        icon: <JobIcon />,
        badge: "lightning",
      },
      {
        name: "Data Ingestion",
        path: "/data-engineering/ingestion",
        icon: <DataIngestionIcon />,
        badge: "data",
      },
      {
        name: "Pipelines",
        path: "/data-engineering/pipelines",
        icon: <PipelineSmallIcon />,
        badge: "pipeline",
      },
    ],
  },
  {
    name: "Machine Learning",
    icon: <MLIcon />,
    isSection: true,
    subItems: [
      {
        name: "Playground",
        path: "/ml/playground",
        icon: <PlaygroundIcon />,
      },
      {
        name: "AI Builder",
        path: "/ml/ai-builder",
        icon: <AIBuilderIcon />,
      },
      {
        name: "Beta",
        path: "/ml/beta",
        icon: <BetaIcon />,
      },
      {
        name: "Experiments",
        path: "/ml/experiments",
        icon: <ExperimentIcon />,
      },
      {
        name: "Features",
        path: "/ml/features",
        icon: <FeatureIcon />,
      },
      {
        name: "Models",
        path: "/ml/models",
        icon: <ModelIcon />,
      },
      {
        name: "Serving",
        path: "/ml/serving",
        icon: <ServerIcon />,
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { showNewItemModal, setShowNewItemModal } = useModal();
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate
  const { can } = useRBAC();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched: number | null = null;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            submenuMatched = index;
          }
        });
      }
    });
    setOpenSubmenu(submenuMatched);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu === index) {
        return null;
      }
      return index;
    });
  };

  const renderBadge = (type: string) => {
    switch (type) {
      case "checked":
        return <CheckIcon className="w-3 h-3 text-green-500" />;
      case "cross":
        return <CrossIcon className="w-3 h-3 text-red-500" />;
      case "warning":
        return <WarningIcon className="w-3 h-3 text-yellow-500" />;
      case "lightning":
        return <LightningSmallIcon className="w-3 h-3 text-blue-500" />;
      case "data":
        return <DataIngestionIcon className="w-3 h-3 text-purple-500" />;
      case "pipeline":
        return <PipelineSmallIcon className="w-3 h-3 text-teal-500" />;
      default:
        return null;
    }
  };

  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleNewClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const sidebarRect = buttonRef.current
        .closest("aside")
        ?.getBoundingClientRect();
      setModalPosition({
        top: rect.bottom - (sidebarRect?.top || 0),
        left: rect.left - (sidebarRect?.left || 0) + rect.width,
      });
    }
    setShowNewItemModal(true);
  };

  const handleCatalogClick = () => {
    navigate("/schema-information");
    setShowNewItemModal(false);
  };

  // Add RBAC Admin link if user can manage RBAC
  const rbacNavItem = can("manage", "rbac")
    ? [
        {
          name: "RBAC Admin",
          icon: <CogIcon className="text-yellow-400" />, // gold/yellow for special
          path: "/rbac-admin",
        } as NavItem,
      ]
    : [];
  // Merge navItems with RBAC Admin if allowed
  const finalNavItems: NavItem[] = [...navItems, ...rbacNavItem];

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
      {/* Bouton New repositionné et ajusté */}
      <div className="sticky top-0 z-10 py-4 bg-[#181c24]">
        <button
          ref={buttonRef}
          onClick={handleNewClick}
          className={`flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none transition-colors
            ${!isExpanded && !isHovered ? "px-2" : "px-3"}`}
        >
          <PlusIcon className="w-5 h-5" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="ml-2">New</span>
          )}
        </button>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear custom-scrollbar">
        <nav className="mb-6">
          <ul className="flex flex-col gap-1">
            {finalNavItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.name === "Catalog" ? (
                  <button
                    onClick={handleCatalogClick}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md group
                      ${
                        isActive(nav.path || "")
                          ? "bg-[#232733] text-blue-400"
                          : "text-gray-300 hover:bg-[#232733] hover:text-blue-300"
                      }
                      ${
                        !isExpanded && !isHovered
                          ? "lg:justify-center"
                          : "justify-start"
                      }`}
                  >
                    <span
                      className={`flex-shrink-0 ${
                        isActive(nav.path || "")
                          ? "text-blue-400"
                          : "text-gray-400 group-hover:text-blue-300"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="ml-3">{nav.name}</span>
                    )}
                    {(isExpanded || isHovered || isMobileOpen) && nav.badge && (
                      <span className="ml-auto">{renderBadge(nav.badge)}</span>
                    )}
                  </button>
                ) : nav.subItems ? (
                  <>
                    <button
                      onClick={() => handleSubmenuToggle(index)}
                      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md group
                        ${
                          openSubmenu === index
                            ? "bg-[#232733] text-blue-300"
                            : "text-gray-300 hover:bg-[#232733] hover:text-blue-300"
                        }
                        ${
                          !isExpanded && !isHovered
                            ? "lg:justify-center"
                            : "justify-start"
                        }`}
                    >
                      <span
                        className={`flex-shrink-0 ${
                          openSubmenu === index
                            ? "text-blue-300"
                            : "text-gray-400 group-hover:text-blue-300"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="ml-3">{nav.name}</span>
                      )}
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <ChevronDownIcon
                          className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                            openSubmenu === index
                              ? "rotate-180 text-blue-300"
                              : "text-gray-400 group-hover:text-blue-300"
                          }`}
                        />
                      )}
                    </button>

                    <div
                      ref={(el) => {
                        subMenuRefs.current[`${index}`] = el;
                      }}
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        height:
                          openSubmenu === index
                            ? `${subMenuHeight[`${index}`]}px`
                            : "0px",
                      }}
                    >
                      <ul className="py-1 space-y-1 pl-11">
                        {nav.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.path}
                              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group
                                ${
                                  isActive(subItem.path)
                                    ? "bg-[#232733] text-blue-400"
                                    : "text-gray-300 hover:bg-[#232733] hover:text-blue-300"
                                }`}
                            >
                              {subItem.icon && (
                                <span
                                  className={`flex-shrink-0 mr-3 ${
                                    isActive(subItem.path)
                                      ? "text-blue-400"
                                      : "text-gray-400 group-hover:text-blue-300"
                                  }`}
                                >
                                  {subItem.icon}
                                </span>
                              )}
                              <span className="truncate">{subItem.name}</span>
                              {subItem.badge && (
                                <span className="ml-auto">
                                  {renderBadge(subItem.badge)}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <Link
                    to={nav.path || "#"}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group
                      ${
                        isActive(nav.path || "")
                          ? "bg-[#232733] text-blue-400"
                          : "text-gray-300 hover:bg-[#232733] hover:text-blue-300"
                      }
                      ${
                        !isExpanded && !isHovered
                          ? "lg:justify-center"
                          : "justify-start"
                      }`}
                  >
                    <span
                      className={`flex-shrink-0 ${
                        isActive(nav.path || "")
                          ? "text-blue-400"
                          : "text-gray-400 group-hover:text-blue-300"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="ml-3">{nav.name}</span>
                    )}
                    {(isExpanded || isHovered || isMobileOpen) && nav.badge && (
                      <span className="ml-auto">{renderBadge(nav.badge)}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {showNewItemModal && (
        <NewItemModal
          onClose={() => setShowNewItemModal(false)}
          triggerPosition={modalPosition}
        />
      )}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #232733 #181c24;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #232733;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #181c24;
        }
      `}</style>
    </aside>
  );
};

export default AppSidebar;
