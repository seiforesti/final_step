import React from "react";
import { Table, Button, Modal, Form, Input, Dropdown, Menu, Space } from "antd";
import { DownloadOutlined, LinkOutlined } from "@ant-design/icons";
import {
  ConditionSelector,
  TestAbacModal,
  CsvExport,
  TimelineAuditView,
  AdvancedJsonDiffView
} from "../../components/rbac";
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  useRoles,
  useAssignPermissionToRole,
  useRemovePermissionFromRole,
  useEntityAuditLogs,
  AuditLog,
  useConditionTemplates,
} from "../../api/rbac";
import { saveAs } from "file-saver";

const PermissionsPage: React.FC = () => {
  const { data: permissions, isLoading } = usePermissions();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();
  const { data: roles } = useRoles();
  const assignPermissionToRole = useAssignPermissionToRole();
  const removePermissionFromRole = useRemovePermissionFromRole();
  const { data: conditionTemplates } = useConditionTemplates();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<any>(null);
  const [form] = Form.useForm();
  const [testAbacOpen, setTestAbacOpen] = React.useState(false);
  const [testAbacInitial, setTestAbacInitial] = React.useState<any>(null);
  const [auditPermission, setAuditPermission] = React.useState<any | null>(
    null
  );
  const [assignModal, setAssignModal] = React.useState<{
    open: boolean;
    permission: any | null;
    roleId: number | null;
  }>({ open: false, permission: null, roleId: null });
  const [unassignModal, setUnassignModal] = React.useState<{
    open: boolean;
    permission: any | null;
    roleId: number | null;
  }>({ open: false, permission: null, roleId: null });
  const [deleteModal, setDeleteModal] = React.useState<{
    open: boolean;
    permission: any | null;
  }>({ open: false, permission: null });

  const handleCreate = () => {
    form.resetFields();
    setEditing(null);
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (permission: any) => {
    setDeleteModal({ open: true, permission });
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const action = values.action?.trim();
        const resource = values.resource?.trim();
        if (!action || !resource) {
          form.setFields([
            {
              name: "action",
              errors: !action ? ["Action is required"] : [],
            },
            {
              name: "resource",
              errors: !resource ? ["Resource is required"] : [],
            },
          ]);
          return;
        }
        let conditions = values.conditions;
        if (typeof conditions === "object" && conditions !== null) {
          try {
            conditions = JSON.stringify(conditions);
          } catch {
            conditions = "";
          }
        }
        if (editing) {
          updatePermission.mutate(
            {
              permissionId: editing.id,
              action,
              resource,
              conditions,
            },
            {
              onSuccess: () => {
                form.resetFields();
                setModalVisible(false);
              },
              onError: (err) => {
                console.error("Update permission error:", err);
              },
            }
          );
        } else {
          createPermission.mutate(
            { action, resource, conditions },
            {
              onSuccess: () => {
                form.resetFields();
                setModalVisible(false);
              },
              onError: (err) => {
                console.error("Create permission error:", err);
              },
            }
          );
        }
      })
      .catch((err) => {
        console.error("Permission form validation failed:", err);
      });
  };

  const handleAssignOk = () => {
    if (assignModal.permission && assignModal.roleId !== null) {
      assignPermissionToRole.mutate(
        {
          roleId: assignModal.roleId as number,
          permissionId: assignModal.permission.id,
        },
        {
          onSuccess: () =>
            setAssignModal({ open: false, permission: null, roleId: null }),
        }
      );
    }
  };
  const handleUnassignOk = () => {
    if (unassignModal.permission && unassignModal.roleId !== null) {
      removePermissionFromRole.mutate(
        {
          roleId: unassignModal.roleId as number,
          permissionId: unassignModal.permission.id,
        },
        {
          onSuccess: () =>
            setUnassignModal({ open: false, permission: null, roleId: null }),
        }
      );
    }
  };
  const handleDeleteOk = () => {
    if (deleteModal.permission) {
      deletePermission.mutate(deleteModal.permission.id, {
        onSuccess: () => setDeleteModal({ open: false, permission: null }),
      });
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Action", dataIndex: "action" },
    { title: "Resource", dataIndex: "resource" },
    {
      title: "Conditions",
      dataIndex: "conditions",
      render: (val: string) => (
        <span style={{ fontFamily: "monospace" }}>{val}</span>
      ),
    },
    {
      title: "Assigned Roles",
      render: (_: any, record: any) => {
        const assignedRoles = (roles || []).filter((role: any) =>
          (role.permissions || []).some((p: any) => p.id === record.id)
        );
        return (
          <>
            {assignedRoles.map((role: any) => (
              <span key={role.id} style={{ marginRight: 8 }}>
                {role.name}
              </span>
            ))}
          </>
        );
      },
    },
    {
      title: "Assign/Unassign to Role",
      render: (_: any, record: any) => (
        <>
          <Button
            onClick={() =>
              setAssignModal({ open: true, permission: record, roleId: null })
            }
            type="link"
          >
            Assign
          </Button>
          <Button
            onClick={() =>
              setUnassignModal({ open: true, permission: record, roleId: null })
            }
            type="link"
            danger
          >
            Unassign
          </Button>
        </>
      ),
    },
    {
      title: "Test ABAC",
      render: (_: any, record: any) => (
        <Button
          size="small"
          onClick={() => {
            setTestAbacInitial({
              permissionId: record.id ? String(record.id) : undefined,
              conditions: record.conditions || "",
            });
            setTestAbacOpen(true);
          }}
        >
          Test
        </Button>
      ),
    },
    {
      title: "Actions",
      render: (_: any, record: any) => (
        <>
          <Button onClick={() => handleEdit(record)} type="link">
            Edit
          </Button>
          <Button onClick={() => handleDelete(record)} type="link" danger>
            Delete
          </Button>
        </>
      ),
    },
    {
      title: "Audit",
      key: "audit",
      render: (_: any, rec: any) => (
        <Button size="small" onClick={() => setAuditPermission(rec)}>
          Audit
        </Button>
      ),
    },
  ];

  const PermissionAuditModal: React.FC<{
    permission: any | null;
    open: boolean;
    onClose: () => void;
  }> = ({ permission, open, onClose }) => {
    const { data: logs, isLoading } = useEntityAuditLogs(
      "permission",
      permission?.id?.toString() || ""
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
      saveAs(blob, `permission_audit_logs_${permission?.id || "all"}.json`);
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
        title={
          permission
            ? `Audit History for Permission #${permission.id}`
            : "Permission Audit History"
        }
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
            filename={`permission_audit_logs_${permission?.id || "all"}.csv`}
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
                {
                  title: "Timestamp",
                  dataIndex: "timestamp",
                  key: "timestamp",
                },
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

  return (
    <div>
      <h2>Permissions Management</h2>
      <Button
        type="primary"
        onClick={handleCreate}
        style={{ marginBottom: 16 }}
      >
        Create Permission
      </Button>
      <Button
        onClick={() => {
          setTestAbacInitial(null);
          setTestAbacOpen(true);
        }}
        style={{ marginLeft: 8 }}
      >
        Test ABAC
      </Button>
      <Table
        dataSource={permissions || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
      />
      <Modal
        open={modalVisible}
        title={editing ? "Edit Permission" : "Create Permission"}
        onCancel={() => setModalVisible(false)}
        onOk={handleOk}
        okText={editing ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="action" label="Action" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="resource"
            label="Resource"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="conditions" label="Conditions">
            <ConditionSelector
              value={form.getFieldValue("conditions")}
              onChange={(val) => form.setFieldValue("conditions", val)}
              templates={conditionTemplates}
            />
          </Form.Item>
        </Form>
        <TestAbacModal
          open={testAbacOpen}
          onClose={() => {
            setTestAbacOpen(false);
            setTestAbacInitial(null);
          }}
          initialValues={testAbacInitial}
        />
      </Modal>
      {/* Assign Modal */}
      <Modal
        open={assignModal.open}
        title="Assign Permission to Role"
        onCancel={() =>
          setAssignModal({ open: false, permission: null, roleId: null })
        }
        onOk={handleAssignOk}
        okButtonProps={{ disabled: !assignModal.roleId }}
      >
        <div>
          <p>Select a role to assign this permission:</p>
          <select
            value={assignModal.roleId ?? ""}
            onChange={(e) =>
              setAssignModal((m) => ({
                ...m,
                roleId: Number(e.target.value) || null,
              }))
            }
            style={{ width: "100%" }}
          >
            <option value="">-- Select Role --</option>
            {(roles || []).map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </Modal>
      {/* Unassign Modal */}
      <Modal
        open={unassignModal.open}
        title="Unassign Permission from Role"
        onCancel={() =>
          setUnassignModal({ open: false, permission: null, roleId: null })
        }
        onOk={handleUnassignOk}
        okButtonProps={{ disabled: !unassignModal.roleId }}
      >
        <div>
          <p>Select a role to unassign this permission:</p>
          <select
            value={unassignModal.roleId ?? ""}
            onChange={(e) =>
              setUnassignModal((m) => ({
                ...m,
                roleId: Number(e.target.value) || null,
              }))
            }
            style={{ width: "100%" }}
          >
            <option value="">-- Select Role --</option>
            {(roles || [])
              .filter((role: any) =>
                (role.permissions || []).some(
                  (p: any) => p.id === unassignModal.permission?.id
                )
              )
              .map((role: any) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
          </select>
        </div>
      </Modal>
      {/* Delete Modal */}
      <Modal
        open={deleteModal.open}
        title="Delete Permission"
        onCancel={() => setDeleteModal({ open: false, permission: null })}
        onOk={handleDeleteOk}
        okButtonProps={{ danger: true }}
      >
        <div>Are you sure you want to delete this permission?</div>
      </Modal>
      {auditPermission && (
        <PermissionAuditModal
          permission={auditPermission}
          open={!!auditPermission}
          onClose={() => setAuditPermission(null)}
        />
      )}
    </div>
  );
};

export default PermissionsPage;
