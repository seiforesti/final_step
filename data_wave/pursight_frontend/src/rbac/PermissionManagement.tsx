import React, { useState } from "react";
import { useRBAC } from "../hooks/useRBAC";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Space,
  Typography,
  Tag,
  message,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import PermissionConditionHelper from "./PermissionConditionHelper";

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

const fetchPermissions = async (): Promise<Permission[]> => {
  const { data } = await axios.get("/sensitivity-labels/rbac/permissions");
  return data;
};
const fetchRoles = async (): Promise<Role[]> => {
  const { data } = await axios.get("/sensitivity-labels/rbac/roles");
  return data;
};
const createPermission = async (permission: Omit<Permission, "id">) => {
  const { data } = await axios.post(
    "/sensitivity-labels/rbac/permissions",
    permission
  );
  return data;
};
const deletePermission = async (id: number) => {
  await axios.delete(`/sensitivity-labels/rbac/permissions/${id}`);
};
const updatePermission = async (permission: Permission) => {
  const { data } = await axios.put(
    `/sensitivity-labels/rbac/permissions/${permission.id}`,
    permission
  );
  return data;
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

const PermissionManagement: React.FC = () => {
  const { can, user } = useRBAC();
  const queryClient = useQueryClient();
  const {
    data: permissions,
    isLoading,
    error,
  } = useQuery<Permission[]>({
    queryKey: ["rbac", "permissions"],
    queryFn: fetchPermissions,
  });
  const { data: roles } = useQuery<Role[]>({
    queryKey: ["rbac", "roles"],
    queryFn: fetchRoles,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleAssignPermission, setRoleAssignPermission] =
    useState<Permission | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const createMutation = useMutation({
    mutationFn: createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "permissions"] });
      setModalOpen(false);
      form.resetFields();
      message.success("Permission created");
    },
    onError: () => message.error("Failed to create permission"),
  });
  const deleteMutation = useMutation({
    mutationFn: deletePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "permissions"] });
      message.success("Permission deleted");
    },
    onError: () => message.error("Failed to delete permission"),
  });
  const updateMutation = useMutation({
    mutationFn: updatePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "permissions"] });
      setEditModalOpen(false);
      editForm.resetFields();
      message.success("Permission updated");
    },
    onError: () => message.error("Failed to update permission"),
  });
  const assignPermissionMutation = useMutation({
    mutationFn: assignPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      message.success("Permission assigned to role");
      setRoleModalOpen(false);
      setSelectedRoleId(null);
    },
    onError: () => message.error("Failed to assign permission to role"),
  });
  const removePermissionMutation = useMutation({
    mutationFn: removePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      message.success("Permission removed from role");
    },
    onError: () => message.error("Failed to remove permission from role"),
  });

  if (!can("manage", "rbac")) {
    return (
      <div>
        Access Denied: You do not have permission to manage permissions.
      </div>
    );
  }
  if (isLoading) return <div>Loading permissions...</div>;
  if (error) return <div>Failed to load permissions.</div>;

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
      render: (conditions: string | null) =>
        conditions || <span style={{ color: "#888" }}>None</span>,
    },
    {
      title: "Roles",
      key: "roles",
      render: (_: any, record: Permission) => {
        const rolesWithPermission = (roles || []).filter((role) =>
          role.permissions.some(
            ([action, resource]) =>
              action === record.action && resource === record.resource
          )
        );
        return (
          <Space wrap>
            {rolesWithPermission.length === 0 ? (
              <span style={{ color: "#888" }}>None</span>
            ) : (
              rolesWithPermission.map((role) => (
                <Tag color="geekblue" key={role.id}>
                  {role.name}
                </Tag>
              ))
            )}
            <Button
              size="small"
              icon={<UserSwitchOutlined />}
              onClick={() => {
                setRoleAssignPermission(record);
                setRoleModalOpen(true);
              }}
            >
              Manage
            </Button>
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Permission) => (
        <Space>
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
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#fff" }}>
        Permission Management (RBAC Admin Only)
      </Title>
      <p style={{ color: "#aaa" }}>Welcome, {user?.email}</p>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        New Permission
      </Button>
      <Table
        columns={columns}
        dataSource={permissions}
        rowKey="id"
        pagination={false}
        bordered
        style={{ background: "#1a1a1a", color: "#fff" }}
      />
      <Modal
        title="Create New Permission"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={({ action, resource, conditions }) =>
            createMutation.mutate({
              action,
              resource,
              conditions: conditions || null,
            })
          }
        >
          <Form.Item
            name="action"
            label="Action"
            rules={[{ required: true, message: "Please enter an action" }]}
          >
            <Input autoFocus placeholder="Action" />
          </Form.Item>
          <Form.Item
            name="resource"
            label="Resource"
            rules={[{ required: true, message: "Please enter a resource" }]}
          >
            <Input placeholder="Resource" />
          </Form.Item>
          <Form.Item name="conditions" label="Conditions">
            <PermissionConditionHelper
              value={form.getFieldValue("conditions")}
              onChange={(val) => form.setFieldsValue({ conditions: val })}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending}
            >
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
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{
            action: selectedPermission?.action,
            resource: selectedPermission?.resource,
            conditions: selectedPermission?.conditions ?? "",
          }}
          onFinish={({ action, resource, conditions }) => {
            if (selectedPermission)
              updateMutation.mutate({
                ...selectedPermission,
                action,
                resource,
                conditions,
              });
          }}
        >
          <Form.Item
            name="action"
            label="Action"
            rules={[{ required: true, message: "Please enter an action" }]}
          >
            <Input autoFocus placeholder="Action" />
          </Form.Item>
          <Form.Item
            name="resource"
            label="Resource"
            rules={[{ required: true, message: "Please enter a resource" }]}
          >
            <Input placeholder="Resource" />
          </Form.Item>
          <Form.Item name="conditions" label="Conditions">
            <PermissionConditionHelper
              value={editForm.getFieldValue("conditions")}
              onChange={(val) => editForm.setFieldsValue({ conditions: val })}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateMutation.isPending}
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
        title={`Manage Roles for Permission: ${roleAssignPermission?.action}:${roleAssignPermission?.resource}`}
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <div>
          <p>Assign or remove this permission to/from roles:</p>
          <Select
            style={{ width: "100%" }}
            placeholder="Select role to assign"
            value={selectedRoleId}
            onChange={setSelectedRoleId}
            options={(roles || []).map((role) => ({
              label: role.name,
              value: role.id,
            }))}
            allowClear
          />
          <Button
            type="primary"
            style={{ marginTop: 8 }}
            disabled={!selectedRoleId || !roleAssignPermission}
            loading={assignPermissionMutation.isPending}
            onClick={() => {
              if (selectedRoleId && roleAssignPermission)
                assignPermissionMutation.mutate({
                  roleId: selectedRoleId,
                  permissionId: roleAssignPermission.id,
                });
            }}
          >
            Assign to Role
          </Button>
          <div style={{ marginTop: 16 }}>
            <b>Roles with this permission:</b>
            <ul>
              {(roles || [])
                .filter((role) =>
                  role.permissions.some(
                    ([action, resource]) =>
                      action === roleAssignPermission?.action &&
                      resource === roleAssignPermission?.resource
                  )
                )
                .map((role) => (
                  <li key={role.id}>
                    {role.name}
                    <Button
                      size="small"
                      icon={<CloseOutlined />}
                      danger
                      style={{ marginLeft: 8 }}
                      loading={removePermissionMutation.isPending}
                      onClick={() => {
                        if (roleAssignPermission)
                          removePermissionMutation.mutate({
                            roleId: role.id,
                            permissionId: roleAssignPermission.id,
                          });
                      }}
                    >
                      Remove
                    </Button>
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
