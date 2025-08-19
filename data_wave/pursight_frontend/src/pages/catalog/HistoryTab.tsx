import React, { useState, useEffect } from "react";
import { useTableHistory } from "../../api/catalog";
import { HistoryEntry, TableHistoryData } from "../../models/TableHistory";
import { format, parseISO, subDays } from "date-fns";
import { FiFilter, FiCalendar, FiUser, FiSearch, FiInfo, FiEdit, FiTrash2, FiLock, FiDatabase, FiEye } from "react-icons/fi";

const theme = {
  bg: "#f7f7f8",
  card: "#fff",
  border: "#e0e0e0",
  accent: "#0072e5",
  text: "#222",
  textSecondary: "#666",
  shadow: "0 2px 12px #0001",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
  info: "#2196f3",
  hover: "#f5f5f5",
  lightBorder: "#f0f0f0",
};

interface HistoryTabProps {
  path?: string[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({ path = ["demo", "schema", "table"] }) => {
  // State for filters
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [userFilter, setUserFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Fetch history data
  const { data: historyData, isLoading, isError } = useTableHistory(path);

  // Function to render action badge with appropriate color and icon
  const renderActionBadge = (entry: HistoryEntry) => {
    let color = theme.info;
    let Icon = FiInfo;
    
    switch (entry.actionType) {
      case 'create':
        color = theme.success;
        Icon = FiDatabase;
        break;
      case 'update':
        color = theme.accent;
        Icon = FiEdit;
        break;
      case 'delete':
        color = theme.error;
        Icon = FiTrash2;
        break;
      case 'access':
        color = theme.info;
        Icon = FiEye;
        break;
      case 'permission_change':
        color = theme.warning;
        Icon = FiLock;
        break;
      case 'schema_change':
        color = theme.accent;
        Icon = FiDatabase;
        break;
      default:
        color = theme.info;
        Icon = FiInfo;
    }
    
    return (
      <span style={{
        backgroundColor: color + '15', // 15% opacity
        color: color,
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <Icon size={12} />
        {entry.action}
      </span>
    );
  };

  // Function to render avatar or initials
  const renderAvatar = (entry: HistoryEntry) => {
    const { user, avatarUrl } = entry;
    
    if (avatarUrl) {
      return (
        <img 
          src={avatarUrl} 
          alt={user} 
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
          }}
        />
      );
    }
    
    // Generate initials from user name
    const initials = user
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    // Generate a consistent color based on the user name
    const colors = [
      '#4285F4', // Google Blue
      '#EA4335', // Google Red
      '#FBBC05', // Google Yellow
      '#34A853', // Google Green
      '#FF6D01', // Orange
      '#46BDC6', // Teal
      '#7C4DFF', // Purple
      '#536DFE', // Indigo
    ];
    
    const colorIndex = user.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return (
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: 600,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow,
      }}>
        {initials}
      </div>
    );
  };

  // Filter entries based on user selections
  const getFilteredEntries = () => {
    if (!historyData || !historyData.entries) return [];
    
    let filtered = [...historyData.entries];
    
    // Apply time range filter
    if (timeRange) {
      const now = new Date();
      let cutoffDate;
      
      switch (timeRange) {
        case '24h':
          cutoffDate = subDays(now, 1);
          break;
        case '7days':
          cutoffDate = subDays(now, 7);
          break;
        case '30days':
          cutoffDate = subDays(now, 30);
          break;
        case '90days':
          cutoffDate = subDays(now, 90);
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate) {
        filtered = filtered.filter(entry => new Date(entry.timestamp) >= cutoffDate);
      }
    }
    
    // Apply user filter
    if (userFilter) {
      filtered = filtered.filter(entry => 
        entry.user.toLowerCase().includes(userFilter.toLowerCase()) ||
        (entry.userEmail && entry.userEmail.toLowerCase().includes(userFilter.toLowerCase()))
      );
    }
    
    // Apply action type filter
    if (actionFilter) {
      filtered = filtered.filter(entry => entry.actionType === actionFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.action.toLowerCase().includes(query) ||
        entry.user.toLowerCase().includes(query) ||
        (entry.details?.description && entry.details.description.toLowerCase().includes(query)) ||
        (entry.affectedColumns && entry.affectedColumns.some(col => col.toLowerCase().includes(query)))
      );
    }
    
    return filtered;
  };
  
  // Render filter controls
  const renderFilters = () => {
    return (
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {/* Time range filter */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          padding: '4px 8px',
          minWidth: '120px',
        }}>
          <FiCalendar style={{ marginRight: '8px', color: theme.accent }} />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              color: theme.text,
              padding: '4px',
              outline: 'none',
            }}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
        
