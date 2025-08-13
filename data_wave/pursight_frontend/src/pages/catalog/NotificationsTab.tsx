import React, { useState } from "react";
import {
  useNotifications,
  useMarkNotificationRead,
  useDeleteNotification,
  useBulkDeleteNotifications,
  useNotificationAnalytics,
  useMarkAllNotificationsRead,
} from "../../api/notifications";
import type { Notification } from "../../models/Notification";
import { format } from "date-fns";
import {
  FiBell,
  FiCheckCircle,
  FiTrash2,
  FiFilter,
  FiSettings,
  FiRefreshCw,
  FiChevronRight,
  FiStar,
  FiClock,
  FiList,
  FiCopy,
  FiClock as FiSnooze,
} from "react-icons/fi";

// Databricks-inspired dark theme
const theme = {
  bg: "#181c24",
  card: "rgba(30,34,44,0.98)",
  border: "#23283a",
  accent: "#00b4fc",
  accentSoft: "#003e5c",
  text: "#f3f6fa",
  textSecondary: "#b0b8c7",
  shadow: "0 4px 32px #0008",
  success: "#4caf50",
  warning: "#ffb300",
  error: "#f44336",
  info: "#00b4fc",
  radius: 14,
  glass: "rgba(30,34,44,0.7)",
  chipBg: "#23283a",
  chipText: "#f3f6fa",
};

const AnalyticsCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) => (
  <div
    style={{
      background: `linear-gradient(135deg, ${theme.card} 60%, ${theme.accentSoft} 100%)`,
      borderRadius: theme.radius,
      boxShadow: theme.shadow,
      padding: 22,
      minWidth: 160,
      display: "flex",
      alignItems: "center",
      gap: 18,
      border: `1.5px solid ${theme.border}`,
      transition: "box-shadow 0.2s, border 0.2s",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <span
      style={{
        fontSize: 28,
        color,
        filter: "drop-shadow(0 0 8px #00b4fc88)",
      }}
    >
      {icon}
    </span>
    <div>
      <div
        style={{
          fontWeight: 800,
          fontSize: 22,
          color: theme.text,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 14,
          color: theme.textSecondary,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

const NotificationsTab: React.FC = () => {
  const userEmail = "user@example.com";
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    type: "",
    read_status: "all",
    searchQuery: "",
  });
  const { data: analytics } = useNotificationAnalytics({
    user_email: userEmail,
    date_from: filters.date_from,
    date_to: filters.date_to,
  });
  const {
    data: allNotifications,
    isLoading,
    refetch,
  } = useNotifications(userEmail);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const [showPreferences, setShowPreferences] = useState(false);
  const [grouping, setGrouping] = useState<"none" | "type" | "date">("none");
  const [sortBy, setSortBy] = useState<"date" | "type">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");
  const [pinned, setPinned] = useState<string[]>([]);
  // Details drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerNotification, setDrawerNotification] =
    useState<Notification | null>(null);
  // Advanced filter state
  const [showFilters, setShowFilters] = useState(false);
  // Notification actions
  const markReadMutation = useMarkNotificationRead();
  const deleteMutation = useDeleteNotification();
  const bulkDeleteMutation = useBulkDeleteNotifications();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // Add CSS keyframes for fade/slide animations
  const fadeIn = {
    animation: "fadeIn 0.7s cubic-bezier(.4,0,.2,1)",
  };
  const slideUp = {
    animation: "slideUp 0.6s cubic-bezier(.4,0,.2,1)",
  };
  const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

  // Inject keyframes into the document head (only once)
  if (
    typeof window !== "undefined" &&
    !document.getElementById("notif-anim-keyframes")
  ) {
    const style = document.createElement("style");
    style.id = "notif-anim-keyframes";
    style.innerHTML = keyframes;
    document.head.appendChild(style);
  }

  // --- Grouped and Sorted Notifications ---
  const getGroupedSortedNotifications = () => {
    let notifs = allNotifications ? [...allNotifications] : [];
    // Filter
    if (filters.type) notifs = notifs.filter((n) => n.type === filters.type);
    if (filters.read_status === "read") notifs = notifs.filter((n) => n.read);
    if (filters.read_status === "unread")
      notifs = notifs.filter((n) => !n.read);
    if (filters.searchQuery)
      notifs = notifs.filter((n) =>
        n.message.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    // Sort
    notifs.sort((a, b) => {
      if (sortBy === "date") {
        const cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === "asc" ? cmp : -cmp;
      } else {
        const cmp = a.type.localeCompare(b.type);
        return sortOrder === "asc" ? cmp : -cmp;
      }
    });
    // Group
    if (grouping === "type") {
      const groups: Record<string, Notification[]> = {};
      notifs.forEach((n) => {
        if (!groups[n.type]) groups[n.type] = [];
        groups[n.type].push(n);
      });
      return Object.entries(groups);
    } else if (grouping === "date") {
      const groups: Record<string, Notification[]> = {};
      notifs.forEach((n) => {
        const date = n.created_at.split("T")[0];
        if (!groups[date]) groups[date] = [];
        groups[date].push(n);
      });
      return Object.entries(groups);
    }
    return notifs;
  };

  // --- Preferences Modal ---
  const renderPreferencesModal = () =>
    showPreferences && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#0006",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: theme.card,
            borderRadius: theme.radius,
            boxShadow: theme.shadow,
            padding: 32,
            minWidth: 340,
            position: "relative",
          }}
        >
          <button
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "none",
              border: "none",
              fontSize: 22,
              color: theme.textSecondary,
              cursor: "pointer",
            }}
            onClick={() => setShowPreferences(false)}
          >
            &times;
          </button>
          <h3
            style={{
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 18,
              color: theme.text,
            }}
          >
            Notification Preferences
          </h3>
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginRight: 12,
                color: theme.text,
              }}
            >
              Auto-refresh
            </label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={() => setAutoRefresh((a) => !a)}
              style={{
                accentColor: theme.accent,
                transform: "scale(1.2)",
                marginTop: 2,
              }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginRight: 12,
                color: theme.text,
              }}
            >
              Notification Sound
            </label>
            <input
              type="checkbox"
              checked={soundOn}
              onChange={() => setSoundOn((s) => !s)}
              style={{
                accentColor: theme.accent,
                transform: "scale(1.2)",
                marginTop: 2,
              }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginRight: 12,
                color: theme.text,
              }}
            >
              Grouping
            </label>
            <select
              value={grouping}
              onChange={(e) => setGrouping(e.target.value as any)}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 14,
                background: theme.card,
                color: theme.text,
              }}
            >
              <option value="none">None</option>
              <option value="type">By Type</option>
              <option value="date">By Date</option>
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginRight: 12,
                color: theme.text,
              }}
            >
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 14,
                background: theme.card,
                color: theme.text,
              }}
            >
              <option value="date">Date</option>
              <option value="type">Type</option>
            </select>
            <button
              style={{
                marginLeft: 10,
                background: "none",
                border: "none",
                color: theme.accent,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
              onClick={() =>
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
              }
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>
    );

  // --- Advanced Filters UI ---
  const renderAdvancedFilters = () => (
    <div
      style={{
        display: "flex",
        gap: 18,
        alignItems: "center",
        marginBottom: 24,
        background: theme.glass,
        borderRadius: theme.radius,
        padding: "18px 28px",
        boxShadow: theme.shadow,
        border: `1.5px solid ${theme.border}`,
      }}
    >
      <input
        style={{
          background: theme.chipBg,
          color: theme.text,
          border: `1.5px solid ${theme.accent}`,
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 15,
          width: 220,
        }}
        placeholder="Search notifications..."
        value={filters.searchQuery}
        onChange={(e) =>
          setFilters((f) => ({ ...f, searchQuery: e.target.value }))
        }
      />
      <select
        style={{
          background: theme.chipBg,
          color: theme.text,
          border: `1.5px solid ${theme.accent}`,
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 15,
        }}
        value={filters.type}
        onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
      >
        <option value="">All Types</option>
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="error">Error</option>
      </select>
      <select
        style={{
          background: theme.chipBg,
          color: theme.text,
          border: `1.5px solid ${theme.accent}`,
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 15,
        }}
        value={filters.read_status}
        onChange={(e) =>
          setFilters((f) => ({ ...f, read_status: e.target.value }))
        }
      >
        <option value="all">All</option>
        <option value="read">Read</option>
        <option value="unread">Unread</option>
      </select>
      <input
        type="date"
        style={{
          background: theme.chipBg,
          color: theme.text,
          border: `1.5px solid ${theme.accent}`,
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 15,
        }}
        value={filters.date_from}
        onChange={(e) =>
          setFilters((f) => ({ ...f, date_from: e.target.value }))
        }
      />
      <input
        type="date"
        style={{
          background: theme.chipBg,
          color: theme.text,
          border: `1.5px solid ${theme.accent}`,
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 15,
        }}
        value={filters.date_to}
        onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
      />
    </div>
  );

  // --- Enhanced Analytics Bar ---
  const renderAnalyticsBar = () => (
    <div
      style={{
        display: "flex",
        gap: 24,
        marginBottom: 24,
        alignItems: "center",
      }}
    >
      <AnalyticsCard
        icon={<FiBell />}
        label="Total"
        value={analytics?.total_notifications ?? 0}
        color={theme.accent}
      />
      <AnalyticsCard
        icon={<FiCheckCircle />}
        label="Unread"
        value={analytics?.unread ?? 0}
        color={theme.info}
      />
      <button
        style={{
          marginLeft: "auto",
          background: theme.card,
          border: `1.5px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: "8px 18px",
          fontWeight: 600,
          color: theme.accent,
          cursor: "pointer",
          boxShadow: theme.shadow,
        }}
        onClick={() => setShowPreferences(true)}
      >
        <FiSettings style={{ marginRight: 8 }} /> Preferences
      </button>
      <button
        style={{
          marginLeft: 12,
          background: theme.card,
          border: `1.5px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: "8px 18px",
          fontWeight: 600,
          color: autoRefresh ? theme.success : theme.textSecondary,
          cursor: "pointer",
          boxShadow: theme.shadow,
        }}
        onClick={() => setAutoRefresh((a) => !a)}
      >
        <FiRefreshCw style={{ marginRight: 8 }} />{" "}
        {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
      </button>
      <button
        style={{
          marginLeft: 12,
          background: theme.card,
          border: `1.5px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: "8px 18px",
          fontWeight: 600,
          color: soundOn ? theme.success : theme.textSecondary,
          cursor: "pointer",
          boxShadow: theme.shadow,
        }}
        onClick={() => setSoundOn((s) => !s)}
      >
        <FiBell style={{ marginRight: 8 }} />{" "}
        {soundOn ? "Sound On" : "Sound Off"}
      </button>
    </div>
  );

  // --- Enhanced Table with Grouping ---
  const renderTable = () => {
    const grouped = getGroupedSortedNotifications();
    if (
      Array.isArray(grouped) &&
      grouped.length > 0 &&
      Array.isArray(grouped[0])
    ) {
      // Grouped
      return (
        <div
          style={{
            ...fadeIn,
            background: theme.card,
            borderRadius: theme.radius,
            boxShadow: theme.shadow,
            border: `1.5px solid ${theme.border}`,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {(grouped as [string, Notification[]][]).map(
            ([group, notifs], idx) => (
              <div
                key={group}
                style={{
                  borderBottom: `1.5px solid ${theme.border}`,
                  ...slideUp,
                  animationDelay: `${0.1 * idx}s`,
                }}
              >
                <div
                  style={{
                    background: theme.glass,
                    padding: "14px 32px",
                    fontWeight: 700,
                    color: theme.accent,
                    fontSize: 16,
                    letterSpacing: 1,
                    borderLeft: `4px solid ${theme.accent}`,
                    boxShadow: "0 2px 8px #00b4fc22",
                  }}
                >
                  {group}
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 16,
                    background: theme.card,
                  }}
                >
                  <tbody>
                    {notifs.map((n: Notification, i) => (
                      <tr
                        key={n.id}
                        style={{
                          borderBottom: `1px solid ${theme.border}`,
                          cursor: "pointer",
                          background: n.read ? theme.card : theme.glass,
                          transition: "background 0.2s",
                          ...slideUp,
                          animationDelay: `${0.05 * i}s`,
                          opacity: snoozed.includes(n.id.toString()) ? 0.4 : 1,
                        }}
                        onClick={() => {
                          setDrawerNotification(n);
                          setDrawerOpen(true);
                        }}
                      >
                        <td style={{ padding: "12px 18px" }}>
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(
                              n.id.toString()
                            )}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedNotifications((sel) =>
                                sel.includes(n.id.toString())
                                  ? sel.filter((id) => id !== n.id.toString())
                                  : [...sel, n.id.toString()]
                              );
                            }}
                            style={{ accentColor: theme.accent }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "12px 18px",
                            color: theme.info,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                          }}
                        >
                          {n.type}
                        </td>
                        <td style={{ padding: "12px 18px", color: theme.text }}>
                          {n.message}
                        </td>
                        <td
                          style={{
                            padding: "12px 18px",
                            color: theme.textSecondary,
                          }}
                        >
                          {format(new Date(n.created_at), "MMM dd, yyyy HH:mm")}
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          {n.read ? (
                            <span
                              style={{
                                color: theme.success,
                                fontWeight: 600,
                                background: theme.chipBg,
                                borderRadius: 8,
                                padding: "2px 10px",
                                fontSize: 13,
                              }}
                            >
                              Read
                            </span>
                          ) : (
                            <span
                              style={{
                                color: theme.accent,
                                fontWeight: 600,
                                background: theme.chipBg,
                                borderRadius: 8,
                                padding: "2px 10px",
                                fontSize: 13,
                              }}
                            >
                              Unread
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 18px",
                            display: "flex",
                            gap: 8,
                          }}
                        >
                          <button
                            style={{
                              background: theme.chipBg,
                              border: `1px solid ${theme.accent}`,
                              color: theme.accent,
                              borderRadius: 8,
                              padding: "4px 12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              marginRight: 4,
                              transition: "background 0.2s, color 0.2s",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              markReadMutation.mutate({
                                id: n.id.toString(),
                                userEmail,
                              });
                            }}
                          >
                            Mark Read
                          </button>
                          <button
                            style={{
                              background: theme.chipBg,
                              border: `1px solid ${theme.error}`,
                              color: theme.error,
                              borderRadius: 8,
                              padding: "4px 12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              marginRight: 4,
                              transition: "background 0.2s, color 0.2s",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate({
                                id: n.id.toString(),
                                userEmail,
                              });
                            }}
                          >
                            Delete
                          </button>
                          <button
                            style={{
                              background: theme.chipBg,
                              border: `1px solid ${theme.info}`,
                              color: theme.info,
                              borderRadius: 8,
                              padding: "4px 12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              marginRight: 4,
                              transition: "background 0.2s, color 0.2s",
                            }}
                            title="Copy message"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(n.message);
                            }}
                          >
                            <FiCopy />
                          </button>
                          <button
                            style={{
                              background: theme.chipBg,
                              border: `1px solid ${theme.warning}`,
                              color: theme.warning,
                              borderRadius: 8,
                              padding: "4px 12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "background 0.2s, color 0.2s",
                            }}
                            title="Snooze 10 min"
                            onClick={(e) => {
                              e.stopPropagation();
                              snoozeNotification(n.id.toString());
                            }}
                            disabled={snoozed.includes(n.id.toString())}
                          >
                            <FiSnooze />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      );
    } else {
      // Not grouped
      return renderTableOld();
    }
  };

  // --- Old Table for fallback ---
  const renderTableOld = () => (
    <div
      style={{
        background: theme.card,
        borderRadius: theme.radius,
        boxShadow: theme.shadow,
        border: `1.5px solid ${theme.border}`,
        overflow: "hidden",
        position: "relative",
        display: "flex",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: `1.5px solid ${theme.border}`,
          }}
        >
          <FiFilter
            style={{
              marginRight: 8,
              color: theme.textSecondary,
              cursor: "pointer",
            }}
            onClick={() => setShowFilters((f) => !f)}
          />
          <input
            style={{
              border: "none",
              outline: "none",
              background: theme.bg,
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 14,
              color: theme.text,
              marginRight: 16,
              width: 180,
            }}
            placeholder="Search notifications..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((f) => ({ ...f, searchQuery: e.target.value }))
            }
          />
          <button
            style={{
              background: theme.accent,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 16px",
              fontWeight: 600,
              cursor: "pointer",
              marginRight: 12,
            }}
            onClick={() => refetch()}
          >
            <FiRefreshCw style={{ marginRight: 6 }} /> Refresh
          </button>
          <button
            style={{
              background: theme.success,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 16px",
              fontWeight: 600,
              cursor: "pointer",
              marginRight: 12,
            }}
            onClick={() => markAllReadMutation.mutate(userEmail)}
          >
            <FiCheckCircle style={{ marginRight: 6 }} /> Mark All Read
          </button>
          <button
            style={{
              background: theme.error,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() =>
              bulkDeleteMutation.mutate({
                ids: selectedNotifications,
                userEmail,
              })
            }
            disabled={selectedNotifications.length === 0}
          >
            <FiTrash2 style={{ marginRight: 6 }} /> Delete Selected
          </button>
        </div>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}
        >
          <thead style={{ background: theme.bg }}>
            <tr>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: theme.textSecondary,
                }}
              ></th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: theme.textSecondary,
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: theme.textSecondary,
                }}
              >
                Message
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: theme.textSecondary,
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: theme.textSecondary,
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: theme.textSecondary,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32 }}>
                  Loading...
                </td>
              </tr>
            ) : allNotifications && allNotifications.length > 0 ? (
              allNotifications.map((n: Notification) => (
                <tr
                  key={n.id}
                  style={{
                    borderBottom: `1px solid ${theme.border}`,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setDrawerNotification(n);
                    setDrawerOpen(true);
                  }}
                >
                  <td style={{ padding: "10px 16px" }}>
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(n.id.toString())}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedNotifications((sel) =>
                          sel.includes(n.id.toString())
                            ? sel.filter((id) => id !== n.id.toString())
                            : [...sel, n.id.toString()]
                        );
                      }}
                    />
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      color: theme.info,
                      fontWeight: 600,
                    }}
                  >
                    {n.type}
                  </td>
                  <td style={{ padding: "10px 16px" }}>{n.message}</td>
                  <td
                    style={{ padding: "10px 16px", color: theme.textSecondary }}
                  >
                    {format(new Date(n.created_at), "MMM dd, yyyy HH:mm")}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {n.read ? (
                      <span style={{ color: theme.success }}>Read</span>
                    ) : (
                      <span style={{ color: theme.accent }}>Unread</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: theme.accent,
                        cursor: "pointer",
                        marginRight: 8,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        markReadMutation.mutate({
                          id: n.id.toString(),
                          userEmail,
                        });
                      }}
                    >
                      Mark Read
                    </button>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: theme.error,
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate({
                          id: n.id.toString(),
                          userEmail,
                        });
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: theme.textSecondary,
                  }}
                >
                  No notifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Details Drawer */}
      {drawerOpen && drawerNotification && (
        <div
          style={{
            width: 380,
            background: theme.card,
            borderLeft: `1.5px solid ${theme.border}`,
            boxShadow: "-2px 0 12px #0001",
            padding: 28,
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: "none",
              border: "none",
              fontSize: 22,
              color: theme.textSecondary,
              cursor: "pointer",
            }}
            onClick={() => setDrawerOpen(false)}
          >
            <FiChevronRight />
          </button>
          <h3
            style={{
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 12,
              color: theme.text,
            }}
          >
            {drawerNotification.type}
          </h3>
          <div
            style={{
              color: theme.textSecondary,
              fontSize: 14,
              marginBottom: 18,
            }}
          >
            {format(
              new Date(drawerNotification.created_at),
              "MMM dd, yyyy HH:mm"
            )}
          </div>
          <div style={{ fontSize: 16, marginBottom: 18 }}>
            {drawerNotification.message}
          </div>
          <div
            style={{
              color: theme.textSecondary,
              fontSize: 14,
              marginBottom: 18,
            }}
          >
            Related: {drawerNotification.related_object_type}{" "}
            {drawerNotification.related_object_id
              ? `(${drawerNotification.related_object_id})`
              : ""}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {!drawerNotification.read && (
              <button
                style={{
                  background: theme.accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 18px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => {
                  markReadMutation.mutate({
                    id: drawerNotification.id.toString(),
                    userEmail,
                  });
                  setDrawerOpen(false);
                }}
              >
                Mark Read
              </button>
            )}
            <button
              style={{
                background: theme.error,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => {
                deleteMutation.mutate({
                  id: drawerNotification.id.toString(),
                  userEmail,
                });
                setDrawerOpen(false);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // --- Timeline View ---
  const renderTimeline = () => {
    const notifs = getGroupedSortedNotifications();
    const flatNotifs = Array.isArray(notifs[0])
      ? (notifs as [string, Notification[]][]).flatMap(([_, arr]) => arr)
      : (notifs as Notification[]);
    const sorted = [...flatNotifs].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return (
      <div
        style={{
          ...fadeIn,
          background: theme.card,
          borderRadius: theme.radius,
          boxShadow: theme.shadow,
          border: `1.5px solid ${theme.border}`,
          padding: 32,
          position: "relative",
          minHeight: 400,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 48,
            top: 0,
            bottom: 0,
            width: 3,
            background: `linear-gradient(${theme.accent}, ${theme.info})`,
            zIndex: 0,
            borderRadius: 2,
            boxShadow: "0 0 16px #00b4fc88",
          }}
        />
        {sorted.map((n, i) => (
          <div
            key={n.id}
            style={{
              ...slideUp,
              animationDelay: `${0.08 * i}s`,
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 38,
              position: "relative",
              zIndex: 1,
              opacity: snoozed.includes(n.id.toString()) ? 0.4 : 1,
            }}
          >
            <div
              style={{
                width: 80,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: pinned.includes(n.id.toString())
                    ? theme.accent
                    : theme.info,
                  border: `3px solid ${theme.bg}`,
                  marginBottom: 4,
                  position: "relative",
                  zIndex: 2,
                  boxShadow: pinned.includes(n.id.toString())
                    ? `0 0 12px 2px ${theme.accent}`
                    : `0 0 8px 1px ${theme.info}`,
                  transition: "box-shadow 0.2s, background 0.2s",
                }}
              />
              {i < sorted.length - 1 && (
                <div style={{ flex: 1, width: 3, background: theme.border }} />
              )}
            </div>
            <div
              style={{
                flex: 1,
                background: n.read ? theme.card : theme.glass,
                borderRadius: 12,
                boxShadow: theme.shadow,
                marginLeft: 18,
                padding: 22,
                position: "relative",
                border:
                  pinned.includes(n.id.toString()) &&
                  `2px solid ${theme.accent}`,
                transition: "border 0.2s, background 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    color: theme.text,
                    fontSize: 18,
                    letterSpacing: 0.5,
                  }}
                >
                  {n.type}
                </span>
                <span
                  style={{
                    marginLeft: 16,
                    color: theme.textSecondary,
                    fontSize: 14,
                  }}
                >
                  {format(new Date(n.created_at), "MMM dd, yyyy HH:mm")}
                </span>
                <button
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: pinned.includes(n.id.toString())
                      ? theme.accent
                      : theme.textSecondary,
                    cursor: "pointer",
                    fontSize: 20,
                    filter: pinned.includes(n.id.toString())
                      ? "drop-shadow(0 0 8px #00b4fc88)"
                      : undefined,
                    transition: "color 0.2s, filter 0.2s",
                  }}
                  onClick={() => togglePin(n.id.toString())}
                  title={pinned.includes(n.id.toString()) ? "Unpin" : "Pin"}
                >
                  <FiStar />
                </button>
              </div>
              <div
                style={{ fontSize: 16, marginBottom: 10, color: theme.text }}
              >
                {n.message}
              </div>
              <div
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  marginBottom: 10,
                }}
              >
                Related: {n.related_object_type}{" "}
                {n.related_object_id ? `(${n.related_object_id})` : ""}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {!n.read && (
                  <button
                    style={{
                      background: theme.accent,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "7px 18px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: `0 2px 8px ${theme.accent}33`,
                      fontSize: 15,
                    }}
                    onClick={() =>
                      markReadMutation.mutate({
                        id: n.id.toString(),
                        userEmail,
                      })
                    }
                  >
                    Mark Read
                  </button>
                )}
                <button
                  style={{
                    background: theme.error,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 18px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 15,
                  }}
                  onClick={() =>
                    deleteMutation.mutate({ id: n.id.toString(), userEmail })
                  }
                >
                  Delete
                </button>
                <button
                  style={{
                    background: theme.chipBg,
                    border: `1px solid ${theme.info}`,
                    color: theme.info,
                    borderRadius: 8,
                    padding: "4px 12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginRight: 4,
                    transition: "background 0.2s, color 0.2s",
                  }}
                  title="Copy message"
                  onClick={() => copyToClipboard(n.message)}
                >
                  <FiCopy />
                </button>
                <button
                  style={{
                    background: theme.chipBg,
                    border: `1px solid ${theme.warning}`,
                    color: theme.warning,
                    borderRadius: 8,
                    padding: "4px 12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  title="Snooze 10 min"
                  onClick={() => snoozeNotification(n.id.toString())}
                  disabled={snoozed.includes(n.id.toString())}
                >
                  <FiSnooze />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --- Pin/Unpin Notification ---
  const togglePin = (id: string) => {
    setPinned((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // --- Advanced Features ---
  // 1. Notification Export
  const exportNotifications = (format: "csv" | "json") => {
    const notifs = getGroupedSortedNotifications();
    const flat = Array.isArray(notifs[0])
      ? (notifs as [string, Notification[]][]).flatMap(([_, arr]) => arr)
      : (notifs as Notification[]);
    if (format === "json") {
      const blob = new Blob([JSON.stringify(flat, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "notifications.json";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const csv = [
        "id,type,message,created_at,read,related_object_type,related_object_id",
        ...flat.map(
          (n) =>
            `${n.id},${n.type},"${n.message.replace(/"/g, '""')}",${
              n.created_at
            },${n.read},${n.related_object_type},${n.related_object_id}`
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "notifications.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // 2. Notification Snooze
  const [snoozed, setSnoozed] = useState<string[]>([]);
  const snoozeNotification = (id: string) => {
    setSnoozed((prev) => [...prev, id]);
    setTimeout(
      () => setSnoozed((prev) => prev.filter((sid) => sid !== id)),
      1000 * 60 * 10
    ); // 10 min
  };

  // 3. Quick Actions (Acknowledge, Copy)
  const copyToClipboard = (msg: string) => {
    navigator.clipboard.writeText(msg);
  };

  // --- Main Render ---
  return (
    <div
      style={{
        background: `linear-gradient(120deg, #181c24 60%, #23283a 100%)`,
        minHeight: "100vh",
        padding: 40,
      }}
    >
      <h2
        style={{
          fontWeight: 900,
          fontSize: 32,
          marginBottom: 24,
          color: theme.text,
          letterSpacing: 1.2,
          textShadow: "0 2px 12px #00b4fc33",
        }}
      >
        Notifications
      </h2>
      {renderAnalyticsBar()}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <button
          style={{
            background: viewMode === "table" ? theme.accent : theme.chipBg,
            color: viewMode === "table" ? "#fff" : theme.textSecondary,
            border: `1.5px solid ${theme.accent}`,
            borderRadius: 8,
            padding: "8px 22px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow:
              viewMode === "table" ? `0 2px 8px ${theme.accent}33` : undefined,
            fontSize: 16,
            letterSpacing: 0.5,
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={() => setViewMode("table")}
        >
          <FiList style={{ marginRight: 8 }} /> Table
        </button>
        <button
          style={{
            background: viewMode === "timeline" ? theme.accent : theme.chipBg,
            color: viewMode === "timeline" ? "#fff" : theme.textSecondary,
            border: `1.5px solid ${theme.accent}`,
            borderRadius: 8,
            padding: "8px 22px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow:
              viewMode === "timeline"
                ? `0 2px 8px ${theme.accent}33`
                : undefined,
            fontSize: 16,
            letterSpacing: 0.5,
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={() => setViewMode("timeline")}
        >
          <FiClock style={{ marginRight: 8 }} /> Timeline
        </button>
        <button
          style={{
            background: theme.chipBg,
            color: theme.textSecondary,
            border: `1.5px solid ${theme.accent}`,
            borderRadius: 8,
            padding: "8px 22px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 16,
            marginLeft: "auto",
          }}
          onClick={() => exportNotifications("csv")}
        >
          Export CSV
        </button>
        <button
          style={{
            background: theme.chipBg,
            color: theme.textSecondary,
            border: `1.5px solid ${theme.accent}`,
            borderRadius: 8,
            padding: "8px 22px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 16,
          }}
          onClick={() => exportNotifications("json")}
        >
          Export JSON
        </button>
      </div>
      {renderPreferencesModal()}
      {renderAdvancedFilters()}
      {viewMode === "table" ? renderTable() : renderTimeline()}
      {/* Animation keyframes style for SSR */}
      <style>{keyframes}</style>
    </div>
  );
};

export default NotificationsTab;
