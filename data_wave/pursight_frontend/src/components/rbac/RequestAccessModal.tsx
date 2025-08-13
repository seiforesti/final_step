import React, { useState } from "react";
import { Modal, Form, Select, Input, Button, message } from "antd";
import { useRequestAccess, useRoles } from "../../api/rbac";

const RequestAccessModal: React.FC<{
  open: boolean;
  onClose: () => void;
  userId: number;
  resourceType: string;
  resourceId: string;
}> = ({ open, onClose, userId, resourceType, resourceId }) => {
  const { data: roles } = useRoles();
  const requestAccess = useRequestAccess();
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await requestAccess.mutateAsync({
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
        requested_role: values.role,
        justification: values.justification,
      });
      message.success("Access request submitted");
      onClose();
      form.resetFields();
    } catch (e) {
      message.error("Failed to submit request");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      title="Request Access"
      okText="Submit"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select placeholder="Select role">
            {roles?.map((r) => (
              <Select.Option key={r.id} value={r.name}>
                {r.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="justification"
          label="Justification"
          rules={[{ required: true }]}
        >
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RequestAccessModal;
