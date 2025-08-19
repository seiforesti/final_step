import React from "react";
import { Table, Button, Typography } from "antd";
import { PlusOutlined, ApiOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ServicePrincipalManagement: React.FC = () => {
  // TODO: Integrate with backend endpoints
  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#fff" }}>
        Service Principal Management
      </Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
      >
        New Service Principal
      </Button>
      <Table columns={[]} dataSource={[]} rowKey="id" bordered={true} />
      {/* Implement service principal CRUD and assignment here */}
    </div>
  );
};

export default ServicePrincipalManagement;
