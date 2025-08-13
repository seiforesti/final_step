import React, { useState } from "react";
import { Layout, Menu, Button, Typography, ConfigProvider, theme } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  KeyOutlined,
  SafetyOutlined,
  FileSearchOutlined,
  AppstoreOutlined,
  PlusOutlined,
  SettingOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
// import "antd/dist/antd.dark.css"; // Removed: not available in antd v5+ or with Vite
import RBACSystemRouter, { RBACSection } from "./RBACSystemRouter";
import RoleHierarchyTree from "./RoleHierarchyTree";
import { PendingRequestsNotifier } from "../../components/rbac";
import { useSharedWebSocket } from "../../hooks/useSharedWebSocket";

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
  {
    key: "permissions",
    icon: <KeyOutlined />,
    label: "Permissions",
  },
  {
    key: "conditions",
    icon: <FileSearchOutlined />,
    label: "Conditions",
  },
  {
    key: "resource-assignments",
    icon: <AppstoreOutlined />,
    label: "Resource Assignments",
  },
  {
    key: "role-hierarchy",
    icon: <AppstoreOutlined />,
    label: "Role Hierarchy",
  },
  {
    key: "access-requests",
    icon: <KeyOutlined />,
    label: "Access Requests",
  },
  {
    key: "resource-tree",
    icon: <ApartmentOutlined />,
    label: "Resource Tree",
  },
];

// Vite uses import.meta.env for environment variables
const RBAC_WS_URL =
  import.meta.env.VITE_WS_URL || "ws://localhost:8000/sensitivity-labels/ws";

const RBACAdminDashboard: React.FC = () => {
  const [section, setSection] = useState<RBACSection>("check-access");
  const { lastMessage } = useSharedWebSocket(RBAC_WS_URL);

  // Real-time RBAC event handler
  React.useEffect(() => {
    if (lastMessage && lastMessage.type === "rbac_event") {
      // TODO: trigger refetch or update of RBAC data (roles, permissions, etc.)
      // Example: queryClient.invalidateQueries(["roles"]);
      // You can also show a notification if desired
      // notification.info({ message: `RBAC event: ${lastMessage.event}` });
      window.dispatchEvent(
        new CustomEvent("rbac-realtime-update", { detail: lastMessage })
      );
    }
  }, [lastMessage]);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
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
            selectedKeys={[section]}
            style={{ background: "#23272f", fontSize: 16 }}
            items={menuItems}
            onClick={({ key }) => setSection(key as RBACSection)}
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
            <div
              style={{ marginRight: 24, display: "flex", alignItems: "center" }}
            >
              <PendingRequestsNotifier
                onClick={() => setSection("access-requests")}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ marginLeft: 8 }}
              >
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
            <RBACSystemRouter section={section} />
            {/* <RoleHierarchyTree /> */}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default RBACAdminDashboard;
