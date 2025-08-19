import React from "react";
import { Button, Modal, Form, Input, Select } from "antd";
import { useTestAbac, useUsers, usePermissions } from "../../api/rbac";

interface TestAbacModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: {
    userId?: string | number;
    permissionId?: string | number;
    conditions?: string;
  };
}

const TestAbacModal: React.FC<TestAbacModalProps> = ({
  open,
  onClose,
  initialValues,
}) => {
  const { data: users } = useUsers();
  const { data: permissions } = usePermissions();
  const testAbac = useTestAbac();

  const [form] = Form.useForm();
  const [result, setResult] = React.useState<string | null>(null);

  // Set initial values when modal opens
  React.useEffect(() => {
    if (open && initialValues) {
      // Always ensure conditions is a stringified JSON
      let conditionStr = initialValues.conditions;
      if (typeof conditionStr === "object" && conditionStr !== null) {
        try {
          conditionStr = JSON.stringify(conditionStr, null, 2);
        } catch {
          conditionStr = "{}";
        }
      } else if (typeof conditionStr !== "string" || !conditionStr) {
        conditionStr = "{}";
      }
      form.setFieldsValue({ ...initialValues, conditions: conditionStr });
    } else if (!open) {
      form.resetFields();
      setResult(null);
    }
  }, [open, initialValues, form]);

  const handleTest = async () => {
    const values = await form.validateFields();
    const userIdNum = Number(values.userId);
    const permissionIdNum = Number(values.permissionId);
    const perm = permissions?.find(
      (p: any) => String(p.id) === String(permissionIdNum)
    );
    if (!perm) {
      setResult("No permission selected");
      return;
    }
    const payload = {
      user_id: userIdNum,
      action: perm.action,
      resource: perm.resource,
      conditions: values.conditions
        ? typeof values.conditions === "string" && values.conditions.trim()
          ? JSON.parse(values.conditions)
          : {}
        : {},
    };
    console.log("[TestAbacModal] Sending payload to backend:", payload);
    try {
      const { data } = await testAbac.mutateAsync(payload);
      console.log("[TestAbacModal] Backend response:", data);
      setResult(data.allowed ? "Access Allowed" : "Access Denied");
    } catch (e: any) {
      console.error("[TestAbacModal] Error from backend:", e);
      setResult(e?.response?.data?.detail || "Test failed");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleTest}
      okText="Test Access"
      title="Test ABAC Access"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="userId" label="User" rules={[{ required: true }]}>
          <Select
            options={users?.map((u: any) => ({
              label: u.email,
              value: String(u.id),
            }))}
            onChange={(val) => form.setFieldValue("userId", val)}
          />
        </Form.Item>
        <Form.Item
          name="permissionId"
          label="Permission"
          rules={[{ required: true }]}
        >
          <Select
            options={permissions?.map((p: any) => ({
              label: `${p.action} on ${p.resource}`,
              value: String(p.id),
            }))}
            onChange={(val) => {
              form.setFieldValue("permissionId", val);
              // When permission changes, update the conditions field to the prebuilt condition
              const perm = permissions?.find(
                (p: any) => String(p.id) === String(val)
              );
              let conditionStr = "";
              if (perm) {
                if (
                  typeof perm.conditions === "object" &&
                  perm.conditions !== null
                ) {
                  try {
                    conditionStr = JSON.stringify(perm.conditions, null, 2);
                  } catch {
                    conditionStr = "{}";
                  }
                } else if (
                  typeof perm.conditions === "string" &&
                  perm.conditions
                ) {
                  conditionStr = perm.conditions;
                } else {
                  conditionStr = "{}";
                }
              }
              form.setFieldValue("conditions", conditionStr);
            }}
          />
        </Form.Item>
        <Form.Item name="conditions" label="Conditions (JSON)">
          <Input.TextArea rows={4} autoSize={{ minRows: 2, maxRows: 8 }} />
        </Form.Item>
      </Form>
      {result && (
        <div
          style={{
            marginTop: 16,
            color: result === "Access Allowed" ? "green" : "red",
          }}
        >
          {result}
        </div>
      )}
    </Modal>
  );
};

export default TestAbacModal;
