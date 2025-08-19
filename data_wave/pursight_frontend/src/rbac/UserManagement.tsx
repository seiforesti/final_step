import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Select,
  Space,
  Typography,
  message,
  Modal,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CheckOutlined,
  StopOutlined,
  UserAddOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { confirm } = Modal;

interface User {
  id: number;
  email: string;
  roles: string[];
  is_active: boolean;
}
interface Role {
  id: number;
  name: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await axios.get("/sensitivity-labels/users");
  return data;
};
const fetchRoles = async (): Promise<Role[]> => {
  const { data } = await axios.get("/sensitivity-labels/rbac/roles");
  return data;
};
const assignRolesBulk = async (userIds: number[], roleId: number) => {
  await axios.post("/sensitivity-labels/users/bulk-assign-roles", {
    user_ids: userIds,
    role_id: roleId,
  });
};
const removeRole = async (userId: number, roleId: number) => {
  await axios.post(`/sensitivity-labels/users/${userId}/remove-role`, {
    role_id: roleId,
  });
};
const deactivateUser = async (userId: number) => {
  await axios.post(`/sensitivity-labels/users/${userId}/deactivate`);
};
const activateUser = async (userId: number) => {
  await axios.post(`/sensitivity-labels/users/${userId}/activate`);
};
const reactivateUser = async (userId: number) => {
  await axios.post(`/sensitivity-labels/users/${userId}/reactivate`);
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkRole, setBulkRole] = useState<number | null>(null);
  const [assigningBulk, setAssigningBulk] = useState(false);
  const [refresh, setRefresh] = useState(0);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchUsers(), fetchRoles()])
      .then(([users, roles]) => {
        setUsers(users);
        setRoles(roles);
      })
      .finally(() => setLoading(false));
  }, [refresh]);

  const handleAssignBulk = async () => {
    if (!bulkRole || selectedRowKeys.length === 0) return;
    setAssigningBulk(true);
    try {
      await assignRolesBulk(selectedRowKeys as number[], bulkRole);
      message.success("Role assigned to selected users");
      setRefresh((r) => r + 1);
      setSelectedRowKeys([]);
      setBulkRole(null);
    } catch {
      message.error("Failed to assign role");
    } finally {
      setAssigningBulk(false);
    }
  };

  const handleRemoveRole = async (userId: number, roleId: number) => {
    confirm({
      title: "Remove Role",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to remove this role from the user?",
      onOk: async () => {
        try {
          await removeRole(userId, roleId);
          message.success("Role removed");
          setRefresh((r) => r + 1);
        } catch {
          message.error("Failed to remove role");
        }
      },
    });
  };

  const handleDeactivate = async (userId: number) => {
    try {
      await deactivateUser(userId);
      message.success("User deactivated");
      setRefresh((r) => r + 1);
    } catch {
      message.error("Failed to deactivate user");
    }
  };
  const handleActivate = async (userId: number) => {
    try {
      await activateUser(userId);
      message.success("User activated");
      setRefresh((r) => r + 1);
    } catch {
      message.error("Failed to activate user");
    }
  };
  const handleReactivate = async (userId: number) => {
    try {
      await reactivateUser(userId);
      message.success("User reactivated");
      setRefresh((r) => r + 1);
    } catch {
      message.error("Failed to reactivate user");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <span style={{ color: "#fff" }}>{email}</span>,
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roleNames: string[], record: User) => (
        <Space wrap>
          {roleNames.map((roleName) => {
            const roleObj = roles.find((r) => r.name === roleName);
            return (
              <Tag color="geekblue" key={roleName}>
                {roleName}
                {roleObj && (
                  <Button
                    size="small"
                    type="link"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveRole(record.id, roleObj.id)}
                  />
                )}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active: boolean, record: User) =>
        is_active ? (
          <Button
            icon={<StopOutlined />}
            danger
            onClick={() => handleDeactivate(record.id)}
          >
            Deactivate
          </Button>
        ) : (
          <Space>
            <Button
              icon={<CheckOutlined />}
              type="primary"
              onClick={() => handleActivate(record.id)}
            >
              Activate
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => handleReactivate(record.id)}
            >
              Reactivate
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#fff" }}>
        User Management (RBAC Admin)
      </Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Bulk assign role..."
          value={bulkRole ?? undefined}
          onChange={setBulkRole}
          options={roles.map((r) => ({ label: r.name, value: r.id }))}
          allowClear
        />
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          disabled={!bulkRole || selectedRowKeys.length === 0}
          loading={assigningBulk}
          onClick={handleAssignBulk}
        >
          Assign to Selected
        </Button>
      </Space>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
        style={{ background: "#1a1a1a", color: "#fff" }}
      />
    </div>
  );
};

export default UserManagement;
