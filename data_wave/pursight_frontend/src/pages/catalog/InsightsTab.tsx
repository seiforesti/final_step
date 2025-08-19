// Databricks-style Insights Tab (custom design, no libraries)
import React, { useState, useEffect } from "react";
import { FiBarChart2, FiUsers, FiAlertTriangle, FiTrendingUp, FiCheckCircle, FiInfo, FiArrowUp, FiArrowDown, FiMinus } from "react-icons/fi";
import { useTableInsightsData, useTableUsageMetrics } from "../../api/insights";
import { TableInsight, TableUsageMetrics } from "../../models/TableInsights";

const theme = {
  bg: "#f7f7f8",
  card: "#fff",
  border: "#e0e0e0",
  accent: "#0072e5",
  text: "#222",
  textSecondary: "#666",
  shadow: "0 2px 12px #0001",
  success: "#00c853",
  warning: "#ffab00",
  error: "#f44336",
  info: "#2196f3",
  chartBg: "#f5f5f5",
};

interface InsightsTabProps {
  path?: string[];
}

const InsightsTab: React.FC<InsightsTabProps> = ({ path }) => {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "quarter" | "year">("month");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: insightsData, isLoading: insightsLoading, error: insightsError } = useTableInsightsData(path);
  const { data: usageMetrics, isLoading: usageLoading, error: usageError } = useTableUsageMetrics(path, timeRange);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return theme.error;
      case "medium":
        return theme.warning;
      case "low":
        return theme.info;
      default:
        return theme.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "usage":
        return <FiUsers size={18} />;
      case "quality":
        return <FiCheckCircle size={18} />;
      case "security":
        return <FiAlertTriangle size={18} />;
      case "performance":
        return <FiBarChart2 size={18} />;
      default:
        return <FiInfo size={18} />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <FiArrowUp size={14} />;
      case "down":
        return <FiArrowDown size={14} />;
      default:
        return <FiMinus size={14} />;
    }
  };

  const renderInsightCard = (insight: TableInsight) => {
    return (
      <div
        key={insight.id}
        style={{
          background: theme.card,
          borderRadius: 8,
          boxShadow: theme.shadow,
          padding: "16px 20px",
          marginBottom: 16,
          border: `1px solid ${theme.border}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: "100%",
            background: getSeverityColor(insight.severity),
          }}
        />
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `${getSeverityColor(insight.severity)}15`,
              marginRight: 12,
              color: getSeverityColor(insight.severity),
            }}
          >
            {getCategoryIcon(insight.category)}
          </div>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              margin: 0,
              color: theme.text,
            }}
          >
            {insight.title}
          </h3>
          <div
            style={{
              marginLeft: "auto",
              fontSize: "0.75rem",
              color: theme.textSecondary,
            }}
          >
            {new Date(insight.createdAt).toLocaleDateString()}
          </div>
        </div>
        <p
          style={{
            fontSize: "0.875rem",
            color: theme.textSecondary,
            margin: "0 0 12px 0",
          }}
        >
          {insight.description}
        </p>
        {insight.metrics && insight.metrics.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {insight.metrics.map((metric, idx) => (
              <div
                key={idx}
                style={{
                  background: theme.chartBg,
                  borderRadius: 6,
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ marginRight: 8, fontWeight: 500 }}>
                  {metric.name}:
                </span>
                <span style={{ fontWeight: 600 }}>
                  {metric.value}
                  {metric.unit && ` ${metric.unit}`}
                </span>
                {metric.trend && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: 8,
                      color:
                        metric.trend === "up"
                          ? theme.success
                          : metric.trend === "down"
                          ? theme.error
                          : theme.textSecondary,
                    }}
                  >
                    {getTrendIcon(metric.trend)}
                    {metric.changePercent && (
                      <span style={{ marginLeft: 4 }}>
                        {metric.changePercent}%
                      </span>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {insight.recommendations && insight.recommendations.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                margin: "0 0 8px 0",
                color: theme.text,
              }}
            >
              Recommendations
            </h4>
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 20px",
                fontSize: "0.875rem",
                color: theme.textSecondary,
              }}
            >
              {insight.recommendations.map((rec) => (
                <li key={rec.id} style={{ marginBottom: 4 }}>
                  {rec.text}
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: "0.75rem",
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: `${getSeverityColor(rec.impact)}15`,
                      color: getSeverityColor(rec.impact),
                    }}
                  >
                    {rec.impact} impact
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <button
            style={{
              background: "transparent",
              border: "none",
              color: theme.accent,
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              padding: 0,
              marginLeft: 16,
            }}
          >
            Dismiss
          </button>
          {insight.recommendations && insight.recommendations.length > 0 && (
            <button
              style={{
                background: "transparent",
                border: "none",
                color: theme.accent,
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: 0,
                marginLeft: 16,
              }}
            >
              Implement
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderUsageMetrics = (metrics: TableUsageMetrics) => {
    return (
      <div
        style={{
          background: theme.card,
          borderRadius: 8,
          boxShadow: theme.shadow,
          padding: "16px 20px",
          marginBottom: 24,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            margin: "0 0 16px 0",
            color: theme.text,
            display: "flex",
            alignItems: "center",
          }}
        >
          <FiBarChart2
            size={18}
            style={{ marginRight: 8, color: theme.accent }}
          />
          Usage Metrics
          <div style={{ marginLeft: "auto" }}>
            <select
              value={timeRange}
              onChange={(e) =>
                setTimeRange(e.target.value as "day" | "week" | "month" | "quarter" | "year")
              }
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                fontSize: "0.875rem",
              }}
            >
              <option value="day">Last 24 hours</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last 365 days</option>
            </select>
          </div>
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 120,
              background: theme.chartBg,
              borderRadius: 8,
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: theme.textSecondary,
                marginBottom: 4,
              }}
            >
              Total Queries
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: theme.text,
              }}
            >
              {metrics.totalQueries.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 120,
              background: theme.chartBg,
              borderRadius: 8,
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: theme.textSecondary,
                marginBottom: 4,
              }}
            >
              Unique Users
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: theme.text,
              }}
            >
              {metrics.uniqueUsers.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 120,
              background: theme.chartBg,
              borderRadius: 8,
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: theme.textSecondary,
                marginBottom: 4,
              }}
            >
              Avg. Queries/Day
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: theme.text,
              }}
            >
              {metrics.avgQueriesPerDay.toLocaleString(undefined, {
                maximumFractionDigits: 1,
              })}
            </div>
          </div>
        </div>
        <div style={{ height: 200, background: theme.chartBg, borderRadius: 8, padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: theme.textSecondary, fontSize: "0.875rem" }}>Query Trend Chart (Visualization Placeholder)</div>
        </div>
        <div style={{ display: "flex", marginTop: 20, gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 8px 0" }}>Top Users</h4>
            <div style={{ fontSize: "0.875rem" }}>
              {metrics.topUsers.slice(0, 5).map((user, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>{user.userName}</span>
                  <span style={{ fontWeight: 500 }}>{user.queryCount}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 8px 0" }}>Popular Joins</h4>
            <div style={{ fontSize: "0.875rem" }}>
              {metrics.popularJoins.slice(0, 5).map((join, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>{join.tableName}</span>
                  <span style={{ fontWeight: 500 }}>{join.joinCount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryFilter = () => {
    const categories = [
      { id: "all", label: "All Insights", icon: <FiInfo size={16} /> },
      { id: "usage", label: "Usage", icon: <FiUsers size={16} /> },
      { id: "quality", label: "Quality", icon: <FiCheckCircle size={16} /> },
      { id: "security", label: "Security", icon: <FiAlertTriangle size={16} /> },
      { id: "performance", label: "Performance", icon: <FiBarChart2 size={16} /> },
    ];

    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          overflowX: "auto",
          padding: "4px 0",
        }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() =>
              setSelectedCategory(
                category.id === "all" ? null : category.id
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background:
                (category.id === "all" && selectedCategory === null) ||
                category.id === selectedCategory
                  ? theme.accent
                  : theme.bg,
              color:
                (category.id === "all" && selectedCategory === null) ||
                category.id === selectedCategory
                  ? "white"
                  : theme.text,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ marginRight: 6 }}>{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (insightsLoading || usageLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <div style={{ color: theme.textSecondary }}>Loading insights...</div>
        </div>
      );
    }

    if (insightsError || usageError) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <div style={{ color: theme.error }}>
            Error loading insights. Please try again.
          </div>
        </div>
      );
    }

    if (!insightsData || !usageMetrics) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <div style={{ color: theme.textSecondary }}>
            No insights available for this table.
          </div>
        </div>
      );
    }

    // For demo purposes, create mock data if real data is empty
    const mockInsights: TableInsight[] = [
      {
        id: "ins-1",
        title: "High query volume detected",
        description: "This table has seen a 35% increase in query volume over the past week, which may impact performance.",
        category: "performance",
        severity: "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: [
          { name: "Queries", value: 1250, unit: "", trend: "up", changePercent: 35 },
          { name: "Avg Duration", value: 1.8, unit: "s", trend: "up", changePercent: 15 },
        ],
        recommendations: [
          { id: "rec-1", text: "Consider adding an index on frequently queried columns", impact: "high", effort: "medium" },
          { id: "rec-2", text: "Monitor query patterns to identify optimization opportunities", impact: "medium", effort: "low" },
        ],
      },
      {
        id: "ins-2",
        title: "Sensitive data detected",
        description: "This table contains columns that may have personally identifiable information (PII) without proper labeling.",
        category: "security",
        severity: "high",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        recommendations: [
          { id: "rec-3", text: "Apply sensitivity labels to columns containing PII", impact: "high", effort: "low" },
          { id: "rec-4", text: "Review access permissions for this table", impact: "high", effort: "medium" },
        ],
      },
      {
        id: "ins-3",
        title: "Data quality issues found",
        description: "Several columns in this table have null values or inconsistent formats that may affect analysis.",
        category: "quality",
        severity: "medium",
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        metrics: [
          { name: "Null Rate", value: 8.5, unit: "%", trend: "up", changePercent: 3 },
          { name: "Format Issues", value: 42, unit: "rows" },
        ],
        recommendations: [
          { id: "rec-5", text: "Implement data validation rules in ETL process", impact: "medium", effort: "medium" },
          { id: "rec-6", text: "Set up data quality monitoring alerts", impact: "medium", effort: "low" },
        ],
      },
    ];

    const mockUsageMetrics: TableUsageMetrics = {
      totalQueries: 4328,
      uniqueUsers: 78,
      avgQueriesPerDay: 144.3,
      queryTrend: Array(30).fill(0).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 200) + 50,
      })),
      topUsers: [
        { userId: "u1", userName: "data_analyst_1", queryCount: 412 },
        { userId: "u2", userName: "data_scientist_3", queryCount: 289 },
        { userId: "u3", userName: "bi_developer_2", queryCount: 201 },
        { userId: "u4", userName: "ml_engineer_5", queryCount: 187 },
        { userId: "u5", userName: "data_engineer_4", queryCount: 156 },
      ],
      popularJoins: [
        { tableName: "customer_demographics", joinCount: 215 },
        { tableName: "transaction_history", joinCount: 189 },
        { tableName: "product_catalog", joinCount: 142 },
        { tableName: "store_locations", joinCount: 98 },
        { tableName: "marketing_campaigns", joinCount: 76 },
      ],
    };

    // Use mock data for demonstration
    const displayInsights = mockInsights.filter(
      (insight) => !selectedCategory || insight.category === selectedCategory
    );

    return (
      <>
        {renderUsageMetrics(mockUsageMetrics)}
        {renderCategoryFilter()}
        <div style={{ marginBottom: 16 }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              margin: "0 0 16px 0",
              color: theme.text,
            }}
          >
            {selectedCategory
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Insights`
              : "All Insights"}
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 400,
                color: theme.textSecondary,
                marginLeft: 8,
              }}
            >
              ({displayInsights.length})
            </span>
          </h3>
          {displayInsights.length > 0 ? (
            displayInsights.map((insight) => renderInsightCard(insight))
          ) : (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: theme.textSecondary,
                background: theme.chartBg,
                borderRadius: 8,
              }}
            >
              No insights found for the selected category.
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        minHeight: 520,
        background: theme.bg,
        borderRadius: 14,
        boxShadow: theme.shadow,
        padding: 24,
      }}
    >
      <h2
        style={{
          fontSize: "1.35rem",
          fontWeight: 700,
          marginBottom: 24,
          color: theme.text,
          display: "flex",
          alignItems: "center",
        }}
      >
        <FiTrendingUp
          size={20}
          style={{ marginRight: 10, color: theme.accent }}
        />
        Table Insights
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 400,
            color: theme.textSecondary,
            marginLeft: 12,
          }}
        >
          Last updated: {new Date().toLocaleString()}
        </span>
      </h2>
      {renderContent()}
    </div>
  );
};

export default InsightsTab;
