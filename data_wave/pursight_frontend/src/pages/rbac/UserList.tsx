import React from "react";
import { Table, Button, Tag, Select, Space, Typography, message } from "antd";
import { PlusOutlined, DeleteOutlined, CheckOutlined, StopOutlined, UserAddOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRBAC } from "../../hooks/useRBAC";

const { Title } = Typography;

interface User {
  id: number;
  email: string;
  roles: string[];
  is_active: boolean;
}
interface Role {
  id: number;
  name: string;
}

const fetchUsers = async (): Promise<User[]> => (await axios.get("/sensitivity-labels/users")).data;
const fetchRoles = async (): Promise<Role[]> => (await axios.get("/sensitivity-labels/rbac/roles")).data;
const assignRole = async ({ userId, roleId }: { userId: number; roleId: number }) => axios.post("/sensitivity-labels/users/bulk-assign-roles", { user_ids: [userId], role_id: roleId });
const removeRole = async ({ userId, roleId }: { userId: number; roleId: number }) => axios.post(`/sensitivity-labels/users/${userId}/remove-role`, { role_id: roleId });
const deactivateUser = async (userId: number) => axios.post(`/sensitivity-labels/users/${userId}/deactivate`);
const activateUser = async (userId: number) => axios.post(`/sensitivity-labels/users/${userId}/activate`);

const UserList: React.FC = () => {
  const { canManageRBAC } = useRBAC();
  const queryClient = useQueryClient();
  const { data: users, isLoading, error } = useQuery<User[]>({ queryKey: ["rbac", "users"], queryFn: fetchUsers });
  const { data: roles } = useQuery<Role[]>({ queryKey: ["rbac", "roles"], queryFn: fetchRoles });
  const assignRoleMutation = useMutation({ mutationFn: assignRole, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rbac", "users"] }); message.success("Role assigned"); }, onError: () => message.error("Failed to assign role") });
  const removeRoleMutation = useMutation({ mutationFn: removeRole, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rbac", "users"] }); message.success("Role removed"); }, onError: () => message.error("Failed to remove role") });
  const deactivateUserMutation = useMutation({ mutationFn: deactivateUser, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rbac", "users"] }); message.success("User deactivated"); }, onError: () => message.error("Failed to deactivate user") });
  const activateUserMutation = useMutation({ mutationFn: activateUser, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["rbac", "users"] }); message.success("User reactivated"); }, onError: () => message.error("Failed to reactivate user") });
  const [selectedRole, setSelectedRole] = React.useState<{ [userId: number]: number | null }>({});

  if (!canManageRBAC()) {
    return <div>Access Denied: You do not have permission to view users.</div>;
  }
  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Failed to load users.</div>;

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Email", dataIndex: "email", key: "email", render: (email: string) => <span style={{ color: '#fff' }}>{email}</span> },
    { title: "Roles", dataIndex: "roles", key: "roles", render: (roleNames: string[], record: User) => (
      <Space wrap>
        {roleNames.map((roleName) => {
          const roleObj = roles?.find((r) => r.name === roleName);
          return (
            <Tag color="geekblue" key={roleName}>
              {roleName}
              {roleObj && (
                <Button size="small" type="link" icon={<DeleteOutlined />} onClick={() => removeRoleMutation.mutate({ userId: record.id, roleId: roleObj.id })} disabled={removeRoleMutation.isPending} />
              )}
            </Tag>
          );
        })}
      </Space>
    ) },
    { title: "Status", dataIndex: "is_active", key: "is_active", render: (is_active: boolean, record: User) => (
      is_active ? (
        <Button icon={<StopOutlined />} danger onClick={() => deactivateUserMutation.mutate(record.id)} disabled={deactivateUserMutation.isPending}>Deactivate</Button>
      ) : (
        <Button icon={<CheckOutlined />} type="primary" onClick={() => activateUserMutation.mutate(record.id)} disabled={activateUserMutation.isPending}>Reactivate</Button>
      )
    ) },
    { title: "Assign Role", key: "assign_role", render: (_: any, record: User) => (
      <Space>
        <Select style={{ width: 160 }} placeholder="Assign role..." value={selectedRole[record.id] ?? undefined} onChange={(val) => setSelectedRole((prev) => ({ ...prev, [record.id]: val }))} options={roles?.map((r) => ({ label: r.name, value: r.id }))} allowClear />
        <Button icon={<UserAddOutlined />} type="primary" disabled={assignRoleMutation.isPending || !selectedRole[record.id]} onClick={() => { if (selectedRole[record.id]) assignRoleMutation.mutate({ userId: record.id, roleId: selectedRole[record.id]! }); }}>Assign</Button>
      </Space>
    ) },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: '#fff' }}>User List (RBAC Admin Only)</Title>
      <Table columns={columns} dataSource={users} rowKey="id" pagination={false} bordered style={{ background: '#1a1a1a', color: '#fff' }} />
    </div>
  );
};

export default UserList;
