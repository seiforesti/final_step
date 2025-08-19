import React from "react";
import { Button, Modal, Input, message, Spin, Table, Space } from "antd";
import {
  useConditionTemplates,
  usePrebuiltConditionTemplates,
  useCreateConditionTemplate,
  useUpdateConditionTemplate,
  useDeleteConditionTemplate,
  ConditionTemplate,
} from "../../api/rbac";

const ConditionsPage: React.FC = () => {
  // Fetch condition templates and prebuilt templates
  const { data: templates, isLoading: templatesLoading } =
    useConditionTemplates();
  const { data: prebuiltTemplates, isLoading: prebuiltLoading } =
    usePrebuiltConditionTemplates();
  const createTemplate = useCreateConditionTemplate();
  const updateTemplate = useUpdateConditionTemplate();
  const deleteTemplate = useDeleteConditionTemplate();

  // UI state for CRUD
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editMode, setEditMode] = React.useState<null | ConditionTemplate>(
    null
  );
  const [selectedPrebuilt, setSelectedPrebuilt] = React.useState<string>("");
  const [customLabel, setCustomLabel] = React.useState("");
  const [customValue, setCustomValue] = React.useState("");
  const [customDescription, setCustomDescription] = React.useState("");

  // Add or edit handler
  const handleSave = async () => {
    // Check for duplicate label in existing templates
    const labelToCheck = selectedPrebuilt ? selectedPrebuilt : customLabel;
    if (
      labelToCheck &&
      templates?.some(
        (t) =>
          t.label.trim().toLowerCase() === labelToCheck.trim().toLowerCase()
      )
    ) {
      message.error("A condition template with this label already exists.");
      return;
    }
    if (selectedPrebuilt) {
      // Create from prebuilt
      const prebuilt = prebuiltTemplates?.find(
        (t) => t.label === selectedPrebuilt
      );
      if (!prebuilt) return;
      await createTemplate.mutateAsync({ ...prebuilt, from_prebuilt: true });
    } else if (customLabel && customValue) {
      // Custom
      await createTemplate.mutateAsync({
        label: customLabel,
        value: customValue,
        description: customDescription,
      });
    } else {
      message.error(
        "Please select a prebuilt or enter custom label and value."
      );
      return;
    }
    setModalVisible(false);
    setSelectedPrebuilt("");
    setCustomLabel("");
    setCustomValue("");
    setCustomDescription("");
  };

  return (
    <div>
      <h2>Condition Templates Management</h2>
      <Button
        type="primary"
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Add Condition Template
      </Button>
      <Modal
        open={modalVisible}
        title={editMode ? "Edit Condition Template" : "Add Condition Template"}
        onCancel={() => {
          setModalVisible(false);
          setEditMode(null);
        }}
        onOk={handleSave}
        okText={editMode ? "Save" : "Add"}
      >
        <div>
          <label>Prebuilt Templates:</label>
          {prebuiltLoading ? (
            <Spin />
          ) : (
            <select
              style={{ width: "100%", marginBottom: 8 }}
              value={selectedPrebuilt}
              onChange={(e) => setSelectedPrebuilt(e.target.value)}
            >
              <option value="">-- Select --</option>
              {prebuiltTemplates?.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
          <div style={{ margin: "8px 0", textAlign: "center" }}>or</div>
          <label>Custom Label:</label>
          <Input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Label"
          />
          <label>Custom Value (JSON):</label>
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder='{"department": "HR"}'
          />
          <label>Description:</label>
          <Input
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="Description"
          />
        </div>
      </Modal>
      <h3>Existing Templates</h3>
      <Table
        dataSource={templates || []}
        rowKey="id"
        columns={[
          { title: "Label", dataIndex: "label" },
          { title: "Value", dataIndex: "value" },
          { title: "Description", dataIndex: "description" },
          {
            title: "Actions",
            key: "actions",
            render: (_, record: ConditionTemplate) => (
              <Space>
                <Button
                  onClick={() => {
                    setEditMode(record);
                    setCustomLabel(record.label);
                    setCustomValue(record.value);
                    setCustomDescription(record.description || "");
                    setModalVisible(true);
                  }}
                >
                  Edit
                </Button>
                {typeof record.id === "number" ? (
                  <Button
                    danger
                    onClick={() => deleteTemplate.mutate(record.id as number)}
                  >
                    Delete
                  </Button>
                ) : (
                  <span style={{ color: "orange" }}>No ID</span>
                )}
              </Space>
            ),
          },
        ]}
        loading={templatesLoading}
      />
    </div>
  );
};

export default ConditionsPage;
