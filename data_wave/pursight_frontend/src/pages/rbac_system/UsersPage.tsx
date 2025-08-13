import React, { useState } from "react";
import {
  Table,
  Typography,
  Button,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Modal,
  Select,
  Form,
  Spin,
  Card,
  Input,
} from "antd";
import { Menu as HeadlessMenu } from "@headlessui/react";
import { Link as LinkIcon } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import {
  UserOutlined,
  KeyOutlined,
  CheckCircleTwoTone,
  StopTwoTone,
  ReloadOutlined,
  TeamOutlined,
  FileSearchOutlined,
  DownloadOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  useUsers,
  useRoles,
  useDeactivateUser,
  useReactivateUser,
  useBulkAssignRoles,
  useBulkRemoveRoles,
  useBulkAssignPermissions,
  useBulkRemovePermissions,
  useRoleEffectivePermissions,
  useEntityAuditLogs,
  User,
  Role,
  AuditLog,
} from "../../api/rbac";
import {
  PermissionSelector,
  TestAbacModal,
  BulkImportExport,
  JsonDiffView,
  CsvExport,
  TimelineAuditView,
  AdvancedJsonDiffView
} from "../../components/rbac";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;

import { useUserEffectivePermissions } from "../../api/rbac";

// Helper to render ABAC/condition JSON in a user-friendly way, with expanded logic
function renderCondition(cond: any): string {
  if (!cond) return "";
  if (typeof cond === "string") {
    try {
      cond = JSON.parse(cond);
    } catch {
      return cond;
    }
  }
  if (cond.user_id === ":current_user_id") return "Only for current user";
  if (cond.department === ":user_department") return "User's department only";
  if (cond.region === ":user_region") return "User's region only";
  if (
    typeof cond.department === "object" &&
    cond.department.$op === "user_attr"
  ) {
    return `User's ${cond.department.value}`;
  }
  if (cond.role) return `Role required: ${cond.role}`;
  if (cond.time && cond.time.$op === "between") {
    return `Allowed between ${cond.time.start} and ${cond.time.end}`;
  }
  if (cond.ip && cond.ip.$op === "in") {
    return `Allowed from IPs: ${cond.ip.values?.join(", ")}`;
  }
  if (cond.allowed_values && Array.isArray(cond.allowed_values)) {
    return `Allowed values: ${cond.allowed_values.join(", ")}`;
  }
  if (cond.project && cond.project === ":user_project") {
    return "User's project only";
  }
  if (cond.org_unit && cond.org_unit === ":user_org_unit") {
    return "User's org unit only";
  }
  if (cond.custom && typeof cond.custom === "string") {
    return `Custom: ${cond.custom}`;
  }
  // Add more ABAC/condition patterns as needed
  return JSON.stringify(cond);
}

const UserEffectivePermissions: React.FC<{ user: User }> = ({ user }) => {
  // Now uses the v2 unified endpoint
  const { data: permissions, isLoading } = useUserEffectivePermissions(user.id);

  const columns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string, perm: any) => (
        <Tag color={perm.is_effective ? "geekblue" : "default"}>{action}</Tag>
      ),
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
      render: (resource: string, perm: any) => (
        <Tag color={perm.is_effective ? "purple" : "default"}>{resource}</Tag>
      ),
    },
    {
      title: "Condition",
      dataIndex: "conditions",
      key: "conditions",
      render: (cond: any) =>
        cond ? (
          <Tooltip
            title={typeof cond === "string" ? cond : JSON.stringify(cond)}
          >
            <span>{renderCondition(cond)}</span>
          </Tooltip>
        ) : (
          <span>-</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "is_effective",
      key: "is_effective",
      render: (is_effective: boolean) =>
        is_effective ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Reason",
      dataIndex: "note",
      key: "note",
      render: (note: string, perm: any) =>
        !perm.is_effective && note ? (
          <Tooltip title={note}>
            <Text type="danger" style={{ fontStyle: "italic" }}>
              {note}
            </Text>
          </Tooltip>
        ) : (
          <span>-</span>
        ),
    },
  ];

  return (
    <Card style={{ marginTop: 16 }}>
      <Title level={5}>Effective Permissions</Title>
      {isLoading ? (
        <Spin />
      ) : permissions && permissions.length > 0 ? (
        <Table
          dataSource={permissions}
          columns={columns}
          rowKey={(perm, idx) => perm.id || idx}
          size="small"
          pagination={false}
        />
      ) : (
        <Text type="secondary">No effective permissions</Text>
      )}
    </Card>
  );
};

