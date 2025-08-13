import React from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  List,
  Button,
  Space,
} from "antd";
import {
  UserOutlined,
  KeyOutlined,
  SafetyOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const fetchUsers = async () =>
  (await axios.get("/sensitivity-labels/users")).data;
const fetchRoles = async () =>
  (await axios.get("/sensitivity-labels/rbac/roles")).data;
const fetchPermissions = async () =>
  (await axios.get("/sensitivity-labels/rbac/permissions")).data;
const fetchAuditLogs = async () => (await axios.get("/audits?limit=5")).data;

const RBACDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["rbac", "users"],
    queryFn: fetchUsers,
  });
  const { data: roles, isLoading: loadingRoles } = useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: fetchRoles,
  });
  const { data: permissions, isLoading: loadingPerms } = useQuery({
    queryKey: ["rbac", "permissions"],
    queryFn: fetchPermissions,
  });
  const { data: auditLogs, isLoading: loadingAudit } = useQuery({
    queryKey: ["rbac", "audit-logs-dashboard"],
    queryFn: fetchAuditLogs,
  });

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#fff" }}>
        RBAC Admin Dashboard
      </Title>
      <Row gutter={24} style={{ marginBottom: 32 }}>
        <Col span={6}>
          <Card variant="outlined" style={{ background: "#23272f" }}>
            <Statistic
              title="Users"
              value={users?.length ?? 0}
              prefix={<UserOutlined />}
              loading={loadingUsers}
              valueStyle={{ color: "#fff" }}
            />
            <Button type="link" onClick={() => navigate("/rbac-admin/users")}>
              Manage Users
            </Button>
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="outlined" style={{ background: "#23272f" }}>
            <Statistic
              title="Roles"
              value={roles?.length ?? 0}
              prefix={<KeyOutlined />}
              loading={loadingRoles}
              valueStyle={{ color: "#fff" }}
            />
            <Button type="link" onClick={() => navigate("/rbac-admin/roles")}>
              Manage Roles
            </Button>
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="outlined" style={{ background: "#23272f" }}>
            <Statistic
              title="Permissions"
              value={permissions?.length ?? 0}
              prefix={<SafetyOutlined />}
              loading={loadingPerms}
              valueStyle={{ color: "#fff" }}
            />
            <Button
              type="link"
              onClick={() => navigate("/rbac-admin/permissions")}
            >
              Manage Permissions
            </Button>
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="outlined" style={{ background: "#23272f" }}>
            <Statistic
              title="Audit Logs"
              value={auditLogs?.length ?? 0}
              prefix={<FileSearchOutlined />}
              loading={loadingAudit}
              valueStyle={{ color: "#fff" }}
            />
            <Button
              type="link"
              onClick={() => navigate("/rbac-admin/audit-logs")}
            >
              View Audit Logs
            </Button>
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Card
            title="Recent Audit Log Entries"
            variant="outlined"
            style={{ background: "#23272f", color: "#fff" }}
          >
            <List
              loading={loadingAudit}
              dataSource={auditLogs}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical">
                    <span>
                      <b>Action:</b> {item.action}
                    </span>
                    <span>
                      <b>User:</b> {item.performed_by}
                    </span>
                    <span>
                      <b>Entity:</b> {item.entity_type} #{item.entity_id}
                    </span>
                    <span>
                      <b>Time:</b> {item.timestamp}
                    </span>
                    {item.note && (
                      <span>
                        <b>Note:</b> {item.note}
                      </span>
                    )}
                  </Space>
                </List.Item>
              )}
              locale={{ emptyText: "No recent audit log entries." }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="Quick Actions"
            variant="outlined"
            style={{ background: "#23272f", color: "#fff" }}
          >
            <Button
              type="primary"
              block
              style={{ marginBottom: 12 }}
              onClick={() => navigate("/rbac-admin/users")}
            >
              Go to User Management
            </Button>
            <Button
              type="primary"
              block
              style={{ marginBottom: 12 }}
              onClick={() => navigate("/rbac-admin/roles")}
            >
              Go to Role Management
            </Button>
            <Button
              type="primary"
              block
              style={{ marginBottom: 12 }}
              onClick={() => navigate("/rbac-admin/permissions")}
            >
              Go to Permission Management
            </Button>
            <Button
              type="primary"
              block
              style={{ marginBottom: 12 }}
              onClick={() => navigate("/rbac-admin/groups")}
            >
              Go to Group Management
            </Button>
            <Button
              type="primary"
              block
              style={{ marginBottom: 12 }}
              onClick={() => navigate("/rbac-admin/service-principals")}
            >
              Go to Service Principals
            </Button>
            <Button
              type="primary"
              block
              onClick={() => navigate("/rbac-admin/audit-logs")}
            >
              Go to Audit Logs
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RBACDashboard;
