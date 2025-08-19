import React, { useState, useMemo } from "react";
import {
  Table,
  Typography,
  Button,
  Input,
  Space,
  Tag,
  Select,
  Divider,
  Modal,
  Form,
  message,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Key } from "react";
import {
  useRoleAssignments,
  useUsers,
  useRoles,
  useAssignRoleScope,
  ResourceRole,
} from "../../api/rbac";
import { PlusOutlined, KeyOutlined, UserOutlined } from "@ant-design/icons";
import { RequestAccessModal } from "../../components/rbac";

const { Title, Text } = Typography;

const RoleAssignmentsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [requestAccessOpen, setRequestAccessOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: assignments, isLoading: loadingAssignments } =
    useRoleAssignments({ role_id: roleFilter });
  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const assignRoleScope = useAssignRoleScope();

  // Filtered assignments by search
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    if (!search) return assignments;
    return assignments.filter((a) => {
      const user = users?.find((u) => u.id === a.user_id);
      return user?.email.toLowerCase().includes(search.toLowerCase());
    });
  }, [assignments, search, users]);

  // Table columns
  const columns: ColumnsType<ResourceRole> = [
    {
      title: "User",
      dataIndex: "user_id",
      key: "user_id",
      render: (user_id: number) => {
        const user = users?.find((u) => u.id === user_id);
        return user ? (
          <span>
            <UserOutlined /> {user.email}
          </span>
        ) : (
          <Spin size="small" />
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role_id",
      key: "role_id",
      render: (role_id: number) => {
        const role = roles?.find((r) => r.id === role_id);
        return role ? (
          <Tag color="geekblue">
            <KeyOutlined /> {role.name}
          </Tag>
        ) : (
          <Spin size="small" />
        );
      },
      filters: roles?.map((r) => ({ text: r.name, value: r.id })) || [],
      onFilter: (value: boolean | Key, record: ResourceRole) =>
        record.role_id === value,
    },
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
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  // Add Role Assignment Modal
  const handleAdd = async (values: any) => {
    try {
      await assignRoleScope.mutateAsync({
        user_id: values.user_id,
        role_id: values.role_id,
        resource_type: values.resource_type,
        resource_id: values.resource_id,
      });
      message.success("Role assignment added");
      setAddModalOpen(false);
      form.resetFields();
    } catch (e) {
      message.error("Failed to add role assignment");
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Role assignments
      </Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by user email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 260 }}
        />
        <Select
          allowClear
          placeholder="Filter by role"
          value={roleFilter}
          onChange={setRoleFilter}
          style={{ width: 180 }}
          options={roles?.map((r) => ({ label: r.name, value: r.id }))}
          loading={loadingRoles}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModalOpen(true)}
        >
          Add role assignment
        </Button>
        <Button type="primary" onClick={() => setRequestAccessOpen(true)}>
          Request Access
        </Button>
      </Space>
      <Table
        dataSource={filteredAssignments}
        loading={loadingAssignments || loadingUsers || loadingRoles}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 12, showSizeChanger: false }}
        bordered={true}
        style={{ background: "#1a1a1a", color: "#fff", borderRadius: 12 }}
      />
      <Modal
        title="Add Role Assignment"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="user_id" label="User" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select user"
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={users?.map((u) => ({ label: u.email, value: u.id }))}
              loading={loadingUsers}
            />
          </Form.Item>
          <Form.Item name="role_id" label="Role" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select role"
              options={roles?.map((r) => ({ label: r.name, value: r.id }))}
              loading={loadingRoles}
            />
          </Form.Item>
          <Form.Item
            name="resource_type"
            label="Resource Type"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. database, schema, table" />
          </Form.Item>
          <Form.Item
            name="resource_id"
            label="Resource ID"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. db1, schema1, table1" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={assignRoleScope.isPending}
            >
              Add Assignment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <RequestAccessModal
        open={requestAccessOpen}
        onClose={() => setRequestAccessOpen(false)}
        userId={/* current user id */ 1}
        resourceType={"resource_type"}
        resourceId={"resource_id"}
      />
      <Divider />
      <Text type="secondary">
        This page lets you view, filter, and add role assignments for users and
        resources. The UI and logic are inspired by Azure RBAC.
      </Text>
    </div>
  );
};

export default RoleAssignmentsPage;