const UserAuditHistoryModal: React.FC<{
  user: User | null;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const { data, isLoading } = useEntityAuditLogs(
    "user",
    user?.id?.toString() || ""
  );
  return (
    <Modal
      title={user ? `Audit History for ${user.email}` : "User Audit History"}
      open={!!user}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {isLoading ? (
        <Spin />
      ) : data && data.length > 0 ? (
        <Table
          dataSource={data}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 8 }}
          columns={[
            { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
            { title: "Action", dataIndex: "action", key: "action" },
            { title: "By", dataIndex: "performed_by", key: "performed_by" },
            { title: "Status", dataIndex: "status", key: "status" },
            { title: "Note", dataIndex: "note", key: "note" },
            {
              title: "Diff",
              key: "diff",
              render: (_, log: AuditLog) => (
                <Tooltip title="Show before/after diff">
                  <Button
                    icon={<FileSearchOutlined />}
                    onClick={() => {
                      Modal.info({
                        title: `Change Diff (Action: ${log.action})`,
                        content: (
                          <div style={{ maxHeight: 400, overflow: "auto" }}>
                            <pre
                              style={{
                                color: "#c7254e",
                                background: "#f9f2f4",
                                padding: 8,
                              }}
                            >
                              Before:{" "}
                              {log.before_state
                                ? JSON.stringify(log.before_state, null, 2)
                                : "-"}
                            </pre>
                            <pre
                              style={{
                                color: "#22863a",
                                background: "#f6ffed",
                                padding: 8,
                              }}
                            >
                              After:{" "}
                              {log.after_state
                                ? JSON.stringify(log.after_state, null, 2)
                                : "-"}
                            </pre>
                          </div>
                        ),
                        width: 700,
                      });
                    }}
                  >
                    Diff
                  </Button>
                </Tooltip>
              ),
            },
          ]}
        />
      ) : (
        <Text type="secondary">No audit history for this user.</Text>
      )}
    </Modal>
  );
};

