import React from "react";
import { Layout, Menu, theme } from "antd";
import {
  UserOutlined,
  SafetyOutlined,
  TeamOutlined,
  KeyOutlined,
  ApiOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Sider, Content } = Layout;

const menuItems = [
  {
    key: "dashboard",
    icon: <SafetyOutlined />,
    label: "RBAC Dashboard",
    path: "/rbac-admin/dashboard",
  },
  {
    key: "users",
    icon: <UserOutlined />,
    label: "Users",
    path: "/rbac-admin/users",
  },
  {
    key: "roles",
    icon: <KeyOutlined />,
    label: "Roles",
    path: "/rbac-admin/roles",
  },
  {
    key: "permissions",
    icon: <SafetyOutlined />,
    label: "Permissions",
    path: "/rbac-admin/permissions",
  },
  {
    key: "groups",
    icon: <TeamOutlined />,
    label: "Groups",
    path: "/rbac-admin/groups",
  },
  {
    key: "service-principals",
    icon: <ApiOutlined />,
    label: "Service Principals",
    path: "/rbac-admin/service-principals",
  },
  {
    key: "audit-logs",
    icon: <FileSearchOutlined />,
    label: "Audit Logs",
    path: "/rbac-admin/audit-logs",
  },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Determine selected menu item based on current path
  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.path.replace(/\/$/, "")))?.key || "dashboard";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark" width={220} style={{ background: "#141414" }}>
        <div style={{ height: 48, margin: 16, color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>
          PurSight Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => navigate(item.path),
          }))}
          style={{ fontSize: 16 }}
        />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: 0,
            padding: 0,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          <div style={{ minHeight: "100vh", background: "#181c24", padding: 0 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
