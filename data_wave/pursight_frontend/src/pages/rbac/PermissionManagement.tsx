import React, { useState } from "react";
import { Table, Button, Input, Modal, Form, Space, Typography, Tag, message, Select, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined, UserSwitchOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import PermissionConditionHelper from "../../rbac/PermissionConditionHelper";

const { Title } = Typography;

interface Permission {
  id: number;
  action: string;
  resource: string;
  conditions?: string | null;
}
interface Role {
  id: number;
  name: string;
  permissions: [string, string][];
}

const fetchPermissions = async (): Promise<Permission[]> => (await axios.get("/sensitivity-labels/rbac/permissions")).data;
const fetchRoles = async (): Promise<Role[]> => (await axios.get("/sensitivity-labels/rbac/roles")).data;
const createPermission = async (permission: Omit<Permission, "id">) => (await axios.post("/sensitivity-labels/rbac/permissions", permission)).data;
const deletePermission = async (id: number) => axios.delete(`/sensitivity-labels/rbac/permissions/${id}`);
const updatePermission = async (permission: Permission) => (await axios.put(`/sensitivity-labels/rbac/permissions/${permission.id}`, permission)).data;
const assignPermission = async ({ roleId, permissionId }: { roleId: number; permissionId: number }) => axios.post("/sensitivity-labels/rbac/assign-permission", { role_id: roleId, permission_id: permissionId });
const removePermission = async ({ roleId, permissionId }: { roleId: number; permissionId: number }) => axios.post("/sensitivity-labels/rbac/remove-permission", { role_id: roleId, permission_id: permissionId });

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleAssignPermission, setRoleAssignPermission] = useState<Permission | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchPermissions(), fetchRoles()])
      .then(([permissions, roles]) => {
        setPermissions(permissions);
        setRoles(roles);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreatePermission = async (values: Omit<Permission, "id">) => {
    try {
      await createPermission(values);
      message.success("Permission created");
      setModalOpen(false);
      form.resetFields();
      setLoading(true);
      setPermissions(await fetchPermissions());
    } catch {
      message.error("Failed to create permission");
    }
  };
  const handleDeletePermission = async (id: number) => {
    try {
      await deletePermission(id);
      message.success("Permission deleted");
      setLoading(true);
      setPermissions(await fetchPermissions());
    } catch {
      message.error("Failed to delete permission");
    }
  };
  const handleUpdatePermission = async (values: Omit<Permission, "id">) => {
    if (!selectedPermission) return;
    try {
      await updatePermission({ ...selectedPermission, ...values });
      message.success("Permission updated");
      setEditModalOpen(false);
      editForm.resetFields();
      setLoading(true);
      setPermissions(await fetchPermissions());
    } catch {
      message.error("Failed to update permission");
    }
  };
  const handleAssignPermission = async (roleId: number, permissionId: number) => {
    try {
      await assignPermission({ roleId, permissionId });
      message.success("Permission assigned to role");
      setLoading(true);
      setRoles(await fetchRoles());
    } catch {
      message.error("Failed to assign permission to role");
    }
  };
  const handleRemovePermission = async (roleId: number, permissionId: number) => {
    try {
      await removePermission({ roleId, permissionId });
      message.success("Permission removed from role");
      setLoading(true);
      setRoles(await fetchRoles());
    } catch {
      message.error("Failed to remove permission from role");
    }
  };

  const filteredPermissions = permissions.filter(p =>
    p.action.toLowerCase().includes(search.toLowerCase()) ||
    p.resource.toLowerCase().includes(search.toLowerCase()) ||
    (p.conditions || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => <Tag color="blue">{action}</Tag>,
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
      render: (resource: string) => <Tag color="purple">{resource}</Tag>,
    },
    {
      title: "Conditions",
      dataIndex: "conditions",
      key: "conditions",
      render: (conditions: string | null) => conditions || <span style={{ color: '#888' }}>None</span>,
    },
    {
      title: "Roles",
      key: "roles",
      render: (_: any, record: Permission) => {
        const rolesWithPermission = (roles || []).filter(role =>
          role.permissions.some(([action, resource]) =>
            action === record.action && resource === record.resource
          )
        );
        return (
          <Space wrap>
            {rolesWithPermission.length === 0 ? (
              <span style={{ color: '#888' }}>None</span>
            ) : (
              rolesWithPermission.map(role => (
                <Tag color="geekblue" key={role.id}>{role.name}</Tag>
              ))
            )}
            <Button
              size="small"
              icon={<UserSwitchOutlined />}
              onClick={() => {
                setRoleAssignPermission(record);
                setRoleModalOpen(true);
              }}
              style={{ background: '#23272f', color: '#fff', border: 'none' }}
            >Manage</Button>
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Permission) => (
        <Space>
          <Tooltip title="Edit permission">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedPermission(record);
                setEditModalOpen(true);
                editForm.setFieldsValue({
                  action: record.action,
                  resource: record.resource,
                  conditions: record.conditions ?? "",
                });
              }}
              style={{ background: '#1890ff', color: '#fff', border: 'none' }}
            >Edit</Button>
          </Tooltip>
          <Tooltip title="Delete permission">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeletePermission(record.id)}
              style={{ background: '#23272f', color: '#ff7875', border: 'none' }}
            >Delete</Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#181c24', minHeight: '100vh' }}>
      <Title level={3} style={{ color: '#fff', marginBottom: 24 }}>Permission Management (RBAC Admin)</Title>
      <Space style={{ marginBottom: 16, width: '100%' }} align="center">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search permissions..."
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
          New Permission
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredPermissions}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 12, showSizeChanger: false }}
        bordered
        style={{ background: '#1a1a1a', color: '#fff', borderRadius: 12 }}
      />
      <Modal
        title="Create New Permission"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePermission}
        >
          <Form.Item name="action" label="Action" rules={[{ required: true, message: 'Please enter an action' }]}> 
            <Input autoFocus placeholder="Action" />
          </Form.Item>
          <Form.Item name="resource" label="Resource" rules={[{ required: true, message: 'Please enter a resource' }]}> 
            <Input placeholder="Resource" />
          </Form.Item>
          <Form.Item name="conditions" label="Conditions">
            <PermissionConditionHelper value={form.getFieldValue('conditions')} onChange={val => form.setFieldsValue({ conditions: val })} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ background: '#722ed1', border: 'none' }}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Permission"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{
            action: selectedPermission?.action,
            resource: selectedPermission?.resource,
            conditions: selectedPermission?.conditions ?? "",
          }}
          onFinish={handleUpdatePermission}
        >
          <Form.Item name="action" label="Action" rules={[{ required: true, message: 'Please enter an action' }]}> 
            <Input autoFocus placeholder="Action" />
          </Form.Item>
          <Form.Item name="resource" label="Resource" rules={[{ required: true, message: 'Please enter a resource' }]}> 
            <Input placeholder="Resource" />
          </Form.Item>
          <Form.Item name="conditions" label="Conditions">
            <PermissionConditionHelper value={editForm.getFieldValue('conditions')} onChange={val => editForm.setFieldsValue({ conditions: val })} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ background: '#1890ff', border: 'none' }}>
              Save
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={`Manage Roles for Permission: ${roleAssignPermission?.action}:${roleAssignPermission?.resource}`}
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <div>
          <p style={{ color: '#fff' }}>Assign or remove this permission to/from roles:</p>
          <Select
            style={{ width: '100%' }}
            placeholder="Select role to assign"
            value={selectedRoleId}
            onChange={setSelectedRoleId}
            options={
              (roles || []).map(role => ({ label: role.name, value: role.id }))
            }
            allowClear
          />
          <Button
            type="primary"
            style={{ marginTop: 8, background: '#722ed1', border: 'none' }}
            disabled={!selectedRoleId || !roleAssignPermission}
            onClick={() => {
              if (selectedRoleId && roleAssignPermission)
                handleAssignPermission(selectedRoleId, roleAssignPermission.id);
            }}
          >Assign to Role</Button>
          <div style={{ marginTop: 16 }}>
            <b style={{ color: '#fff' }}>Roles with this permission:</b>
            <ul style={{ color: '#fff' }}>
              {(roles || []).filter(role =>
                role.permissions.some(([action, resource]) =>
                  action === roleAssignPermission?.action && resource === roleAssignPermission?.resource
                )
              ).map(role => (
                <li key={role.id}>
                  {role.name}
                  <Button
                    size="small"
                    icon={<CloseOutlined />}
                    danger
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      if (roleAssignPermission)
                        handleRemovePermission(role.id, roleAssignPermission.id);
                    }}
                  >Remove</Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionManagement;