const UserAuditModal: React.FC<{
  user: User | null;
  open: boolean;
  onClose: () => void;
}> = ({ user, open, onClose }) => {
  const { data: logs, isLoading } = useEntityAuditLogs(
    "user",
    user?.id?.toString() || ""
  );
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);
  const [filter, setFilter] = React.useState("");
  const [showCorrelation, setShowCorrelation] = React.useState<string | null>(
    null
  );
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
    saveAs(blob, `user_audit_logs_${user?.id || "all"}.json`);
  };
  // Unique correlation IDs
  const correlationIds = Array.from(
    new Set(
      filteredLogs
        .filter((log) => log.correlation_id)
        .map((log) => log.correlation_id)
    )
  );

  const correlationMenu = (
    <HeadlessMenu as="div" className="relative inline-block text-left">
      <HeadlessMenu.Button
        as="button"
        type="button"
        className="ant-btn ant-btn-default flex items-center"
        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <LinkIcon size={16} style={{ marginRight: 4 }} /> Correlation Chains
      </HeadlessMenu.Button>
      <HeadlessMenu.Items className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        {correlationIds.length === 0 && (
          <div className="px-4 py-2 text-gray-500">No correlation chains</div>
        )}
        {correlationIds.map((id) => (
          <HeadlessMenu.Item key={id}>
            {({ active }: { active: boolean }) => (
              <button
                type="button"
                className={`group flex w-full items-center px-4 py-2 text-sm text-gray-700 ${
                  active ? "bg-gray-100" : ""
                }`}
                onClick={() => setShowCorrelation(id!)}
              >
                <LinkIcon size={16} className="mr-2" />
                {id}
              </button>
            )}
          </HeadlessMenu.Item>
        ))}
      </HeadlessMenu.Items>
    </HeadlessMenu>
  );
  return (
    <Modal
      title={user ? `Audit History for ${user.email}` : "User Audit History"}
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
        {correlationMenu}
        <CsvExport
          data={filteredLogs}
          filename={`user_audit_logs_${user?.id || "all"}.csv`}
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

const UsersPage: React.FC = () => {
  const { data: users, isLoading } = useUsers();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const deactivateUser = useDeactivateUser();
  const reactivateUser = useReactivateUser();
  const bulkAssignRoles = useBulkAssignRoles();
  const bulkRemoveRoles = useBulkRemoveRoles();
  const bulkAssignPermissions = useBulkAssignPermissions();
  const bulkRemovePermissions = useBulkRemovePermissions();

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkRoleId, setBulkRoleId] = useState<number | undefined>(undefined);
  const [viewRolesUser, setViewRolesUser] = useState<User | null>(null);
  const [testAbacOpen, setTestAbacOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [auditUser, setAuditUser] = React.useState<User | null>(null);

  const columns: ColumnsType<User> = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <span>
          <UserOutlined /> {email}
        </span>
      ),
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[], user: User) => (
        <span>
          {roles && roles.length > 0 ? (
            roles.map((role, idx) => (
              <Tag
                color="geekblue"
                key={role || idx}
                style={{ marginRight: 4 }}
              >
                <KeyOutlined /> {role}
              </Tag>
            ))
          ) : (
            <Text type="secondary">No roles</Text>
          )}
          <Button
            size="small"
            icon={<TeamOutlined />}
            onClick={() => setViewRolesUser(user)}
            style={{ marginLeft: 8 }}
          >
            View
          </Button>
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) =>
        isActive ? (
          <Tag
            icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
            color="success"
          >
            Active
          </Tag>
        ) : (
          <Tag icon={<StopTwoTone twoToneColor="#ff4d4f" />} color="error">
            Inactive
          </Tag>
        ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, user: User) => (
        <Space>
          {user.isActive ? (
            <Popconfirm
              title="Deactivate user?"
              onConfirm={async () => {
                await deactivateUser.mutateAsync(user.id);
                message.success("User deactivated");
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                size="small"
                danger
                icon={<StopTwoTone twoToneColor="#ff4d4f" />}
              />
            </Popconfirm>
          ) : (
            <Tooltip title="Reactivate">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={async () => {
                  await reactivateUser.mutateAsync(user.id);
                  message.success("User reactivated");
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Effective Permissions",
      key: "effective-permissions",
      render: (_: any, user: User) => <UserEffectivePermissions user={user} />,
    },
    {
      title: "Audit",
      key: "audit",
      render: (_: any, user: User) => (
        <Button
          size="small"
          icon={<FileSearchOutlined />}
          onClick={() => setAuditUser(user)}
        >
          Audit
        </Button>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const handleBulkAssign = async () => {
    if (!bulkRoleId || selectedRowKeys.length === 0) return;
    try {
      await bulkAssignRoles.mutateAsync({
        userIds: selectedRowKeys as number[],
        roleId: bulkRoleId,
      });
      message.success("Roles assigned to selected users");
      setBulkModalOpen(false);
      setSelectedRowKeys([]);
      setBulkRoleId(undefined);
    } catch (e) {
      message.error("Failed to assign roles");
    }
  };

  const handleBulkRemove = async (roleId: number) => {
    if (selectedRowKeys.length === 0) return;
    try {
      await bulkRemoveRoles.mutateAsync({
        user_ids: selectedRowKeys as number[],
        role_id: roleId,
      });
      message.success("Roles removed from selected users");
    } catch (e) {
      message.error("Failed to remove roles");
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Users
      </Title>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Button
          type="primary"
          onClick={() => setBulkModalOpen(true)}
          disabled={selectedRowKeys.length === 0}
        >
          Bulk assign role
        </Button>
        <Button
          danger
          onClick={() => handleBulkRemove(1)} // Example role ID, replace with actual
          disabled={selectedRowKeys.length === 0}
        >
          Bulk Remove Role
        </Button>
        <Button onClick={() => setTestAbacOpen(true)} style={{ marginLeft: 8 }}>
          Test ABAC
        </Button>
        <BulkImportExport type="users" />
        <BulkImportExport type="roles" />
        <BulkImportExport type="permissions" />
        <Table
          dataSource={users || []}
          loading={
            isLoading ||
            deactivateUser.isPending ||
            reactivateUser.isPending ||
            bulkAssignRoles.isPending
          }
          columns={columns}
          rowKey="id"
          bordered={true}
          style={{ background: "#1a1a1a", color: "#fff", borderRadius: 12 }}
          pagination={{ pageSize: 12, showSizeChanger: false }}
          rowSelection={rowSelection}
        />
      </Space>

      {/* Bulk Assign Role Modal */}
      <Modal
        title="Bulk Assign Role"
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        onOk={handleBulkAssign}
        confirmLoading={bulkAssignRoles.isPending}
        destroyOnHidden
      >
        <Form layout="vertical">
          <Form.Item label="Select Role">
            <Select
              showSearch
              placeholder="Select role to assign"
              options={roles?.map((r) => ({ label: r.name, value: r.id }))}
              loading={loadingRoles}
              value={bulkRoleId}
              onChange={setBulkRoleId}
            />
          </Form.Item>
          <Form.Item label="Permissions">
            <PermissionSelector
              value={selectedPerms}
              onChange={setSelectedPerms}
            />
          </Form.Item>
        </Form>
      </Modal>
      <TestAbacModal
        open={testAbacOpen}
        onClose={() => setTestAbacOpen(false)}
      />

      {/* View User Roles Modal */}
      <Modal
        title={
          viewRolesUser ? `Roles for ${viewRolesUser.email}` : "User Roles"
        }
        open={!!viewRolesUser}
        onCancel={() => setViewRolesUser(null)}
        footer={null}
        destroyOnHidden
      >
        {viewRolesUser?.roles && viewRolesUser.roles.length > 0 ? (
          <ul>
            {viewRolesUser.roles.map((role, idx) => (
              <li key={role || idx}>
                <Tag color="geekblue">
                  <KeyOutlined /> {role}
                </Tag>
              </li>
            ))}
          </ul>
        ) : (
          <Text type="secondary">No roles assigned to this user.</Text>
        )}
        {viewRolesUser && <UserEffectivePermissions user={viewRolesUser} />}
      </Modal>

      {/* User Audit History Modal */}
      {auditUser && (
        <UserAuditHistoryModal
          user={auditUser}
          onClose={() => setAuditUser(null)}
        />
      )}
      {auditUser && (
        <UserAuditModal
          user={auditUser}
          open={!!auditUser}
          onClose={() => setAuditUser(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;

// In the user details modal or user row expansion:
// <UserEffectivePermissions user={selectedUser} />
