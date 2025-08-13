import React, { useState } from "react";
import { Table, Input, DatePicker, Select, Typography, Space, Tag, Button, Tooltip, Row, Col, message } from "antd";
import { SearchOutlined, UserOutlined, KeyOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { RangePicker } = DatePicker;

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

const fetchAuditLogs = async (params: any): Promise<AuditLog[]> => {
  const { data } = await axios.get("/audits", { params });
  return data;
};

const AuditLogScreen: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<string | undefined>(undefined);
  const [action, setAction] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<any>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchFilters = async () => {
    try {
      const [logs] = await Promise.all([
        fetchAuditLogs({ limit: 100 }),
      ]);
      setUsers(Array.from(new Set(logs.map(l => l.user).filter(Boolean))));
      setActions(Array.from(new Set(logs.map(l => l.action).filter(Boolean))));
    } catch {
      // ignore
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (search) params.q = search;
      if (user) params.user = user;
      if (action) params.action = action;
      if (dateRange && dateRange.length === 2) {
        params.start = dateRange[0].startOf("day").toISOString();
        params.end = dateRange[1].endOf("day").toISOString();
      }
      setLogs(await fetchAuditLogs(params));
    } catch {
      message.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFilters();
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user: string) => user ? (
        <Button
          type="link"
          icon={<UserOutlined />}
          style={{ color: '#40a9ff', padding: 0 }}
          onClick={() => navigate(`/rbac-admin/users?q=${encodeURIComponent(user)}`)}
        >
          {user}
        </Button>
      ) : <span style={{ color: '#888' }}>System</span>,
    },
    {
      title: "Entity Type",
      dataIndex: "entity_type",
      key: "entity_type",
      render: (type: string, record: AuditLog) => (
        <Tag color="purple" style={{ cursor: 'pointer' }} onClick={() => {
          if (type === 'role') navigate(`/rbac-admin/roles?q=${record.entity_id}`);
          if (type === 'user') navigate(`/rbac-admin/users?q=${record.entity_id}`);
        }}>{type}</Tag>
      ),
    },
    {
      title: "Entity ID",
      dataIndex: "entity_id",
      key: "entity_id",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => <Tag color="geekblue">{action}</Tag>,
    },
    {
      title: "Performed By",
      dataIndex: "performed_by",
      key: "performed_by",
      render: (by: string) => by ? (
        <Button
          type="link"
          icon={<UserOutlined />}
          style={{ color: '#40a9ff', padding: 0 }}
          onClick={() => navigate(`/rbac-admin/users?q=${encodeURIComponent(by)}`)}
        >
          {by}
        </Button>
      ) : <span style={{ color: '#888' }}>System</span>,
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note: string) => note || <span style={{ color: '#888' }}>-</span>,
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (ts: string) => dayjs(ts).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#181c24', minHeight: '100vh' }}>
      <Title level={3} style={{ color: '#fff', marginBottom: 24 }}>Audit Logs (RBAC Admin)</Title>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 200, background: '#23272f', color: '#fff', border: 'none' }}
            allowClear
          />
        </Col>
        <Col>
          <Select
            showSearch
            allowClear
            placeholder="Filter by user"
            value={user}
            onChange={setUser}
            style={{ width: 180 }}
            options={users.map(u => ({ label: u, value: u }))}
          />
        </Col>
        <Col>
          <Select
            showSearch
            allowClear
            placeholder="Filter by action"
            value={action}
            onChange={setAction}
            style={{ width: 180 }}
            options={actions.map(a => ({ label: a, value: a }))}
          />
        </Col>
        <Col>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ background: '#23272f', color: '#fff', border: 'none' }}
            allowClear
          />
        </Col>
        <Col>
          <Button type="primary" onClick={handleFilter} style={{ background: '#722ed1', border: 'none' }}>
            Filter
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showSizeChanger: false }}
        bordered
        style={{ background: '#1a1a1a', color: '#fff', borderRadius: 12 }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default AuditLogScreen;
