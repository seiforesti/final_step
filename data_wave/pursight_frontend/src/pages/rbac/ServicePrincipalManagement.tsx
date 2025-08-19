import React, { useState } from "react";
import { Table, Button, Input, Modal, Form, Space, Typography, Tag, message, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined, ApiOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

interface ServicePrincipal {
  id: number;
  name: string;
  description?: string;
}

const fetchServicePrincipals = async (): Promise<ServicePrincipal[]> => (await axios.get("/sensitivity-labels/rbac/service-principals")).data;
const createServicePrincipal = async (sp: { name: string; description?: string }) => (await axios.post("/sensitivity-labels/rbac/service-principals", sp)).data;
const deleteServicePrincipal = async (id: number) => axios.delete(`/sensitivity-labels/rbac/service-principals/${id}`);

const ServicePrincipalManagement: React.FC = () => {
  const [principals, setPrincipals] = useState<ServicePrincipal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    setLoading(true);
    fetchServicePrincipals().then(setPrincipals).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (values: { name: string; description?: string }) => {
    try {
      await createServicePrincipal(values);
      message.success("Service principal created");
      setModalOpen(false);
      form.resetFields();
      setLoading(true);
      setPrincipals(await fetchServicePrincipals());
    } catch {
      message.error("Failed to create service principal");
    }
  };
  const handleDelete = async (id: number) => {
    try {
      await deleteServicePrincipal(id);
      message.success("Service principal deleted");
      setLoading(true);
      setPrincipals(await fetchServicePrincipals());
    } catch {
      message.error("Failed to delete service principal");
    }
  };

  const filteredPrincipals = principals.filter(sp => sp.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span style={{ color: '#fff', fontWeight: 500 }}>{name}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => desc || <span style={{ color: '#888' }}>None</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ServicePrincipal) => (
        <Space>
          <Tooltip title="Delete service principal">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
              style={{ background: '#23272f', color: '#ff7875', border: 'none' }}
            >Delete</Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#181c24', minHeight: '100vh' }}>
      <Title level={3} style={{ color: '#fff', marginBottom: 24 }}>Service Principal Management (RBAC Admin)</Title>
      <Space style={{ marginBottom: 16, width: '100%' }} align="center">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search service principals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 260, background: '#23272f', color: '#fff', border: 'none' }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          style={{ background: '#722ed1', border: 'none' }}
        >
          New Service Principal
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredPrincipals}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 12, showSizeChanger: false }}
        bordered
        style={{ background: '#1a1a1a', color: '#fff', borderRadius: 12 }}
      />
      <Modal
        title="Create New Service Principal"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input autoFocus placeholder="Service principal name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Description (optional)" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: '#722ed1', border: 'none' }}
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServicePrincipalManagement;
