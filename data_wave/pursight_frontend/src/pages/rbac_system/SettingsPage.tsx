import React, { useState } from "react";
import {
  Typography,
  Card,
  List,
  Tag,
  Divider,
  Form,
  Input,
  Button,
  message,
  Space,
} from "antd";
import { useBuiltinRoles, useTestAbac } from "../../api/rbac";

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const { data: builtinRoles, isLoading: loadingBuiltin } = useBuiltinRoles();
  const testAbac = useTestAbac();
  const [form] = Form.useForm();
  const [abacResult, setAbacResult] = useState<any>(null);

  const handleAbacTest = async (values: any) => {
    try {
      const { user_id, action, resource, conditions } = values;
      const condObj = conditions ? JSON.parse(conditions) : {};
      const res = await testAbac.mutateAsync({
        user_id: Number(user_id),
        action,
        resource,
        conditions: condObj,
      });
      setAbacResult(res.data);
      message.success("ABAC test completed");
    } catch (e) {
      setAbacResult(null);
      message.error("ABAC test failed. Check input format.");
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        RBAC System Settings
      </Title>
      <Card
        title="Built-in Roles"
        loading={loadingBuiltin}
        style={{ marginBottom: 24, background: "#141414", color: "#fff" }}
      >
        <List
          dataSource={builtinRoles || []}
          renderItem={(role) => (
            <List.Item>
              <Tag color="geekblue" style={{ fontSize: 16 }}>
                {role.name}
              </Tag>
              <Text type="secondary">{role.description}</Text>
            </List.Item>
          )}
        />
      </Card>
      <Divider />
      <Card
        title="ABAC Test Utility"
        style={{ background: "#141414", color: "#fff" }}
      >
        <Form form={form} layout="vertical" onFinish={handleAbacTest}>
          <Form.Item
            name="user_id"
            label="User ID"
            rules={[{ required: true }]}
          >
            {" "}
            <Input placeholder="e.g. 1" />{" "}
          </Form.Item>
          <Form.Item name="action" label="Action" rules={[{ required: true }]}>
            {" "}
            <Input placeholder="e.g. read, write" />{" "}
          </Form.Item>
          <Form.Item
            name="resource"
            label="Resource"
            rules={[{ required: true }]}
          >
            {" "}
            <Input placeholder="e.g. database" />{" "}
          </Form.Item>
          <Form.Item name="conditions" label="Conditions (JSON)">
            {" "}
            <Input.TextArea
              placeholder='{"env": "prod"}'
              autoSize={{ minRows: 2, maxRows: 4 }}
            />{" "}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={testAbac.isPending}
            >
              Test ABAC
            </Button>
          </Form.Item>
        </Form>
        {abacResult && (
          <Space direction="vertical" style={{ marginTop: 16 }}>
            <Text strong>Result:</Text>
            <pre
              style={{
                color: "#fff",
                background: "#222",
                padding: 12,
                borderRadius: 8,
              }}
            >
              {JSON.stringify(abacResult, null, 2)}
            </pre>
          </Space>
        )}
      </Card>
      <Divider />
      <Text type="secondary">
        Advanced RBAC features and system configuration will appear here.
      </Text>
    </div>
  );
};

export default SettingsPage;
