import React, { useState, useRef, useEffect, memo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiUser,
  FiTag,
  FiMessageCircle,
  FiBell,
  FiCheckCircle,
  FiColumns,
  FiDatabase,
  FiInfo,
  FiLock,
  FiClock,
  FiGitBranch,
  FiPieChart,
  FiCheckSquare,
} from "react-icons/fi";
import { useCatalogTree } from "../../api/catalog";
import ColumnsTab from "./ColumnsTab";
import SampleDataTab from "./SampleDataTab";
import DetailsTab from "./DetailsTab";
import PermissionsTab from "./PermissionsTab";
import HistoryTab from "./HistoryTab";
import LineageTab from "./LineageTab";
import InsightsTab from "./InsightsTab";
import QualityTab from "./QualityTab";
import SensitivityLabelingTab from "./SensitivityLabelingTab";
import ProposalsTab from "./ProposalsTab";
import NotificationsTab from "./NotificationsTab";
import MLFeedbackTab from "./MLFeedbackTab";

// --- Databricks-inspired custom UI overhaul ---
// Sidebar, header, tab bar, and content area refactored for pixel-perfect Databricks look
// Custom dark theme, spacing, and iconography
// All styles are custom, no generic libraries

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

const columns = [
  { id: "user_id", name: "user_id", type: "string", comment: "", tags: "" },
  {
    id: "firstname",
    name: "firstname",
    type: "string",
    comment: "",
    tags: "pii",
  },
  {
    id: "lastname",
    name: "lastname",
    type: "string",
    comment: "",
    tags: "pii",
  },
  {
    id: "creation_date",
    name: "creation_date",
    type: "timestamp",
    comment: "",
    tags: "",
  },
  {
    id: "last_activity_date",
    name: "last_activity_date",
    type: "timestamp",
    comment: "",
    tags: "",
  },
  { id: "canal", name: "canal", type: "string", comment: "", tags: "" },
  { id: "age_group", name: "age_group", type: "int", comment: "", tags: "" },
];

const tabs = [
  { id: "columns", label: "Columns", icon: FiColumns },
  { id: "sensitivity", label: "Sensitivity", icon: FiTag, notifications: 3 },
  {
    id: "proposals",
    label: "Proposals",
    icon: FiCheckCircle,
    notifications: 0,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: FiBell,
    notifications: 0,
  },
  { id: "ml-feedback", label: "ML Feedback", icon: FiMessageCircle },
  { id: "sample-data", label: "Sample Data", icon: FiDatabase },
  { id: "details", label: "Details", icon: FiInfo },
  { id: "permissions", label: "Permissions", icon: FiLock },
  { id: "history", label: "History", icon: FiClock },
  { id: "lineage", label: "Lineage", icon: FiGitBranch },
  { id: "insights", label: "Insights", icon: FiPieChart },
  { id: "quality", label: "Quality", icon: FiCheckSquare },
];

