import React, { useState, useMemo } from "react";
import {
  Table,
  Typography,
  Input,
  Space,
  Tag,
  Tooltip,
  Button,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ClockCircleOutlined,
  UserOutlined,
  FileSearchOutlined,
  KeyOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useAuditLogsSimple, RbacAuditLog } from "../../api/rbac";

const { Title, Text } = Typography;

const AuditLogsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<RbacAuditLog | null>(null);
  const { data, isLoading } = useAuditLogsSimple({ limit: 100 });

  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];
    if (!search) return data.logs;
    return data.logs.filter(
      (log) =>
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        log.performed_by?.toLowerCase().includes(search.toLowerCase()) ||
        log.target_user?.toLowerCase().includes(search.toLowerCase()) ||
        log.resource_type?.toLowerCase().includes(search.toLowerCase()) ||
        log.resource_id?.toLowerCase().includes(search.toLowerCase()) ||
        log.role?.toLowerCase().includes(search.toLowerCase()) ||
        log.status?.toLowerCase().includes(search.toLowerCase()) ||
        log.note?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const columns: ColumnsType<RbacAuditLog> = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (ts: string) => (
        <span>
          <ClockCircleOutlined /> {new Date(ts).toLocaleString()}
        </span>
      ),
      sorter: (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => <Tag color="geekblue">{action}</Tag>,
    },
    {
      title: "By",
      dataIndex: "performed_by",
      key: "performed_by",
      render: (user: string) => (
        <span>
          <UserOutlined /> {user}
        </span>
      ),
    },
    {
      title: "Target",
      dataIndex: "target_user",
      key: "target_user",
      render: (user?: string) =>
        user ? (
          <span>
            <UserOutlined /> {user}
          </span>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Resource",
      dataIndex: "resource_type",
      key: "resource_type",
      render: (type: string, log) =>
        type ? (
          <span>
            <FileSearchOutlined /> {type} <Text code>{log.resource_id}</Text>
          </span>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role?: string) =>
        role ? (
          <Tag color="purple">
            <KeyOutlined /> {role}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status?: string) =>
        status ? (
          <Tag color={status === "success" ? "success" : "error"}>{status}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note?: string) =>
        note ? (
          <Tooltip title={note}>
            <Text ellipsis style={{ maxWidth: 180, display: "inline-block" }}>
              {note}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Audit Logs
      </Title>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Input.Search
          placeholder="Filter logs by action, user, resource, etc."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={() => {
            const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
              type: "application/json",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "audit-logs.json");
            document.body.appendChild(link);
            link.click();
            link.remove();
          }}
        >
          Export
        </Button>
        <Table
          dataSource={filteredLogs}
          loading={isLoading}
          rowKey="id"
          columns={columns}
          onRow={(record) => ({ onClick: () => setSelectedLog(record) })}
        />
        <Modal
          open={!!selectedLog}
          onCancel={() => setSelectedLog(null)}
          footer={null}
          title="Audit Log Details"
        >
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(selectedLog, null, 2)}
          </pre>
        </Modal>
      </Space>
    </div>
  );
};

export default AuditLogsPage;
