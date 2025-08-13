import React from "react";
import { useLabels } from "../../api/sensitivityLabels";
import { useMLSuggestions } from "../../api/mlSuggestions";
import { useProposals } from "../../api/proposals";
import { useAuditTrail } from "../../api/auditTrail";
import { useNotifications } from "../../api/notifications";
import { useMLFeedback } from "../../api/mlFeedback";

const theme = {
  bg: "#0e1117",
  tableRow: "#16191f",
  tableRowAlt: "#181c24",
  tableBorder: "#232733",
  tableHeader: "#181c24",
  accentSoft: "#5c7cfa22",
  accentText: "#5c7cfa",
  accent: "#007acc", // Add accent for focus ring
};

export interface Column {
  name: string;
  type: string;
  comment: string;
  tags: string;
}

interface ColumnsTabProps {
  columns: Column[];
}

const ColumnsTab: React.FC<ColumnsTabProps> = ({ columns }) => {
  // Example: get path/context from props or context
  const path = ["workspace", "schema", "table"]; // TODO: wire real path
  const { data: labels } = useLabels();
  const { data: mlSuggestions } = useMLSuggestions(path);
  const { data: auditTrail } = useAuditTrail({
    entity_type: "table",
    entity_id: 1, // Use a valid integer ID for testing; replace with real table ID in production
  });
  const { data: notifications } = useNotifications("currentUser");
  const { data: mlFeedback } = useMLFeedback(labels?.[0]?.id?.toString() || "");
  const { data: proposals } = useProposals();

  return (
    <div
      style={{
        background: theme.tableRow,
        borderRadius: 8,
        margin: "0 32px 32px 32px",
        marginTop: 0,
        boxShadow: "0 2px 8px #0002",
        overflow: "hidden",
      }}
    >
      {/* Table filter */}
      <div
        style={{
          padding: "10px 18px 0 18px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: theme.tableRowAlt,
            borderRadius: 6,
            padding: "4px 8px",
            color: "#a0a0a0",
            width: 220,
          }}
        >
          <input
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e0e0e0",
              fontSize: 14,
              width: "100%",
            }}
            placeholder="Filter columns..."
            disabled
          />
        </div>
      </div>
      <div style={{ overflowX: "auto", flex: 1, maxHeight: 420 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "#e0e0e0",
            fontSize: 14,
            minWidth: 700,
            marginTop: 8,
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${theme.tableBorder}`,
                textAlign: "left",
                background: theme.tableHeader,
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <th
                style={{
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                }}
              >
                Column
              </th>
              <th
                style={{
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                }}
              >
                Comment
              </th>
              <th
                style={{
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                }}
              >
                Tags
              </th>
              <th
                style={{
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                  color: theme.accentText,
                }}
              >
                ML Suggestion
              </th>
              <th
                style={{
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                  color: theme.accentText,
                }}
              >
                Proposal
              </th>
              <th
                style={{
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                  color: theme.accentText,
                }}
              >
                Audit
              </th>
              <th
                style={{
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                  color: theme.accentText,
                }}
              >
                Notification
              </th>
              <th
                style={{
                  padding: "12px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 0.2,
                  color: theme.accentText,
                }}
              >
                ML Feedback
              </th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, idx) => (
              <tr
                key={col.name}
                tabIndex={0}
                style={{
                  borderBottom:
                    idx === columns.length - 1
                      ? "none"
                      : `1px solid ${theme.tableBorder}`,
                  background:
                    idx % 2 === 0 ? theme.tableRow : theme.tableRowAlt,
                  transition: "background 0.2s, box-shadow 0.2s",
                  outline: "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#232733")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    idx % 2 === 0 ? theme.tableRow : theme.tableRowAlt)
                }
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.accent}`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <td style={{ padding: "12px 18px", fontWeight: 600 }}>
                  {col.name}
                </td>
                <td style={{ padding: "12px 18px" }}>{col.type}</td>
                <td
                  style={{
                    padding: "12px 18px",
                    color: "#a0a0a0",
                  }}
                >
                  {col.comment || <span style={{ opacity: 0.5 }}>—</span>}
                </td>
                <td style={{ padding: "12px 18px" }}>
                  {col.tags ? (
                    <span
                      style={{
                        background: theme.accentSoft,
                        color: theme.accentText,
                        borderRadius: 4,
                        padding: "2px 8px",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {col.tags}
                    </span>
                  ) : (
                    <span style={{ opacity: 0.5 }}>—</span>
                  )}
                </td>
                {/* ML Suggestion */}
                <td style={{ padding: "12px 18px" }}>
                  {mlSuggestions?.find((s) => s.suggested_label === col.name)
                    ?.suggested_label || (
                    <span style={{ opacity: 0.5 }}>—</span>
                  )}
                </td>
                {/* Proposal */}
                <td style={{ padding: "12px 18px" }}>
                  {proposals?.find((p) => p.object_id === col.name)?.status || (
                    <span style={{ opacity: 0.5 }}>—</span>
                  )}
                </td>
                {/* Audit */}
                <td style={{ padding: "12px 18px" }}>
                  {(auditTrail as any)?.find(
                    (a: any) => a.proposal?.object_id === col.name
                  )?.action || <span style={{ opacity: 0.5 }}>—</span>}
                </td>
                {/* Notification */}
                <td style={{ padding: "12px 18px" }}>
                  {notifications?.find((n) => n.related_object_id === col.name)
                    ?.type || <span style={{ opacity: 0.5 }}>—</span>}
                </td>
                {/* ML Feedback */}
                <td style={{ padding: "12px 18px" }}>
                  {mlFeedback?.find((f) => f.prediction === col.name)
                    ?.feedback || <span style={{ opacity: 0.5 }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div
        style={{
          padding: "8px 18px",
          borderTop: `1px solid ${theme.tableBorder}`,
          color: "#a0a0a0",
          fontSize: 13,
          userSelect: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>{columns.length} columns</div>
        <div>{columns.length} rows</div>
      </div>
    </div>
  );
};

export default ColumnsTab;
