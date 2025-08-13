import React from "react";
import { useRBAC } from "../hooks/useRBAC";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface AuditLog {
  id: number;
  user: string;
  entity_type: string;
  entity_id: number;
  action: string;
  performed_by: string;
  note?: string;
  timestamp: string;
}

const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const { data } = await axios.get("/audits?limit=100");
  return data;
};

const AuditLogViewer: React.FC = () => {
  const { can, user } = useRBAC();
  const {
    data: logs,
    isLoading,
    error,
  } = useQuery<AuditLog[]>({
    queryKey: ["rbac", "audit-logs"],
    queryFn: fetchAuditLogs,
  });

  if (!can("manage", "rbac")) {
    return (
      <div>Access Denied: You do not have permission to view audit logs.</div>
    );
  }
  if (isLoading) return <div>Loading audit logs...</div>;
  if (error) return <div>Failed to load audit logs.</div>;

  // Placeholder for audit log viewer UI
  return (
    <div>
      <h2>Audit Log Viewer (RBAC Admin Only)</h2>
      <p>Welcome, {user?.email}</p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Entity Type</th>
            <th>Entity ID</th>
            <th>Action</th>
            <th>Performed By</th>
            <th>Note</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs?.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.user}</td>
              <td>{log.entity_type}</td>
              <td>{log.entity_id}</td>
              <td>{log.action}</td>
              <td>{log.performed_by}</td>
              <td>{log.note}</td>
              <td>{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogViewer;
