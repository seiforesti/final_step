import React, { useState } from "react";
import {
  Table,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Spin,
  Dropdown,
  Menu,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  KeyOutlined,
  DownloadOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { saveAs } from "file-saver";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  Role,
  Permission,
  useRoleParents,
  useRoleChildren,
  useAddRoleParent,
  useRemoveRoleParent,
  useRoleEffectivePermissions,
  useEntityAuditLogs,
  AuditLog,
} from "../../api/rbac";
import {
  PermissionSelector,
  TestAbacModal,
  BulkImportExport,
  JsonDiffView,
  CsvExport,
  TimelineAuditView,
  AdvancedJsonDiffView,
  ConditionSelector
} from "../../components/rbac";

const { Title, Text } = Typography;

const InheritanceModal: React.FC<{
  role: Role;
  open: boolean;
  onClose: () => void;
}> = ({ role, open, onClose }) => {
  const { data: parents = [], refetch: refetchParents } = useRoleParents(
    role.id
  );
  const { data: children = [] } = useRoleChildren(role.id);
  const { data: effectivePerms = [] } = useRoleEffectivePermissions(role.id);
  const addParent = useAddRoleParent();
  const removeParent = useRemoveRoleParent();
  const [addParentId, setAddParentId] = useState<number | null>(null);
  const { data: allRoles = [] } = useRoles();

  const availableParents = allRoles.filter(
    (r) => r.id !== role.id && !parents.some((p) => p.id === r.id)
  );

  return (
    <Modal
      title={`Role Inheritance for ${role.name}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Title level={5}>Parent Roles</Title>
      <Space direction="vertical" style={{ width: "100%" }}>
        {parents.length === 0 && <Text type="secondary">No parents</Text>}
        {parents.map((parent) => (
          <Space key={parent.id}>
            <Tag color="blue">{parent.name}</Tag>
            <Button
              size="small"
              danger
              onClick={async () => {
                await removeParent.mutateAsync({
                  roleId: role.id,
                  parentId: parent.id,
                });
                refetchParents();
              }}
            >
              Remove
            </Button>
          </Space>
        ))}
        <Input.Group compact>
          <select
            value={addParentId ?? ""}
            onChange={(e) => setAddParentId(Number(e.target.value))}
            style={{ minWidth: 120 }}
          >
            <option value="">Add parent...</option>
            {availableParents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <Button
            type="primary"
            size="small"
            disabled={!addParentId}
            onClick={async () => {
              if (addParentId) {
                await addParent.mutateAsync({
                  roleId: role.id,
                  parentId: addParentId,
                });
                setAddParentId(null);
                refetchParents();
              }
            }}
          >
            Add
          </Button>
        </Input.Group>
      </Space>
      <Title level={5} style={{ marginTop: 24 }}>
        Child Roles
      </Title>
      <Space wrap>
        {children.length === 0 && <Text type="secondary">No children</Text>}
        {children.map((child) => (
          <Tag color="purple" key={child.id}>
            {child.name}
          </Tag>
        ))}
      </Space>
      <Title level={5} style={{ marginTop: 24 }}>
        Effective Permissions
      </Title>
      <ul>
        {effectivePerms.length === 0 && (
          <Text type="secondary">No effective permissions</Text>
        )}
        {effectivePerms.map((perm) => (
          <li key={perm.id}>
            <Tag color="geekblue">{perm.action}</Tag> on{" "}
            <Tag color="purple">{perm.resource}</Tag>
            {perm.conditions && (
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {typeof perm.conditions === "string"
                  ? perm.conditions
                  : JSON.stringify(perm.conditions)}
              </Text>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  );
};

const RoleAuditModal: React.FC<{
  role: Role | null;
  open: boolean;
  onClose: () => void;
}> = ({ role, open, onClose }) => {
  const { data: logs, isLoading } = useEntityAuditLogs(
    "role",
    role?.id?.toString() || ""
  );
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filter, setFilter] = useState("");
  const [showCorrelation, setShowCorrelation] = useState<string | null>(null);

  const filteredLogs =
    logs?.filter(
      (log) =>
        log.action?.toLowerCase().includes(filter.toLowerCase()) ||
        log.performed_by?.toLowerCase().includes(filter.toLowerCase()) ||
        log.status?.toLowerCase().includes(filter.toLowerCase()) ||
        log.note?.toLowerCase().includes(filter.toLowerCase()) ||
        log.correlation_id?.toLowerCase().includes(filter.toLowerCase())
    ) || [];

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, `role_audit_logs_${role?.id || "all"}.json`);
  };

  const correlationMenu = (
    <Menu>
      {filteredLogs
        .filter((log) => log.correlation_id)
        .map((log) => (
          <Menu.Item
            key={log.correlation_id}
            icon={<LinkOutlined />}
            onClick={() => setShowCorrelation(log.correlation_id!)}
          >
            {log.correlation_id}
          </Menu.Item>
        ))}
    </Menu>
  );

  return (
    <Modal
      title={role ? `Audit History for ${role.name}` : "Role Audit History"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Space style={{ marginBottom: 12 }}>
        <Input.Search
          placeholder="Filter logs (action, user, status, note, correlation)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: 320 }}
        />
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          Export JSON
        </Button>
        <Dropdown overlay={correlationMenu} trigger={["click"]}>
          <Button icon={<LinkOutlined />}>Correlation Chains</Button>
        </Dropdown>
        <CsvExport
          data={filteredLogs}
          filename={`role_audit_logs_${role?.id || "all"}.csv`}
        />
      </Space>
      <Table
        dataSource={filteredLogs}
        loading={isLoading}
        rowKey="id"
        columns={[
          { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
          { title: "Action", dataIndex: "action", key: "action" },
          { title: "By", dataIndex: "performed_by", key: "performed_by" },
          { title: "Status", dataIndex: "status", key: "status" },
          { title: "Note", dataIndex: "note", key: "note" },
          {
            title: "Drilldown",
            key: "drilldown",
            render: (_, log) => (
              <Button size="small" onClick={() => setSelectedLog(log)}>
                View Diff
              </Button>
            ),
          },
        ]}
        pagination={{ pageSize: 8 }}
      />
      <TimelineAuditView logs={filteredLogs} onDrilldown={setSelectedLog} />
      <Modal
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        width={700}
        title="Audit Log Diff"
        destroyOnClose
      >
        {selectedLog && (
          <div>
            <b>Action:</b> {selectedLog.action} <br />
            <b>By:</b> {selectedLog.performed_by} <br />
            <b>Status:</b> {selectedLog.status} <br />
            <b>Note:</b> {selectedLog.note} <br />
            <AdvancedJsonDiffView
              before={selectedLog.before_state}
              after={selectedLog.after_state}
            />
          </div>
        )}
      </Modal>
      {showCorrelation && (
        <Modal
          open={!!showCorrelation}
          onCancel={() => setShowCorrelation(null)}
          footer={null}
          width={900}
          title={`Workflow Chain: ${showCorrelation}`}
          destroyOnClose
        >
          <Table
            dataSource={
              logs?.filter((l) => l.correlation_id === showCorrelation) || []
            }
            rowKey="id"
            columns={[
              { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
              { title: "Action", dataIndex: "action", key: "action" },
              { title: "By", dataIndex: "performed_by", key: "performed_by" },
              { title: "Status", dataIndex: "status", key: "status" },
              { title: "Note", dataIndex: "note", key: "note" },
            ]}
            pagination={false}
          />
        </Modal>
      )}
    </Modal>
  );
};

const RolesPage: React.FC = () => {
  const { data: roles, isLoading } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewPermsRole, setViewPermsRole] = useState<Role | null>(null);
  const [testAbacOpen, setTestAbacOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [inheritanceRole, setInheritanceRole] = useState<Role | null>(null);
  const [auditRole, setAuditRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const openAddModal = () => {
    setEditingRole(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEditModal = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({ name: role.name, description: role.description });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await updateRole.mutateAsync({
          roleId: editingRole.id,
          name: values.name,
          description: values.description,
        });
        message.success("Role updated");
      } else {
        await createRole.mutateAsync({
          name: values.name,
          description: values.description,
        });
        message.success("Role created");
      }
      setModalOpen(false);
      form.resetFields();
    } catch (e) {
      message.error("Failed to save role");
    }
  };

  const handleDelete = async (roleId: number) => {
    try {
      await deleteRole.mutateAsync(roleId);
      message.success("Role deleted");
    } catch (e) {
      message.error("Failed to delete role");
    }
  };

  const columns: ColumnsType<Role> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Text strong>
          <KeyOutlined /> {name}
        </Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc?: string) =>
        desc || <Text type="secondary">No description</Text>,
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (perms?: Permission[]) => (
        <Tooltip title="View permissions">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setViewPermsRole(
                perms
                  ? ({ ...viewPermsRole, permissions: perms } as Role)
                  : null
              );
            }}
            disabled={!perms || perms.length === 0}
          >
            {perms ? perms.length : 0} perms
          </Button>
        </Tooltip>
      ),
    },
    {
      title: "Inheritance",
      key: "inheritance",
      render: (_, role) => (
        <Button size="small" onClick={() => setInheritanceRole(role)}>
          View Inheritance
        </Button>
      ),
    },
    {
      title: "Audit",
      key: "audit",
      render: (_, role) => (
        <Button size="small" onClick={() => setAuditRole(role)}>
          Audit
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, role) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEditModal(role)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete role?"
            onConfirm={() => handleDelete(role.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Roles
      </Title>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add role
        </Button>
        <Button onClick={() => setTestAbacOpen(true)} style={{ marginLeft: 8 }}>
          Test ABAC
        </Button>
        <BulkImportExport type="roles" />
        <BulkImportExport type="permissions" />
        <Table
          dataSource={roles || []}
          loading={
            isLoading ||
            createRole.isPending ||
            updateRole.isPending ||
            deleteRole.isPending
          }
          columns={columns}
          rowKey="id"
          bordered={true}
          style={{ background: "#1a1a1a", color: "#fff", borderRadius: 12 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Space>

      {/* Add/Edit Role Modal */}
      <Modal
        title={editingRole ? "Edit Role" : "Add Role"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        confirmLoading={createRole.isPending || updateRole.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: "Role name is required" }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Describe this role (optional)"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
          <Form.Item name="permissions" label="Permissions">
            <PermissionSelector
              value={selectedPerms}
              onChange={setSelectedPerms}
            />
          </Form.Item>
          <Form.Item name="conditions" label="Conditions">
            <ConditionSelector
              value={editingRole?.conditions}
              onChange={(conds) =>
                setEditingRole((prev) => prev && { ...prev, conditions: conds })
              }
              templates={[]} // Add your condition templates here
            />
          </Form.Item>
        </Form>
      </Modal>
      <TestAbacModal
        open={testAbacOpen}
        onClose={() => setTestAbacOpen(false)}
      />

      {/* View Permissions Modal */}
      <Modal
        title={
          viewPermsRole
            ? `Permissions for ${viewPermsRole.name}`
            : "Permissions"
        }
        open={!!viewPermsRole}
        onCancel={() => setViewPermsRole(null)}
        footer={null}
        destroyOnHidden
      >
        {viewPermsRole?.permissions && viewPermsRole.permissions.length > 0 ? (
          <ul>
            {viewPermsRole.permissions.map((perm, idx) => (
              <li key={perm.id || idx}>
                <Tag color="geekblue">{perm.action}</Tag> on{" "}
                <Tag color="purple">{perm.resource}</Tag>
                {perm.conditions && (
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {typeof perm.conditions === "string"
                      ? perm.conditions
                      : JSON.stringify(perm.conditions)}
                  </Text>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Text type="secondary">No permissions assigned to this role.</Text>
        )}
      </Modal>

      {/* Inheritance Modal */}
      {inheritanceRole && (
        <InheritanceModal
          role={inheritanceRole}
          open={!!inheritanceRole}
          onClose={() => setInheritanceRole(null)}
        />
      )}

      {/* Audit Modal */}
      {auditRole && (
        <RoleAuditModal
          role={auditRole}
          open={!!auditRole}
          onClose={() => setAuditRole(null)}
        />
      )}
    </div>
  );
};

export default RolesPage;
