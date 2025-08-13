import React, { useState } from "react";
import { Table, Button, Input, Modal, Form, Space, Typography, Tag, message, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined, TeamOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

interface Group {
  id: number;
  name: string;
  members: { id: number; email: string }[];
}

const fetchGroups = async (): Promise<Group[]> => (await axios.get("/sensitivity-labels/rbac/groups")).data;
const createGroup = async (group: { name: string }) => (await axios.post("/sensitivity-labels/rbac/groups", group)).data;
const deleteGroup = async (groupId: number) => axios.delete(`/sensitivity-labels/rbac/groups/${groupId}`);

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    setLoading(true);
    fetchGroups().then(setGroups).finally(() => setLoading(false));
  }, []);

  const handleCreateGroup = async (values: { name: string }) => {
    try {
      await createGroup(values);
      message.success("Group created");
      setModalOpen(false);
      form.resetFields();
      setLoading(true);
      setGroups(await fetchGroups());
    } catch {
      message.error("Failed to create group");
    }
  };
  const handleDeleteGroup = async (groupId: number) => {
    try {
      await deleteGroup(groupId);
      message.success("Group deleted");
      setLoading(true);
      setGroups(await fetchGroups());
    } catch {
      message.error("Failed to delete group");
    }
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

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
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (members: { id: number; email: string }[]) => (
        <Space wrap>
          {members.map(m => <Tag color="geekblue" key={m.id}>{m.email}</Tag>)}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Group) => (
        <Space>
          <Tooltip title="Delete group">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteGroup(record.id)}
              style={{ background: '#23272f', color: '#ff7875', border: 'none' }}
            >Delete</Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#181c24', minHeight: '100vh' }}>
      <Title level={3} style={{ color: '#fff', marginBottom: 24 }}>Group Management (RBAC Admin)</Title>
      <Space style={{ marginBottom: 16, width: '100%' }} align="center">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search groups..."
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
          New Group
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredGroups}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 12, showSizeChanger: false }}
        bordered
        style={{ background: '#1a1a1a', color: '#fff', borderRadius: 12 }}
      />
      <Modal
        title="Create New Group"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateGroup}
        >
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: "Please enter a group name" }]}
          >
            <Input autoFocus placeholder="Group name" />
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

export default GroupManagement;
