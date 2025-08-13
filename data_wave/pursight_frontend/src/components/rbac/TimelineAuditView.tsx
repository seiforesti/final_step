import React from "react";
import { Timeline, Card, Tag, Typography, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import type { AuditLog } from "../../api/rbac";

const { Text } = Typography;

const TimelineAuditView: React.FC<{
  logs: AuditLog[];
  onDrilldown?: (log: AuditLog) => void;
}> = ({ logs, onDrilldown }) => {
  const items = logs.map((log) => ({
    key: String(log.id),
    dot: <ClockCircleOutlined style={{ fontSize: "16px" }} />,
    color:
      log.status === "success"
        ? "green"
        : log.status === "error"
        ? "red"
        : "blue",
    label: (
      <Text type="secondary">{new Date(log.timestamp).toLocaleString()}</Text>
    ),
    children: (
      <Card size="small" style={{ marginBottom: 8 }}>
        <b>{log.action}</b> by <Tag color="geekblue">{log.performed_by}</Tag>
        {log.status && (
          <Tag
            color={
              log.status === "success"
                ? "green"
                : log.status === "error"
                ? "red"
                : "blue"
            }
          >
            {log.status}
          </Tag>
        )}
        <div style={{ marginTop: 4 }}>
          <Text type="secondary">{log.note}</Text>
        </div>
        {onDrilldown && (
          <Button
            size="small"
            style={{ marginTop: 8 }}
            onClick={() => onDrilldown(log)}
          >
            View Diff
          </Button>
        )}
      </Card>
    ),
  }));
  return <Timeline mode="left" items={items} />;
};

export default TimelineAuditView;
