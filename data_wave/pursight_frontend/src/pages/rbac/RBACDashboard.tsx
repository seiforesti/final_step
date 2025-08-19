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
  TeamOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRBAC } from "../../hooks/useRBAC";
import UserList from "./UserList";
import AuditLogViewer from "./AuditLogViewer";
import PermissionConditionHelper from "./PermissionConditionHelper";

const { Title } = Typography;

const fetchUsers = async () =>
  (await axios.get("/sensitivity-labels/users")).data;
const fetchRoles = async () =>
  (await axios.get("/sensitivity-labels/rbac/roles")).data;
const fetchPermissions = async () =>
  (await axios.get("/sensitivity-labels/rbac/permissions")).data;
const fetchGroups = async () =>
  (await axios.get("/sensitivity-labels/rbac/groups")).data;
const fetchServicePrincipals = async () =>
  (await axios.get("/sensitivity-labels/rbac/service-principals")).data;
const fetchAuditLogs = async () => (await axios.get("/audits?limit=5")).data;

const RBACDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, canManageRBAC, canViewAuditLogs } = useRBAC();
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
  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ["rbac", "groups"],
    queryFn: fetchGroups,
  });
  const { data: servicePrincipals, isLoading: loadingSPs } = useQuery({
    queryKey: ["rbac", "service-principals"],
    queryFn: fetchServicePrincipals,
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
      {user && (
        <div style={{ color: "#aaa", marginBottom: 16 }}>
          <b>Logged in as:</b> {user.email}{" "}
          <span style={{ marginLeft: 12 }}>
            <b>Roles:</b> {user.roles?.join(", ")}
          </span>
        </div>
      )}
      <Row gutter={24} style={{ marginBottom: 32 }}>
        {/* Only show cards if user has RBAC management rights */}
        {canManageRBAC() && (
          <>
            <Col span={4}>
              <Card variant="outlined" style={{ background: "#23272f" }}>
                <Statistic
                  title="Users"
                  value={users?.length ?? 0}
                  prefix={<UserOutlined />}
                  loading={loadingUsers}
                  valueStyle={{ color: "#fff" }}
                />
                <Button
                  type="link"
                  onClick={() => navigate("/rbac-admin/users")}
                >
                  Manage Users
                </Button>
              </Card>
            </Col>
            <Col span={4}>
              <Card variant="outlined" style={{ background: "#23272f" }}>
                <Statistic
                  title="Roles"
                  value={roles?.length ?? 0}
                  prefix={<KeyOutlined />}
                  loading={loadingRoles}
                  valueStyle={{ color: "#fff" }}
                />
                <Button
                  type="link"
                  onClick={() => navigate("/rbac-admin/roles")}
                >
                  Manage Roles
                </Button>
              </Card>
            </Col>
            <Col span={4}>
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
            <Col span={4}>
              <Card variant="outlined" style={{ background: "#23272f" }}>
                <Statistic
                  title="Groups"
                  value={groups?.length ?? 0}
                  prefix={<TeamOutlined />}
                  loading={loadingGroups}
                  valueStyle={{ color: "#fff" }}
                />
                <Button
                  type="link"
                  onClick={() => navigate("/rbac-admin/groups")}
                >
                  Manage Groups
                </Button>
              </Card>
            </Col>
            <Col span={4}>
              <Card variant="outlined" style={{ background: "#23272f" }}>
                <Statistic
                  title="Service Principals"
                  value={servicePrincipals?.length ?? 0}
                  prefix={<ApiOutlined />}
                  loading={loadingSPs}
                  valueStyle={{ color: "#fff" }}
                />
                <Button
                  type="link"
                  onClick={() => navigate("/rbac-admin/service-principals")}
                >
                  Manage Service Principals
                </Button>
              </Card>
            </Col>
          </>
        )}
        {/* Audit Logs visible if user can view them */}
        {canViewAuditLogs() && (
          <Col span={4}>
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
        )}
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Card
            title="Recent Audit Log Entries"
            variant="outlined"
            style={{ background: "#23272f", color: "#fff", marginBottom: 24 }}
          >
            <AuditLogViewer />
          </Card>
          <Card
            title="User List (Quick View)"
            variant="outlined"
            style={{ background: "#23272f", color: "#fff", marginTop: 24 }}
          >
            <UserList />
          </Card>
          <Card
            title="Permission Condition Helper"
            variant="outlined"
            style={{ background: "#23272f", color: "#fff", marginTop: 24 }}
          >
            <PermissionConditionHelper value={""} onChange={() => {}} />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="Quick Actions"
            variant="outlined"
            style={{ background: "#23272f", color: "#fff" }}
          >
            {canManageRBAC() && (
              <Button
                type="primary"
                block
                style={{ marginBottom: 12 }}
                onClick={() => navigate("/rbac-admin/users")}
              >
                Go to User Management
              </Button>
            )}
            {canManageRBAC() && (
              <Button
                type="primary"
                block
                style={{ marginBottom: 12 }}
                onClick={() => navigate("/rbac-admin/roles")}
              >
                Go to Role Management
              </Button>
            )}
            {canManageRBAC() && (
              <Button
                type="primary"
                block
                style={{ marginBottom: 12 }}
                onClick={() => navigate("/rbac-admin/permissions")}
              >
                Go to Permission Management
              </Button>
            )}
            {canManageRBAC() && (
              <Button
                type="primary"
                block
                style={{ marginBottom: 12 }}
                onClick={() => navigate("/rbac-admin/groups")}
              >
                Go to Group Management
              </Button>
            )}
            {canManageRBAC() && (
              <Button
                type="primary"
                block
                style={{ marginBottom: 12 }}
                onClick={() => navigate("/rbac-admin/service-principals")}
              >
                Go to Service Principals
              </Button>
            )}
            {canViewAuditLogs() && (
              <Button
                type="primary"
                block
                onClick={() => navigate("/rbac-admin/audit-logs")}
              >
                Go to Audit Logs
              </Button>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RBACDashboard;
