import React from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Dropdown,
  Menu,
} from "antd";
import {
  useRoleAssignments,
  useAssignRoleScope,
  useUsers,
  useRoles,
  useEntityAuditLogs,
  AuditLog,
} from "../../api/rbac";
import {
  ConditionSelector,
  JsonDiffView,
  CsvExport,
  TimelineAuditView,
  AdvancedJsonDiffView
} from "../../components/rbac";
import { DownloadOutlined, LinkOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";

const ResourceAssignmentsPage: React.FC = () => {
  // Fetch users and roles from backend
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  // TODO: Fetch resources from backend if available
  const resources = [
    { label: "Table: Customers", type: "table", id: "customers" },
    { label: "Dataset: Sales", type: "dataset", id: "sales" },
  ];

  const { data: assignments, isLoading } = useRoleAssignments();
  const assignRoleScope = useAssignRoleScope();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const handleAssign = () => {
    form.validateFields().then((values) => {
      assignRoleScope.mutate({
        user_id: values.user_id,
        role_id: values.role_id,
        resource_type: values.resource_type,
        resource_id: values.resource_id,
      });
      setModalVisible(false);
    });
  };

  // Fix columns typing for audit button
  const columns: any[] = [
    {
      title: "User",
      dataIndex: "user_id",
      render: (userId: number) => {
        const user = usersData?.find((u: any) => u.id === userId);
        return user ? user.email : userId;
      },
    },
    {
      title: "Role",
      dataIndex: "role_id",
      render: (roleId: number) => {
        const role = rolesData?.find((r: any) => r.id === roleId);
        return role ? role.name : roleId;
      },
    },
    { title: "Resource Type", dataIndex: "resource_type" },
    { title: "Resource ID", dataIndex: "resource_id" },
  ];

  // ResourceAuditModal logic
  const ResourceAuditModal: React.FC<{
    resourceType: string;
    resourceId: string;
    open: boolean;
    onClose: () => void;
  }> = ({ resourceType, resourceId, open, onClose }) => {
    const { data: logs, isLoading } = useEntityAuditLogs(
      resourceType,
      resourceId
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
      saveAs(blob, `resource_audit_logs_${resourceType}_${resourceId}.json`);
    };
    const correlationMenu = {
      items: filteredLogs
        .filter((log) => log.correlation_id)
        .map((log) => ({
          key: log.correlation_id!,
          icon: <LinkOutlined />,
          label: log.correlation_id,
          onClick: () => setShowCorrelation(log.correlation_id!),
        })),
    };
    return (
      <Modal
        title={`Audit History for ${resourceType}:${resourceId}`}
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
          <Dropdown menu={correlationMenu} trigger={["click"]}>
            <Button icon={<LinkOutlined />}>Correlation Chains</Button>
          </Dropdown>
          <CsvExport
            data={filteredLogs}
            filename={`resource_audit_logs_${resourceType}_${resourceId}.csv`}
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
          destroyOnHidden
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

  // Add a button to open ResourceAuditModal for each resource assignment row
  const [auditResource, setAuditResource] = React.useState<{
    type: string;
    id: string;
  } | null>(null);

  columns.push({
    title: "Audit",
    key: "audit",
    render: (_, rec) => (
      <Button
        size="small"
        onClick={() =>
          setAuditResource({ type: rec.resource_type, id: rec.resource_id })
        }
      >
        Audit
      </Button>
    ),
  });

  return (
    <div>
      <h2>Resource-Level Role Assignments</h2>
      <Button
        type="primary"
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Assign Role to Resource
      </Button>
      <Table
        dataSource={assignments || []}
        columns={columns}
        rowKey={(record: any) => record.id}
        loading={isLoading}
      />
      <Modal
        open={modalVisible}
        title="Assign Role to Resource"
        onCancel={() => setModalVisible(false)}
        onOk={handleAssign}
        okText="Assign"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="user_id" label="User" rules={[{ required: true }]}>
            <Select
              options={
                usersData?.map((u: any) => ({ label: u.email, value: u.id })) ||
                []
              }
              loading={usersLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="role_id" label="Role" rules={[{ required: true }]}>
            <Select
              options={
                rolesData?.map((r: any) => ({ label: r.name, value: r.id })) ||
                []
              }
              loading={rolesLoading}
            />
          </Form.Item>
          <Form.Item
            name="resource_type"
            label="Resource Type"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Table", value: "table" },
                { label: "Dataset", value: "dataset" },
              ]}
              onChange={(val) =>
                form.setFieldValue("resource_type", String(val))
              }
            />
          </Form.Item>
          <Form.Item
            name="resource_id"
            label="Resource"
            rules={[{ required: true }]}
          >
            <Select
              options={resources.map((r) => ({
                label: r.label,
                value: String(r.id),
              }))}
              onChange={(val) => form.setFieldValue("resource_id", String(val))}
            />
          </Form.Item>
          <Form.Item name="conditions" label="Conditions (JSON, optional)">
            <ConditionSelector
              value={form.getFieldValue("conditions")}
              onChange={(val) => form.setFieldValue("conditions", val)}
            />
          </Form.Item>
        </Form>
      </Modal>
      {auditResource && (
        <ResourceAuditModal
          resourceType={auditResource.type}
          resourceId={auditResource.id}
          open={!!auditResource}
          onClose={() => setAuditResource(null)}
        />
      )}
    </div>
  );
};

export default ResourceAssignmentsPage;
