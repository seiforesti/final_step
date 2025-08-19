import React, { useState } from "react";
import { useRBAC } from "../hooks/useRBAC";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Tag,
  Space,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

interface Role {
  id: number;
  name: string;
  permissions: [string, string][];
}

interface Permission {
  id: number;
  action: string;
  resource: string;
}

const fetchRoles = async (): Promise<Role[]> => {
  const { data } = await axios.get("/sensitivity-labels/rbac/roles");
  return data;
};
const fetchPermissions = async (): Promise<Permission[]> => {
  const { data } = await axios.get("/sensitivity-labels/rbac/permissions");
  return data;
};
const createRole = async (name: string) => {
  const { data } = await axios.post("/sensitivity-labels/rbac/roles", { name });
  return data;
};
const deleteRole = async (roleId: number) => {
  await axios.delete(`/sensitivity-labels/rbac/roles/${roleId}`);
};
const assignPermission = async ({
  roleId,
  permissionId,
}: {
  roleId: number;
  permissionId: number;
}) => {
  await axios.post("/sensitivity-labels/rbac/assign-permission", {
    role_id: roleId,
    permission_id: permissionId,
  });
};
const removePermission = async ({
  roleId,
  permissionId,
}: {
  roleId: number;
  permissionId: number;
}) => {
  await axios.post("/sensitivity-labels/rbac/remove-permission", {
    role_id: roleId,
    permission_id: permissionId,
  });
};
const updateRole = async ({ id, name }: { id: number; name: string }) => {
  const { data } = await axios.put(`/sensitivity-labels/rbac/roles/${id}`, {
    name,
  });
  return data;
};
const fetchUsers = async (): Promise<
  { id: number; email: string; roles: string[] }[]
> => {
  const { data } = await axios.get("/sensitivity-labels/users");
  return data;
};

const RoleManagement: React.FC = () => {
  const { can } = useRBAC();
  const queryClient = useQueryClient();
  const {
    data: roles,
    isLoading,
    error,
  } = useQuery<Role[]>({
    queryKey: ["rbac", "roles"],
    queryFn: fetchRoles,
  });
  const { data: permissions } = useQuery<Permission[]>({
    queryKey: ["rbac", "permissions"],
    queryFn: fetchPermissions,
  });
  const { data: users } = useQuery<
    { id: number; email: string; roles: string[] }[]
  >({
    queryKey: ["rbac", "users"],
    queryFn: fetchUsers,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<number | null>(
    null
  );
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roleUsers, setRoleUsers] = useState<{ id: number; email: string }[]>(
    []
  );
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      setModalOpen(false);
      form.resetFields();
      message.success("Role created");
    },
    onError: () => message.error("Failed to create role"),
  });
  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      message.success("Role deleted");
    },
    onError: () => message.error("Failed to delete role"),
  });
  const assignPermissionMutation = useMutation({
    mutationFn: assignPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      setSelectedPermission(null);
      message.success("Permission assigned");
    },
    onError: () => message.error("Failed to assign permission"),
  });
  const removePermissionMutation = useMutation({
    mutationFn: removePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      message.success("Permission removed");
    },
    onError: () => message.error("Failed to remove permission"),
  });
  const updateRoleMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      setEditModalOpen(false);
      editForm.resetFields();
      message.success("Role updated");
    },
    onError: () => message.error("Failed to update role"),
  });

  if (!can("manage", "rbac")) {
    return (
      <div>Access Denied: You do not have permission to manage roles.</div>
    );
  }
  if (isLoading) return <div>Loading roles...</div>;
  if (error) return <div>Failed to load roles.</div>;

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: Role) => (
        <Space>
          <span>{record.name}</span>
        </Space>
      ),
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (perms: [string, string][], record: Role) => (
        <Space wrap>
          {perms.map(([action, resource]) => {
            const perm = permissions?.find(
              (p) => p.action === action && p.resource === resource
            );
            return (
              <Tag
                color="geekblue"
                key={action + resource}
                icon={<KeyOutlined />}
              >
                {action}:{resource}
                {perm && (
                  <Button
                    size="small"
                    type="link"
                    icon={<CloseOutlined />}
                    onClick={() =>
                      removePermissionMutation.mutate({
                        roleId: record.id,
                        permissionId: perm.id,
                      })
                    }
                  />
                )}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: "Users",
      key: "users",
      render: (_: any, record: Role) => {
        const usersWithRole = (users || []).filter((u) =>
          u.roles.includes(record.name)
        );
        return (
          <Button
            size="small"
            onClick={() => {
              setRoleUsers(
                usersWithRole.map((u) => ({ id: u.id, email: u.email }))
              );
              setUserModalOpen(true);
            }}
          >
            {usersWithRole.length} user{usersWithRole.length !== 1 ? "s" : ""}
          </Button>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Role) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedRole(record);
              setEditModalOpen(true);
              editForm.setFieldsValue({ name: record.name });
            }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            loading={deleteRoleMutation.isPending}
            onClick={() => deleteRoleMutation.mutate(record.id)}
          >
            Delete
          </Button>
          <Select
            style={{ width: 180 }}
            placeholder="Assign permission..."
            value={
              selectedRole?.id === record.id ? selectedPermission : undefined
            }
            onChange={(val) => setSelectedPermission(val)}
            onClick={() => setSelectedRole(record)}
            options={permissions?.map((p) => ({
              label: `${p.action}:${p.resource}`,
              value: p.id,
            }))}
            allowClear
          />
          <Button
            icon={<PlusOutlined />}
            disabled={!selectedPermission || assignPermissionMutation.isPending}
            onClick={() => {
              if (selectedPermission)
                assignPermissionMutation.mutate({
                  roleId: record.id,
                  permissionId: selectedPermission,
                });
            }}
          >
            Assign
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#fff" }}>
        Role Management
      </Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        New Role
      </Button>
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        pagination={false}
        bordered
        style={{ background: "#1a1a1a", color: "#fff" }}
      />
      <Modal
        title="Create New Role"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={({ name }) => createRoleMutation.mutate(name)}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: "Please enter a role name" }]}
          >
            <Input autoFocus placeholder="Role name" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createRoleMutation.isPending}
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Role"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{ name: selectedRole?.name }}
          onFinish={({ name }) => {
            if (selectedRole)
              updateRoleMutation.mutate({ id: selectedRole.id, name });
          }}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: "Please enter a role name" }]}
          >
            <Input autoFocus placeholder="Role name" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateRoleMutation.isPending}
            >
              Save
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Users with this Role"
        open={userModalOpen}
        onCancel={() => setUserModalOpen(false)}
        footer={null}
      >
        <ul>
          {roleUsers.length === 0 ? (
            <li>No users have this role.</li>
          ) : (
            roleUsers.map((u) => (
              <li key={u.id}>
                {u.email} (ID: {u.id})
              </li>
            ))
          )}
        </ul>
      </Modal>
    </div>
  );
};

export default RoleManagement;