        {/* Action type filter */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          padding: '4px 8px',
          minWidth: '120px',
        }}>
          <FiFilter style={{ marginRight: '8px', color: theme.accent }} />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              color: theme.text,
              padding: '4px',
              outline: 'none',
            }}
          >
            <option value="">All actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="access">Access</option>
            <option value="schema_change">Schema change</option>
            <option value="permission_change">Permission change</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* User filter */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          padding: '4px 8px',
          flex: 1,
          minWidth: '200px',
        }}>
          <FiUser style={{ marginRight: '8px', color: theme.accent }} />
          <input
            type="text"
            placeholder="Filter by user"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              color: theme.text,
              padding: '4px',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
        
        {/* Search */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px',
          padding: '4px 8px',
          flex: 2,
          minWidth: '250px',
        }}>
          <FiSearch style={{ marginRight: '8px', color: theme.accent }} />
          <input
            type="text"
            placeholder="Search in history"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.85rem',
              color: theme.text,
              padding: '4px',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
      </div>
    );
  };
  
  // Render details for an entry
  const renderEntryDetails = (entry: HistoryEntry) => {
    if (!entry.details) return null;
    
    return (
      <div style={{ 
        marginTop: '12px', 
        padding: '12px',
        backgroundColor: theme.bg,
        borderRadius: '4px',
        fontSize: '0.85rem',
      }}>
        {entry.details.description && (
          <div style={{ marginBottom: '8px' }}>{entry.details.description}</div>
        )}
        
        {entry.affectedColumns && entry.affectedColumns.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Affected columns:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {entry.affectedColumns.map((col, i) => (
                <span key={i} style={{ 
                  backgroundColor: theme.bg, 
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                }}>
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {entry.details.changes && entry.details.changes.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Changes:</div>
            <ul style={{ margin: '0', paddingLeft: '16px' }}>
              {entry.details.changes.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Generate mock data for demonstration if no real data is available
  const getMockHistoryData = (): TableHistoryData => {
    const now = new Date();
    return {
      entries: [
        {
          id: '1',
          user: 'John Doe',
          userEmail: 'john.doe@example.com',
          action: 'Created table',
          actionType: 'create',
          timestamp: subDays(now, 2).toISOString(),
          systemGenerated: false,
          details: {
            description: 'Created table with 5 columns',
          }
        },
        {
          id: '2',
          user: 'Jane Smith',
          userEmail: 'jane.smith@example.com',
          action: 'Added column',
          actionType: 'schema_change',
          timestamp: subDays(now, 1).toISOString(),
          systemGenerated: false,
          affectedColumns: ['customer_id'],
          details: {
            description: 'Added customer_id column',
            changes: ['Added column customer_id of type INT']
          }
        },
        {
          id: '3',
          user: 'System',
          action: 'Updated statistics',
          actionType: 'update',
          timestamp: subDays(now, 0.5).toISOString(),
          systemGenerated: true,
          details: {
            description: 'Updated table statistics',
          }
        },
        {
          id: '4',
          user: 'Alice Johnson',
          userEmail: 'alice.j@example.com',
          action: 'Changed permissions',
          actionType: 'permission_change',
          timestamp: subDays(now, 0.2).toISOString(),
          systemGenerated: false,
          details: {
            description: 'Changed table permissions',
            changes: ['Added READ permission for group Analytics', 'Removed WRITE permission for user bob@example.com']
          }
        },
      ],
      lastUpdated: now.toISOString()
    };
  };
  
  // Use mock data if no real data is available
  const displayData = historyData || getMockHistoryData();
  const filteredEntries = getFilteredEntries();
  
  return (
    <div
      style={{
        minHeight: 520,
        background: theme.bg,
        borderRadius: 14,
        boxShadow: theme.shadow,
        display: "flex",
        flexDirection: "column",
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2
          style={{
            fontSize: "1.35rem",
            fontWeight: 700,
            color: theme.text,
            margin: 0,
          }}
        >
          Table History
        </h2>
        
        <div style={{ fontSize: '0.85rem', color: theme.textSecondary }}>
          Last updated: {displayData.lastUpdated ? format(new Date(displayData.lastUpdated), 'MMM dd, yyyy HH:mm') : 'N/A'}
        </div>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* History Timeline */}
      <div style={{ 
        background: theme.card, 
        borderRadius: 8, 
        padding: 16, 
        boxShadow: theme.shadow,
        flex: 1,
        overflow: 'auto',
      }}>
        {isLoading ? (
          <div style={{ padding: 20, textAlign: 'center', color: theme.textSecondary }}>
            <div style={{ marginBottom: 12 }}>Loading history data...</div>
            <div style={{ width: '100%', height: 4, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: '30%', 
                  height: '100%', 
                  backgroundColor: theme.accent,
                  borderRadius: 2,
                  animation: 'loading 1.5s infinite ease-in-out',
                }}
              />
            </div>
            <style>{`
              @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
              }
            `}</style>
          </div>
        ) : isError ? (
          <div style={{ padding: 20, textAlign: 'center', color: theme.error }}>
            Error loading history data. Please try again.
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: theme.textSecondary }}>
            No history entries found with the current filters
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: 16,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: theme.border,
              zIndex: 1,
            }} />
            
            {/* Timeline entries */}
            {filteredEntries.map((entry, index) => (
              <div 
                key={entry.id || index}
                style={{ 
                  display: 'flex',
                  marginBottom: 24,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Avatar */}
                <div style={{ marginRight: 16 }}>
                  {renderAvatar(entry)}
                </div>
                
                {/* Content */}
                <div style={{
                  flex: 1,
                  backgroundColor: entry.systemGenerated ? `${theme.bg}` : theme.card,
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: theme.shadow,
                  border: `1px solid ${theme.border}`,
                  transition: 'all 0.2s ease',
                  ':hover': {
                    borderColor: theme.accent,
                  }
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      {entry.user}
                      {entry.systemGenerated && (
                        <span style={{ 
                          marginLeft: 8, 
                          fontSize: '0.7rem', 
                          backgroundColor: theme.info + '20',
                          color: theme.info,
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}>
                          SYSTEM
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: theme.textSecondary }}>
                      {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    {renderActionBadge(entry)}
                  </div>
                  
                  {/* Entry details */}
                  {renderEntryDetails(entry)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTab;
