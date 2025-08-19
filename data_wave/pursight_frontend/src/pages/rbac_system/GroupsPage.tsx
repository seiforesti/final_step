import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Typography,
  message,
  Tag,
  Select,
  Dropdown,
  Menu,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserDeleteOutlined,
  CheckOutlined,
  DownloadOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { saveAs } from "file-saver";
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAssignUserToGroup,
  useRemoveUserFromGroup,
  useAssignRoleToGroup,
  useRemoveRoleFromGroup,
  useUsers,
  useRoles,
  useEntityAuditLogs,
} from "../../api/rbac";
import type { AuditLog } from "../../api/rbac";
import {
  PermissionSelector,
  TestAbacModal,
  JsonDiffView,
  CsvExport,
  TimelineAuditView,
  AdvancedJsonDiffView
} from "../../components/rbac";
import { usePermissions } from "../../api/rbac";

const { Title } = Typography;
const { Option } = Select;

const GroupAuditModal: React.FC<{
  group: any | null;
  open: boolean;
  onClose: () => void;
}> = ({ group, open, onClose }) => {
  const { data: logs, isLoading } = useEntityAuditLogs(
    "group",
    group?.id?.toString() || ""
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
    saveAs(blob, `group_audit_logs_${group?.id || "all"}.json`);
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
      title={group ? `Audit History for ${group.name}` : "Group Audit History"}
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
          filename={`group_audit_logs_${group?.id || "all"}.csv`}
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

const GroupsPage: React.FC = () => {
  const { data: groups, isLoading, refetch } = useGroups();
  const { data: permissions } = usePermissions();

  // Helper to get up-to-date group by id
  const getGroupById = (groupId: number) =>
    (groups || []).find((g: any) => g.id === groupId) || {
      users: [],
      roles: [],
    };
  const { data: users } = useUsers();
  const { data: roles } = useRoles();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const assignUser = useAssignUserToGroup();
  const removeUser = useRemoveUserFromGroup();
  const assignRole = useAssignRoleToGroup();
  const removeRole = useRemoveRoleFromGroup();

  // Track loading state for each group assignment
  const [assigningUsers, setAssigningUsers] = useState<{
    [groupId: number]: boolean;
  }>({});
  const [assigningRoles, setAssigningRoles] = useState<{
    [groupId: number]: boolean;
  }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<any>(null);
  const [form] = Form.useForm();
  const [testAbacOpen, setTestAbacOpen] = useState(false);
  const [testAbacInitial, setTestAbacInitial] = useState<any>(null);
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [auditGroup, setAuditGroup] = useState<any | null>(null);

  const handleCreate = () => {
    form.resetFields();
    setEditGroup(null);
    setModalOpen(true);
  };

  const handleEdit = (group: any) => {
    setEditGroup(group);
    form.setFieldsValue({ name: group.name, description: group.description });
    setModalOpen(true);
  };

  const handleDelete = (groupId: number) => {
    deleteGroup.mutate(groupId, {
      onSuccess: () => {
        message.success("Group deleted");
        refetch();
      },
      onError: () => message.error("Failed to delete group"),
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editGroup) {
        updateGroup.mutate(
          { groupId: editGroup.id, ...values },
          {
            onSuccess: () => {
              message.success("Group updated");
              setModalOpen(false);
              refetch();
            },
            onError: () => message.error("Failed to update group"),
          }
        );
      } else {
        createGroup.mutate(values, {
          onSuccess: () => {
            message.success("Group created");
            setModalOpen(false);
            refetch();
          },
          onError: () => message.error("Failed to create group"),
        });
      }
    });
  };

  // Multi-select state for users and roles per group
  const [selectedUsers, setSelectedUsers] = useState<{
    [groupId: number]: number[];
  }>({});
  const [selectedRoles, setSelectedRoles] = useState<{
    [groupId: number]: number[];
  }>({});

  const handleRemoveUser = (group: any, userId: number) => {
    removeUser.mutate(
      { groupId: group.id, userId },
      {
        onSuccess: () => {
          message.success("User removed from group");
          refetch();
        },
        onError: () => message.error("Failed to remove user"),
      }
    );
  };

  const handleRemoveRole = (group: any, roleId: number) => {
    removeRole.mutate(
      { groupId: group.id, roleId },
      {
        onSuccess: () => {
          message.success("Role removed from group");
          refetch();
        },
        onError: () => message.error("Failed to remove role"),
      }
    );
  };

  const handleAddUsers = async (group: any, userIds: number[]) => {
    // Always get the latest group state
    const currentGroup = getGroupById(group.id);
    const alreadyAssigned = (currentGroup.users || []).map((u: any) => u.id);
    const toAssign = userIds.filter((id) => !alreadyAssigned.includes(id));
    if (toAssign.length === 0) {
      setSelectedUsers((prev) => ({ ...prev, [group.id]: [] }));
      return;
    }
    setAssigningUsers((prev) => ({ ...prev, [group.id]: true }));
    assignUser.mutate(
      { groupId: group.id, userIds: toAssign },
      {
        onSuccess: async () => {
          await refetch();
          setSelectedUsers((prev) => ({ ...prev, [group.id]: [] }));
          setAssigningUsers((prev) => ({ ...prev, [group.id]: false }));
          message.success("Users added to group");
        },
        onError: () => {
          setAssigningUsers((prev) => ({ ...prev, [group.id]: false }));
          message.error("Failed to add users");
        },
      }
    );
  };

  const handleAddRoles = async (group: any, roleIds: number[]) => {
    const currentGroup = getGroupById(group.id);
    const alreadyAssigned = (currentGroup.roles || []).map((r: any) => r.id);
    const toAssign = roleIds.filter((id) => !alreadyAssigned.includes(id));
    if (toAssign.length === 0) {
      setSelectedRoles((prev) => ({ ...prev, [group.id]: [] }));
      return;
    }
    setAssigningRoles((prev) => ({ ...prev, [group.id]: true }));
    assignRole.mutate(
      { groupId: group.id, roleIds: toAssign },
      {
        onSuccess: async () => {
          await refetch();
          setSelectedRoles((prev) => ({ ...prev, [group.id]: [] }));
          setAssigningRoles((prev) => ({ ...prev, [group.id]: false }));
          message.success("Roles assigned to group");
        },
        onError: () => {
          setAssigningRoles((prev) => ({ ...prev, [group.id]: false }));
          message.error("Failed to assign roles");
        },
      }
    );
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Users",
      dataIndex: "users",
      key: "users",
      render: (_: any, group: any) => (
        <Space wrap>
          {(getGroupById(group.id).users || []).map((u: any) => (
            <Tag
              key={u.id}
              closable
              onClose={() => handleRemoveUser(group, u.id)}
              icon={<UserDeleteOutlined />}
            >
              {u.email}
            </Tag>
          ))}
          <Select
            mode="multiple"
            showSearch
            style={{ width: 200 }}
            placeholder="Select users"
            onChange={(userIds) =>
              setSelectedUsers((prev) => ({
                ...prev,
                [group.id]: userIds as number[],
              }))
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              typeof option?.children === "string" &&
              (option.children as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            value={selectedUsers[group.id] || []}
          >
            {(users || [])
              .filter(
                (u) =>
                  !(getGroupById(group.id).users || []).some(
                    (gu: any) => gu.id === u.id
                  )
              )
              .map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.email}
                </Option>
              ))}
          </Select>
          <Button
            icon={<CheckOutlined />}
            type="primary"
            size="small"
            style={{ marginLeft: 4 }}
            disabled={
              !(
                selectedUsers[group.id] && selectedUsers[group.id].length > 0
              ) || assigningUsers[group.id]
            }
            loading={assigningUsers[group.id]}
            onClick={() => {
              if (
                selectedUsers[group.id] &&
                selectedUsers[group.id].length > 0
              ) {
                handleAddUsers(group, selectedUsers[group.id]);
              }
            }}
          >
            Assign
          </Button>
        </Space>
      ),
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (_: any, group: any) => (
        <Space wrap>
          {(getGroupById(group.id).roles || []).map((r: any) => (
            <Tag
              key={r.id}
              closable
              onClose={() => handleRemoveRole(group, r.id)}
            >
              {r.name}
            </Tag>
          ))}
          <Select
            mode="multiple"
            showSearch
            style={{ width: 180 }}
            placeholder="Select roles"
            onChange={(roleIds) =>
              setSelectedRoles((prev) => ({
                ...prev,
                [group.id]: roleIds as number[],
              }))
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              typeof option?.children === "string" &&
              (option.children as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            value={selectedRoles[group.id] || []}
          >
            {(roles || [])
              .filter(
                (r) =>
                  !(getGroupById(group.id).roles || []).some(
                    (gr: any) => gr.id === r.id
                  )
              )
              .map((r) => (
                <Option key={r.id} value={r.id}>
                  {r.name}
                </Option>
              ))}
          </Select>
          <Button
            icon={<CheckOutlined />}
            type="primary"
            size="small"
            style={{ marginLeft: 4 }}
            disabled={
              !(
                selectedRoles[group.id] && selectedRoles[group.id].length > 0
              ) || assigningRoles[group.id]
            }
            loading={assigningRoles[group.id]}
            onClick={() => {
              if (
                selectedRoles[group.id] &&
                selectedRoles[group.id].length > 0
              ) {
                handleAddRoles(group, selectedRoles[group.id]);
              }
            }}
          >
            Assign
          </Button>
        </Space>
      ),
    },
    {
      title: "Test ABAC",
      render: (_: any, group: any) => {
        const user = (getGroupById(group.id).users || [])[0];
        // For demo, pick the first permission, or you can show a Select for admin
        const permission =
          permissions && permissions.length > 0 ? permissions[0] : null;
        let conditionStr = "";
        if (permission) {
          if (typeof permission.conditions === "string") {
            conditionStr = permission.conditions;
          } else if (
            permission.conditions &&
            typeof permission.conditions === "object"
          ) {
            try {
              conditionStr = JSON.stringify(permission.conditions, null, 2);
            } catch {
              conditionStr = "{}";
            }
          } else {
            conditionStr = "{}";
          }
        }
        return (
          <Button
            size="small"
            onClick={() => {
              setTestAbacInitial({
                userId: user?.id ? String(user.id) : undefined,
                permissionId: permission?.id
                  ? String(permission.id)
                  : undefined,
                conditions: conditionStr,
              });
              setTestAbacOpen(true);
            }}
            disabled={!user || !permission}
          >
            Test
          </Button>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, group: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(group)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this group?"
            onConfirm={() => handleDelete(group.id)}
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              Delete
            </Button>
          </Popconfirm>
          <Button
            icon={<UserDeleteOutlined />}
            onClick={() => setAuditGroup(group)}
            size="small"
          >
            Audit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>Groups</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleCreate}
        style={{ marginBottom: 16 }}
      >
        New Group
      </Button>
      <Button onClick={() => setTestAbacOpen(true)} style={{ marginLeft: 8 }}>
        Test ABAC
      </Button>
      <Table
        columns={columns}
        dataSource={groups || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />
      <Modal
        title={editGroup ? "Edit Group" : "Create Group"}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        okText={editGroup ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter a group name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="permissions" label="Permissions">
            <PermissionSelector
              value={selectedPerms}
              onChange={setSelectedPerms}
            />
          </Form.Item>
        </Form>
      </Modal>
      <TestAbacModal
        open={testAbacOpen}
        onClose={() => {
          setTestAbacOpen(false);
          setTestAbacInitial(null);
        }}
        initialValues={testAbacInitial}
      />
      {/* Audit Modal */}
      {auditGroup && (
        <GroupAuditModal
          group={auditGroup}
          open={!!auditGroup}
          onClose={() => setAuditGroup(null)}
        />
      )}
    </div>
  );
};

export default GroupsPage;
