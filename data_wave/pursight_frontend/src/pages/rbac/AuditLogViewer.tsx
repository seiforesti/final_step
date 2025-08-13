import React from "react";
import { useRBAC } from "../../hooks/useRBAC";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Table, Typography } from "antd";

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
  const { canViewAuditLogs } = useRBAC();
  const { data: logs, isLoading, error } = useQuery<AuditLog[]>({ queryKey: ["rbac", "audit-logs"], queryFn: fetchAuditLogs });

  if (!canViewAuditLogs()) {
    return <div>Access Denied: You do not have permission to view audit logs.</div>;
  }
  if (isLoading) return <div>Loading audit logs...</div>;
  if (error) return <div>Failed to load audit logs.</div>;

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "User", dataIndex: "user", key: "user" },
    { title: "Entity Type", dataIndex: "entity_type", key: "entity_type" },
    { title: "Entity ID", dataIndex: "entity_id", key: "entity_id" },
    { title: "Action", dataIndex: "action", key: "action" },
    { title: "Performed By", dataIndex: "performed_by", key: "performed_by" },
    { title: "Note", dataIndex: "note", key: "note" },
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3} style={{ color: '#fff' }}>Audit Log Viewer (RBAC Admin Only)</Typography.Title>
      <Table columns={columns} dataSource={logs} rowKey="id" bordered style={{ background: '#1a1a1a', color: '#fff' }} />
    </div>
  );
};

export default AuditLogViewer;