// Memoized SidebarItem for performance
const SidebarItem: React.FC<{
  item: any;
  depth?: number;
  activePath: string[];
  onSelect: (path: string[]) => void;
  path: string[];
}> = memo(({ item, depth = 0, activePath, onSelect, path }) => {
  const [open, setOpen] = useState(true);
  const isActive = activePath.join("/") === path.join("/");
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: `4px 8px 4px ${16 + depth * 16}px`,
          cursor: item.children ? "pointer" : "pointer",
          color: isActive ? theme.accent : theme.text,
          background: isActive ? theme.sidebarActive : "none",
          borderRadius: 4,
          fontWeight: depth === 0 ? 600 : 400,
          fontSize: 14,
          marginBottom: 1,
          transition: "background 0.15s",
          outline: isActive ? `2px solid ${theme.accent}` : undefined,
        }}
        tabIndex={0}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (item.children) setOpen((o) => !o);
          onSelect(path);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (item.children) setOpen((o) => !o);
            onSelect(path);
          }
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = theme.sidebarHover)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = isActive
            ? theme.sidebarActive
            : "transparent")
        }
      >
        <span style={{ marginRight: 8 }}>{item.icon || <FiTag />}</span>
        <span>{item.label}</span>
        {item.badge && <NotificationBadge count={item.badge} />}
        {item.children && (
          <span style={{ marginLeft: "auto", fontSize: 13, opacity: 0.7 }}>
            {open ? <FiChevronDown /> : <FiChevronRight />}
          </span>
        )}
      </div>
      {open && item.children && (
        <div>
          {item.children.map((child: any, idx: number) => (
            <SidebarItem
              key={idx}
              item={child}
              depth={depth + 1}
              activePath={activePath}
              onSelect={onSelect}
              path={[...path, child.label]}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const DataCatalog: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [resizing, setResizing] = useState(false);
  const [activePath, setActivePath] = useState([
    "workspace",
    "information_schema",
    "PostgreSQL",
    "public",
    "online_users",
  ]);
  const [activeTab, setActiveTab] = useState("columns");

  const renderTabContent = () => {
    switch (activeTab) {
      case "columns":
        return <ColumnsTab columns={columns} />;
      case "sensitivity":
        return <SensitivityLabelingTab columns={columns} path={activePath} />;
      case "proposals":
        return <ProposalsTab />;
      case "notifications":
        return <NotificationsTab />;
      case "ml-feedback":
        return <MLFeedbackTab />;
      case "sample-data":
        return <SampleDataTab />;
      case "details":
        return <DetailsTab />;
      case "permissions":
        return <PermissionsTab />;
      case "history":
        return <HistoryTab />;
      case "lineage":
        return <LineageTab />;
      case "insights":
        return <InsightsTab />;
      case "quality":
        return <QualityTab />;
      default:
        return null;
    }
  };
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { data: catalogTree, isLoading, error } = useCatalogTree();

  // Sidebar resizing
  const onMouseDown = () => {
    setResizing(true);
    document.body.style.cursor = "col-resize";
  };
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (resizing && sidebarRef.current) {
        const newWidth = Math.max(
          180,
          Math.min(
            400,
            e.clientX - sidebarRef.current.getBoundingClientRect().left
          )
        );
        setSidebarWidth(newWidth);
      }
    };
    const onMouseUp = () => {
      setResizing(false);
      document.body.style.cursor = "";
    };
    if (resizing) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizing]);

  // Breadcrumbs
  const breadcrumbs = activePath.map((label, idx) => (
    <span key={idx} style={{ display: "flex", alignItems: "center" }}>
      {idx > 0 && (
        <span style={{ margin: "0 7px", color: theme.textSecondary }}>
          {">"}
        </span>
      )}
      <span
        style={{
          color: idx === activePath.length - 1 ? theme.text : theme.accent,
          fontWeight: idx === activePath.length - 1 ? 600 : 500,
          cursor: idx === activePath.length - 1 ? "default" : "pointer",
          textTransform: idx === 0 ? "capitalize" : "none",
        }}
        onClick={() => {
          if (idx < activePath.length - 1)
            setActivePath(activePath.slice(0, idx + 1));
        }}
      >
        {label}
      </span>
    </span>
  ));

  // --- Enhanced tab bar with badges and tooltips ---
  const tabMeta = tabs.reduce(
    (acc, tab) => ({
      ...acc,
      [tab.id]: {
        badge: tab.notifications,
        tooltip: tab.label,
        realtime: tab.id === "notifications" ? true : undefined,
      },
    }),
    {} as Record<
      string,
      {
        badge?: number;
        tooltip?: string;
        realtime?: boolean;
      }
    >
  );

  return (
    <div
      style={{
        height: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: "Inter, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 54,
          background: theme.header,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 1,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        Data Explorer
      </div>
      {/* Main */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div
            ref={sidebarRef}
            style={{
              width: sidebarWidth,
              background: theme.sidebar,
              borderRight: `1.5px solid ${theme.sidebarBorder}`,
              transition: "width 0.15s",
              position: "relative",
              minWidth: 180,
              maxWidth: 400,
              overflow: "auto",
              zIndex: 2,
              boxShadow: theme.shadow,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Sidebar header */}
            <div
              style={{
                padding: "18px 16px 8px 16px",
                borderBottom: `1px solid ${theme.sidebarBorder}`,
                fontWeight: 600,
                fontSize: 15,
                color: theme.textSecondary,
              }}
            >
              Data
            </div>
            {/* Sidebar filter */}
            <div
              style={{
                padding: "10px 12px 10px 12px",
                borderBottom: `1px solid ${theme.sidebarBorder}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: theme.tableRowAlt,
                  borderRadius: 6,
                  padding: "4px 8px",
                  color: theme.textSecondary,
                }}
              >
                <FiSearch style={{ marginRight: 6, fontSize: 16 }} />
                <input
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: theme.text,
                    fontSize: 14,
                    width: "100%",
                  }}
                  placeholder="Type to filter"
                  disabled
                />
              </div>
            </div>
            {/* Sidebar tree */}
            <div style={{ flex: 1, padding: "8px 0 8px 0" }}>
              {isLoading && (
                <div
                  style={{
                    color: theme.textSecondary,
                    padding: 16,
                  }}
                >
                  Loading...
                </div>
              )}
              {error && (
                <div
                  style={{
                    color: "red",
                    padding: 16,
                  }}
                >
                  Failed to load catalog
                </div>
              )}
              {catalogTree &&
                catalogTree.map((item, idx) => (
                  <SidebarItem
                    key={idx}
                    item={item}
                    activePath={activePath}
                    onSelect={setActivePath}
                    path={[item.label]}
                  />
                ))}
            </div>
            {/* Chevron pour masquer */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: -14,
                transform: "translateY(-50%)",
                background: theme.sidebar,
                border: `1px solid ${theme.sidebarBorder}`,
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 0 6px #0003",
                zIndex: 10,
              }}
              onClick={() => setSidebarOpen(false)}
            >
              <FiChevronLeft />
            </div>
            {/* Barre de redimensionnement */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 6,
                height: "100%",
                cursor: "col-resize",
                zIndex: 20,
              }}
              onMouseDown={onMouseDown}
            />
          </div>
        )}
        {/* Chevron pour afficher la sidebar */}
        {!sidebarOpen && (
          <div
            style={{
              width: 18,
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={() => setSidebarOpen(true)}
          >
            <div
              style={{
                background: theme.sidebar,
                border: `1px solid ${theme.sidebarBorder}`,
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 6px #0003",
              }}
            >
              <FiChevronRight />
            </div>
          </div>
        )}
        {/* Content */}
        <div
          style={{
            flex: 1,
            background: theme.bg,
            padding: "0 0 0 0",
            overflow: "auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Breadcrumbs */}
          <div style={{ padding: "24px 32px 0 32px", minHeight: 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                color: theme.textSecondary,
                marginBottom: 8,
              }}
            >
              {breadcrumbs}
            </div>
            {/* Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{ fontWeight: 700, fontSize: 22, color: theme.text }}
              >
                {activePath.slice(-1)[0]}
              </span>
              <span
                style={{
                  background: theme.tagBg,
                  color: theme.textSecondary,
                  borderRadius: 4,
                  fontSize: 13,
                  padding: "2px 8px",
                  marginLeft: 6,
                  fontWeight: 500,
                }}
              >
                Table
              </span>
              <span
                style={{
                  marginLeft: 16,
                  color: theme.textSecondary,
                  fontSize: 13,
                }}
              >
                <FiTag style={{ marginRight: 4, verticalAlign: "middle" }} />
                Tags:{" "}
                <span style={{ color: theme.accent, marginLeft: 2 }}>Add</span>
              </span>
              <span
                style={{
                  marginLeft: 16,
                  color: theme.textSecondary,
                  fontSize: 13,
                }}
              >
                <FiUser style={{ marginRight: 4, verticalAlign: "middle" }} />
                Owner:{" "}
                <span style={{ color: theme.text, marginLeft: 2 }}>
                  retail_owners
                </span>
              </span>
              <span
                style={{
                  marginLeft: 16,
                  color: theme.textSecondary,
                  fontSize: 13,
                }}
              >
                Popularity:{" "}
                <span style={{ color: theme.text, marginLeft: 2 }}>—</span>
              </span>
              <span
                style={{
                  marginLeft: 16,
                  color: theme.textSecondary,
                  fontSize: 13,
                }}
              >
                Size:{" "}
                <span style={{ color: theme.text, marginLeft: 2 }}>
                  Unknown
                </span>
              </span>
              <span
                style={{
                  marginLeft: 16,
                  color: theme.textSecondary,
                  fontSize: 13,
                }}
              >
                <FiMessageCircle
                  style={{ marginRight: 4, verticalAlign: "middle" }}
                />
                <span style={{ color: theme.accent, cursor: "pointer" }}>
                  Add comment
                </span>
              </span>
            </div>
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 28,
                borderBottom: `1.5px solid ${theme.border}`,
                margin: "18px 0 0 0",
              }}
              role="tablist"
            >
              {tabs.map((tab) => {
                const meta = tabMeta[tab.id];
                return (
                  <div
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    tabIndex={0}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setActiveTab(tab.id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 0 8px 0",
                      color:
                        activeTab === tab.id
                          ? theme.accent
                          : theme.textSecondary,
                      borderBottom: `2px solid ${
                        activeTab === tab.id ? theme.accent : "transparent"
                      }`,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      marginBottom: -1.5,
                      transition: "color 0.15s, border-color 0.15s",
                      position: "relative",
                      outline:
                        activeTab === tab.id
                          ? `2px solid ${theme.accent}`
                          : undefined,
                    }}
                    title={meta?.tooltip}
                  >
                    <span style={{ fontSize: 16 }}>
                      <tab.icon />
                    </span>
                    {tab.label}
                    {tab.notifications && (
                      <NotificationBadge
                        count={tab.notifications}
                        active={activeTab === tab.id}
                      />
                    )}
                    {meta?.realtime && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#2ecc40",
                          marginLeft: 6,
                          boxShadow: "0 0 8px #2ecc4088",
                          verticalAlign: "middle",
                          animation: "pulse 1.2s infinite alternate",
                        }}
                        aria-label="Real-time events"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Tab Content */}
          <div style={{ flex: 1, padding: "24px 32px", overflow: "auto" }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCatalog;
