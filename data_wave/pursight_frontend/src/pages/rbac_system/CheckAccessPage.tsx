import React, { useState } from "react";
import {
  Card,
  Button,
  Input,
  Typography,
  Space,
  Table,
  Tag,
  Spin,
  Avatar,
  List,
  Divider,
} from "antd";
import {
  SafetyOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  useUsers,
  useRoleAssignments,
  useResourceRoleAssignments,
} from "../../api/rbac";
import { useRbacMe } from "../../rbac/useRbacMe";

const { Title, Text } = Typography;

const CheckAccessPage: React.FC = () => {
  const { data: me, isLoading: loadingMe } = useRbacMe();
  const { data: users, isLoading: loadingUsers } = useUsers();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const { data: assignments, isLoading: loadingAssignments } =
    useRoleAssignments(selectedUser ? { user_id: selectedUser.id } : undefined);
  const { data: resourceRoles, isLoading: loadingResourceRoles } =
    useResourceRoleAssignments(
      selectedUser ? { user_id: selectedUser.id } : undefined
    );

  // Filter users for search
  const filteredUsers =
    users?.filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Check access
      </Title>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card
          title={
            <span>
              <SafetyOutlined /> My access
            </span>
          }
          variant="outlined"
        >
          {loadingMe ? (
            <Spin />
          ) : (
            me && (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Email:</Text> <Text>{me.email}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Roles:</Text>{" "}
                  {me.roles.length === 0 ? (
                    <Tag>None</Tag>
                  ) : (
                    me.roles.map((r) => (
                      <Tag color="geekblue" key={r}>
                        {r}
                      </Tag>
                    ))
                  )}
                </div>
                <div>
                  <Text strong>Permissions:</Text>{" "}
                  {me.permissions.length === 0 ? (
                    <Tag>None</Tag>
                  ) : (
                    me.permissions.map(([action, resource], i) => (
                      <Tag color="purple" key={i}>
                        {action}:{resource}
                      </Tag>
                    ))
                  )}
                </div>
              </div>
            )
          )}
        </Card>
        <Card
          title={
            <span>
              <SafetyOutlined /> Check access
            </span>
          }
          variant="outlined"
        >
          <Input.Search
            placeholder="Search user by email..."
            enterButton="Check access"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(val) => {
              const found = users?.find(
                (u) => u.email.toLowerCase() === val.toLowerCase()
              );
              setSelectedUser(found || null);
            }}
            style={{ maxWidth: 400, marginBottom: 16 }}
            loading={loadingUsers}
          />
          {search && filteredUsers.length > 0 && (
            <List
              size="small"
              variant="outlined"
              dataSource={filteredUsers}
              renderItem={(item) => (
                <List.Item
                  onClick={() => setSelectedUser(item)}
                  style={{ cursor: "pointer" }}
                >
                  <Avatar
                    icon={<UserOutlined />}
                    size="small"
                    style={{ marginRight: 8 }}
                  />
                  {item.email}
                </List.Item>
              )}
              style={{ maxWidth: 400, marginBottom: 16 }}
            />
          )}
          {selectedUser && (
            <div style={{ marginTop: 16 }}>
              <Divider orientation="left">
                Access for {selectedUser.email}
              </Divider>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Roles:</Text>{" "}
                {selectedUser.roles.length === 0 ? (
                  <Tag>None</Tag>
                ) : (
                  selectedUser.roles.map((r: string) => (
                    <Tag color="geekblue" key={r}>
                      {r}
                    </Tag>
                  ))
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Resource-level Assignments:</Text>
                {loadingResourceRoles ? (
                  <Spin size="small" />
                ) : (
                  <Table
                    dataSource={resourceRoles || []}
                    columns={[
                      { title: "Role", dataIndex: "role_id", key: "role_id" },
                      {
                        title: "Resource Type",
                        dataIndex: "resource_type",
                        key: "resource_type",
                      },
                      {
                        title: "Resource ID",
                        dataIndex: "resource_id",
                        key: "resource_id",
                      },
                      {
                        title: "Assigned At",
                        dataIndex: "assigned_at",
                        key: "assigned_at",
                      },
                    ]}
                    size="small"
                    rowKey="id"
                    pagination={false}
                    style={{
                      background: "#23272f",
                      color: "#fff",
                      marginTop: 8,
                    }}
                  />
                )}
              </div>
              <div>
                <Text strong>Direct Permissions:</Text>
                {/* Optionally, fetch and show direct permissions for this user */}
              </div>
            </div>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default CheckAccessPage;
