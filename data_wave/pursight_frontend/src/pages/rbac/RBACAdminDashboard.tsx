// This file has been moved to src/pages/rbac_system/RBACAdminDashboard.tsx as part of the new RBAC system implementation. Please use the new file for all future work.

import React from "react";
import { Layout, Menu, Button, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  KeyOutlined,
  SafetyOutlined,
  FileSearchOutlined,
  AppstoreOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.dark.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: "check-access",
    icon: <SafetyOutlined />,
    label: "Check access",
  },
  {
    key: "role-assignments",
    icon: <KeyOutlined />,
    label: "Role assignments",
  },
  {
    key: "roles",
    icon: <AppstoreOutlined />,
    label: "Roles",
  },
  {
    key: "deny-assignments",
    icon: <FileSearchOutlined />,
    label: "Deny assignments",
  },
  {
    key: "users",
    icon: <UserOutlined />,
    label: "Users",
  },
  {
    key: "groups",
    icon: <TeamOutlined />,
    label: "Groups",
  },
  {
    key: "audit-logs",
    icon: <FileSearchOutlined />,
    label: "Audit logs",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "Settings",
  },
];

const RBACAdminDashboard: React.FC = () => {
  // TODO: Add state for selected menu, user info, etc.
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark" width={240} style={{ background: "#23272f" }}>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#181c24",
          }}
        >
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            RBAC Admin
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["check-access"]}
          style={{ background: "#23272f", fontSize: 16 }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              marginLeft: 24,
              fontWeight: 600,
              fontSize: 18,
              color: "#23272f",
            }}
          >
            Access control (RBAC)
          </div>
          <div style={{ marginRight: 24 }}>
            <Button type="primary" icon={<PlusOutlined />}>
              Add
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: 0,
            padding: 32,
            background: "#181c24",
            minHeight: 360,
          }}
        >
          {/* TODO: Render the main content for each RBAC section here */}
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 500 }}>
            Welcome to the RBAC Admin Dashboard
          </div>
          <div style={{ color: "#aaa", marginTop: 12 }}>
            Select a section from the left menu to manage access, roles,
            assignments, and more.
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default RBACAdminDashboard;
