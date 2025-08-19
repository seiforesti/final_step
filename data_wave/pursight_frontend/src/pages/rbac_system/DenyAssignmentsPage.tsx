import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  Typography,
  message,
  Tag,
  Radio,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useDenyAssignments,
  useCreateDenyAssignment,
  useDeleteDenyAssignment,
  useUsers,
  useGroups,
  useConditionTemplates,
} from "../../api/rbac";
import { ConditionSelector } from "../../components/rbac";

const { Title } = Typography;
const { Option } = Select;

const DenyAssignmentsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<"user" | "group" | undefined>(
    undefined
  );
  const [filterId, setFilterId] = useState<number | undefined>(undefined);
  const { data: users } = useUsers();
  const { data: groups } = useGroups();
  const { data: conditionTemplates } = useConditionTemplates();
  const {
    data: denyAssignments,
    refetch,
    isLoading,
  } = useDenyAssignments(
    filterType && filterId
      ? { principal_type: filterType, principal_id: filterId }
      : {}
  );
  const createDeny = useCreateDenyAssignment();
  const deleteDeny = useDeleteDenyAssignment();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      createDeny.mutate(values, {
        onSuccess: () => {
          message.success("Deny assignment created");
          setModalOpen(false);
          refetch();
        },
        onError: () => message.error("Failed to create deny assignment"),
      });
    });
  };

  const handleDelete = (id: number) => {
    deleteDeny.mutate(id, {
      onSuccess: () => {
        message.success("Deny assignment deleted");
        refetch();
      },
      onError: () => message.error("Failed to delete deny assignment"),
    });
  };

  const columns = [
    {
      title: "Principal",
      dataIndex: "principal",
      key: "principal",
      render: (_: any, record: any) => (
        <Tag color={record.principal_type === "user" ? "blue" : "purple"}>
          {record.principal_type === "user"
            ? users?.find((u) => u.id === record.principal_id)?.email ||
              `User #${record.principal_id}`
            : groups?.find((g) => g.id === record.principal_id)?.name ||
              `Group #${record.principal_id}`}
        </Tag>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text: string) => <Tag color="red">{text}</Tag>,
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
    },
    {
      title: "Conditions",
      dataIndex: "conditions",
      key: "conditions",
      render: (cond: any) =>
        cond ? (
          <pre style={{ margin: 0 }}>
            {typeof cond === "string" ? cond : JSON.stringify(cond, null, 2)}
          </pre>
        ) : (
          <span>-</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Popconfirm
          title="Delete this deny assignment?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button icon={<DeleteOutlined />} danger size="small">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>Deny Assignments</Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Deny Assignment
        </Button>
        <Radio.Group
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setFilterId(undefined);
          }}
          buttonStyle="solid"
        >
          <Radio.Button value={undefined}>All</Radio.Button>
          <Radio.Button value="user">User</Radio.Button>
          <Radio.Button value="group">Group</Radio.Button>
        </Radio.Group>
        {filterType && (
          <Select
            showSearch
            style={{ width: 180 }}
            placeholder={`Select ${filterType}`}
            value={filterId}
            onChange={setFilterId}
            optionFilterProp="children"
            filterOption={(input, option) =>
              typeof option?.children === "string" &&
              (option.children as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            allowClear
          >
            {(filterType === "user" ? users : groups)?.map((item: any) => (
              <Option key={item.id} value={item.id}>
                {filterType === "user" ? item.email : item.name}
              </Option>
            ))}
          </Select>
        )}
      </Space>
      <Table
        columns={columns}
        dataSource={denyAssignments || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
      />
      <Modal
        title="Create Deny Assignment"
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="principal_type"
            label="Principal Type"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="user">User</Radio>
              <Radio value="group">Group</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            shouldUpdate={(prev, curr) =>
              prev.principal_type !== curr.principal_type
            }
            noStyle
          >
            {({ getFieldValue }) => {
              const type = getFieldValue("principal_type");
              return type ? (
                <Form.Item
                  name="principal_id"
                  label={type === "user" ? "User" : "Group"}
                  rules={[{ required: true }]}
                >
                  <Select
                    showSearch
                    placeholder={`Select ${type}`}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      typeof option?.children === "string" &&
                      (option.children as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {(type === "user" ? users : groups)?.map((item: any) => (
                      <Option key={item.id} value={item.id}>
                        {type === "user" ? item.email : item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
          <Form.Item name="action" label="Action" rules={[{ required: true }]}>
            <Input placeholder="e.g. read, write, delete" />
          </Form.Item>
          <Form.Item
            name="resource"
            label="Resource"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. dataset:123, *" />
          </Form.Item>
          <Form.Item name="conditions" label="Conditions (JSON, optional)">
            <ConditionSelector
              value={form.getFieldValue("conditions")}
              onChange={(val) => form.setFieldValue("conditions", val)}
              templates={conditionTemplates}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DenyAssignmentsPage;
