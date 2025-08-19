import React, { useState } from "react";
import { Table, Button, Input, Modal, Form, Select, Tag, Space, Typography, message, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, KeyOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
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
interface User {
  id: number;
  email: string;
  roles: string[];
}

const fetchRoles = async (): Promise<Role[]> => (await axios.get("/sensitivity-labels/rbac/roles")).data;
const fetchPermissions = async (): Promise<Permission[]> => (await axios.get("/sensitivity-labels/rbac/permissions")).data;
const fetchUsers = async (): Promise<User[]> => (await axios.get("/sensitivity-labels/users")).data;
const createRole = async (name: string) => (await axios.post("/sensitivity-labels/rbac/roles", { name })).data;
const deleteRole = async (roleId: number) => axios.delete(`/sensitivity-labels/rbac/roles/${roleId}`);
const assignPermission = async ({ roleId, permissionId }: { roleId: number; permissionId: number }) => axios.post("/sensitivity-labels/rbac/assign-permission", { role_id: roleId, permission_id: permissionId });
const removePermission = async ({ roleId, permissionId }: { roleId: number; permissionId: number }) => axios.post("/sensitivity-labels/rbac/remove-permission", { role_id: roleId, permission_id: permissionId });
const updateRole = async ({ id, name }: { id: number; name: string }) => (await axios.put(`/sensitivity-labels/rbac/roles/${id}`, { name })).data;

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<number | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roleUsers, setRoleUsers] = useState<User[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchRoles(), fetchPermissions(), fetchUsers()])
      .then(([roles, permissions, users]) => {
        setRoles(roles);
        setPermissions(permissions);
        setUsers(users);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateRole = async (values: { name: string }) => {
    try {
      await createRole(values.name);
      message.success("Role created");
      setModalOpen(false);
      form.resetFields();
      setLoading(true);
      setRoles(await fetchRoles());
    } catch {
      message.error("Failed to create role");
    }
  };
  const handleDeleteRole = async (roleId: number) => {
    try {
      await deleteRole(roleId);
      message.success("Role deleted");
      setLoading(true);
      setRoles(await fetchRoles());
    } catch {
      message.error("Failed to delete role");
    }
  };
  const handleAssignPermission = async (roleId: number, permissionId: number) => {
    try {
      await assignPermission({ roleId, permissionId });
      message.success("Permission assigned");
      setLoading(true);
      setRoles(await fetchRoles());
    } catch {
      message.error("Failed to assign permission");
    }
  };
  const handleRemovePermission = async (roleId: number, permissionId: number) => {
    try {
      await removePermission({ roleId, permissionId });
      message.success("Permission removed");
      setLoading(true);
      setRoles(await fetchRoles());
    } catch {
      message.error("Failed to remove permission");
    }
  };
  const handleUpdateRole = async (values: { name: string }) => {
    if (!selectedRole) return;
    try {
      await updateRole({ id: selectedRole.id, name: values.name });
      message.success("Role updated");
      setEditModalOpen(false);
      editForm.resetFields();
      setLoading(true);
      setRoles(await fetchRoles());
    } catch {
      message.error("Failed to update role");
    }
  };

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.permissions.some(([action, resource]) =>
      action.toLowerCase().includes(search.toLowerCase()) ||
      resource.toLowerCase().includes(search.toLowerCase())
    )
  );

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
      render: (name: string) => <span style={{ color: '#fff', fontWeight: 500 }}>{name}</span>,
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (perms: [string, string][], record: Role) => (
        <Space wrap>
          {perms.map(([action, resource]) => {
            const perm = permissions.find(p => p.action === action && p.resource === resource);
            return (
              <Tag color="geekblue" key={action + resource} style={{ fontSize: 14, padding: '2px 8px', borderRadius: 8 }}>
                {action}:{resource}
                {perm && (
                  <Tooltip title="Remove permission">
                    <Button
                      size="small"
                      type="link"
                      icon={<CloseOutlined />}
                      onClick={() => handleRemovePermission(record.id, perm.id)}
                      style={{ color: '#ff7875' }}
                    />
                  </Tooltip>
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
        const usersWithRole = users.filter(u => u.roles.includes(record.name));
        return (
          <Button
            size="small"
            icon={<UserOutlined />}
            onClick={() => {
              setRoleUsers(usersWithRole);
              setUserModalOpen(true);
            }}
            style={{ background: '#23272f', color: '#fff', border: 'none' }}
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
          <Tooltip title="Edit role">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedRole(record);
                setEditModalOpen(true);
                editForm.setFieldsValue({ name: record.name });
              }}
              style={{ background: '#1890ff', color: '#fff', border: 'none' }}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Delete role">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteRole(record.id)}
              style={{ background: '#23272f', color: '#ff7875', border: 'none' }}
            >
              Delete
            </Button>
          </Tooltip>
          <Select
            style={{ width: 180 }}
            placeholder="Assign permission..."
            value={selectedRole?.id === record.id ? selectedPermission : undefined}
            onChange={setSelectedPermission}
            onClick={() => setSelectedRole(record)}
            options={permissions.map((p) => ({
              label: `${p.action}:${p.resource}`,
              value: p.id,
            }))}
            allowClear
          />
          <Button
            icon={<PlusOutlined />}
            disabled={!selectedPermission}
            onClick={() => {
              if (selectedPermission)
                handleAssignPermission(record.id, selectedPermission);
            }}
            style={{ background: '#722ed1', color: '#fff', border: 'none' }}
          >
            Assign
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#181c24', minHeight: '100vh' }}>
      <Title level={3} style={{ color: '#fff', marginBottom: 24 }}>Role Management (RBAC Admin)</Title>
      <Space style={{ marginBottom: 16, width: '100%' }} align="center">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search roles or permissions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 260, background: '#23272f', color: '#fff', border: 'none' }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ background: '#722ed1', border: 'none' }}
        >
          New Role
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredRoles}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 12, showSizeChanger: false }}
        bordered
        style={{ background: '#1a1a1a', color: '#fff', borderRadius: 12 }}
      />
      <Modal
        title="Create New Role"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRole}
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
              style={{ background: '#722ed1', border: 'none' }}
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
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{ name: selectedRole?.name }}
          onFinish={handleUpdateRole}
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
              style={{ background: '#1890ff', border: 'none' }}
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
        destroyOnClose
      >
        <ul style={{ color: '#fff' }}>
          {roleUsers.length === 0 ? <li>No users have this role.</li> : roleUsers.map(u => (
            <li key={u.id}>{u.email} (ID: {u.id})</li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default RoleManagement;
