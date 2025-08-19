import React, { useState } from "react";
import {
  Tree,
  Card,
  Typography,
  Button,
  Modal,
  Select,
  Table,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import {
  useResourceTree,
  useResourceRolesForResource,
  useAssignResourceRole,
  useEffectiveUserPermissions,
  useRoles,
  useUsers,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from "../../api/rbac";
import { TreeProps } from "antd";
import { PermissionDiffModal } from "../../components/rbac";

const { Title, Text } = Typography;

const ResourceTreePage: React.FC = () => {
  const { data: tree, isLoading } = useResourceTree();
  const [selected, setSelected] = useState<number | null>(null);
  const { data: roles } = useRoles();
  const { data: users } = useUsers();
  const { data: assignments } = useResourceRolesForResource(selected || 0);
  const { data: effectivePerms } = useEffectiveUserPermissions(selected || 0);
  const assignRole = useAssignResourceRole();
  const [assignModal, setAssignModal] = useState(false);
  const [assignUser, setAssignUser] = useState<number | null>(null);
  const [assignRoleId, setAssignRoleId] = useState<number | null>(null);
  const [crudModal, setCrudModal] = useState<{
    mode: "add" | "edit";
    parentId?: number;
    resource?: any;
  } | null>(null);
  const [resourceName, setResourceName] = useState("");
  const [resourceType, setResourceType] = useState<string | undefined>(
    undefined
  );
  const [resourceEngine, setResourceEngine] = useState<string | undefined>(
    undefined
  );
  const [resourceDetails, setResourceDetails] = useState<string>("");
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();
  const [diffModal, setDiffModal] = useState<{
    before: any[];
    after: any[];
  } | null>(null);

  function renderTree(nodes: any[]): any[] {
    return (
      nodes?.map((n) => ({
        title: `${n.name} (${n.type})`,
        key: n.id,
        children: renderTree(n.children || []),
      })) || []
    );
  }

  function getInheritedPermissions(
    userId: number,
    perms: any[],
    directPerms: any[]
  ) {
    // Returns only inherited permissions (not in directPerms)
    const directSet = new Set(directPerms.map((p) => p.id));
    return perms.filter((p) => !directSet.has(p.id));
  }

  // Drag-and-drop support for AntD Tree
  const onDrop: TreeProps["onDrop"] = async (info) => {
    // For demo: just log, in real use, update parent_id in backend
    const dragId = info.dragNode.key;
    const dropId = info.node.key;
    // Optionally, call updateResource.mutateAsync({ resourceId: dragId, parent_id: dropId })
    // and refetch tree
  };

  return (
    <div style={{ display: "flex", gap: 32 }}>
      <Card style={{ minWidth: 350, maxHeight: 700, overflow: "auto" }}>
        <Title level={5}>Resource Hierarchy</Title>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          size="small"
          style={{ marginBottom: 8 }}
          onClick={() => {
            setResourceName("");
            setResourceType(undefined);
            setResourceEngine(undefined);
            setResourceDetails("");
            setCrudModal({ mode: "add", parentId: selected || undefined });
          }}
        >
          Add Resource
        </Button>
        <Tree
          treeData={renderTree(tree || [])}
          onSelect={(keys) => setSelected(keys[0] as number)}
          selectedKeys={selected ? [selected] : []}
          showIcon
          icon={<ApartmentOutlined />}
          titleRender={(nodeData: any) => (
            <span>
              {nodeData.name} <Tag color="blue">{nodeData.type}</Tag>
              <Button
                icon={<EditOutlined />}
                size="small"
                style={{ marginLeft: 8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCrudModal({ mode: "edit", resource: nodeData });
                  setResourceName(nodeData.name);
                  setResourceType(nodeData.type);
                  setResourceEngine(nodeData.engine);
                }}
              />
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                style={{ marginLeft: 4 }}
                onClick={async (e) => {
                  e.stopPropagation();
                  await deleteResource.mutateAsync(nodeData.id);
                }}
              />
            </span>
          )}
          draggable
          onDrop={onDrop}
        />
      </Card>
      <div style={{ flex: 1 }}>
        {selected && (
          <>
            <Card style={{ marginBottom: 16 }}>
              <Title level={5}>Direct Role Assignments</Title>
              <Button
                type="primary"
                onClick={() => setAssignModal(true)}
                style={{ marginBottom: 8 }}
              >
                Assign Role
              </Button>
              <Table
                dataSource={assignments || []}
                rowKey="id"
                columns={[
                  {
                    title: "User",
                    dataIndex: "user_id",
                    render: (id) =>
                      users?.find((u) => u.id === id)?.email || id,
                  },
                  {
                    title: "Role",
                    dataIndex: "role_id",
                    render: (id) => roles?.find((r) => r.id === id)?.name || id,
                  },
                  { title: "Assigned At", dataIndex: "assigned_at" },
                ]}
                pagination={false}
              />
            </Card>
            <Card>
              <Title level={5}>Effective Permissions (All Users)</Title>
              <Table
                dataSource={Object.entries(effectivePerms || {}).map(
                  ([userId, perms]) => ({ userId, perms })
                )}
                rowKey="userId"
                columns={[
                  {
                    title: "User",
                    dataIndex: "userId",
                    render: (id) =>
                      users?.find((u) => u.id === Number(id))?.email || id,
                  },
                  {
                    title: "Direct Permissions",
                    dataIndex: "perms",
                    render: (perms) =>
                      perms?.length ? (
                        <ul
                          style={{ margin: 0, padding: 0, listStyle: "none" }}
                        >
                          {perms.map((p: any, i: number) => (
                            <li key={i}>
                              <Tag color="geekblue">{p.action}</Tag> on{" "}
                              <Tag color="purple">{p.resource}</Tag>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Text type="secondary">No direct permissions</Text>
                      ),
                  },
                  {
                    title: "Inherited Permissions",
                    dataIndex: "userId",
                    render: (userId) => {
                      // For demo: just show a placeholder, in real use, fetch inherited separately
                      return (
                        <Text type="secondary">
                          (Inherited permissions shown here)
                        </Text>
                      );
                    },
                  },
                  {
                    title: "Diff",
                    key: "diff",
                    render: (_: any, row: any) => (
                      <Button
                        size="small"
                        onClick={() =>
                          setDiffModal({ before: [], after: row.perms })
                        }
                      >
                        Diff
                      </Button>
                    ),
                  },
                ]}
                pagination={false}
              />
            </Card>
            <Modal
              open={assignModal}
              onCancel={() => setAssignModal(false)}
              onOk={async () => {
                if (assignUser && assignRoleId && selected) {
                  await assignRole.mutateAsync({
                    user_id: assignUser,
                    role_id: assignRoleId,
                    resource_id: selected,
                  });
                  setAssignModal(false);
                  setAssignUser(null);
                  setAssignRoleId(null);
                }
              }}
              title="Assign Role to Resource"
              okButtonProps={{ disabled: !assignUser || !assignRoleId }}
            >
              <Select
                style={{ width: "100%", marginBottom: 12 }}
                placeholder="Select user"
                value={assignUser}
                onChange={setAssignUser}
                options={users?.map((u) => ({ label: u.email, value: u.id }))}
              />
              <Select
                style={{ width: "100%" }}
                placeholder="Select role"
                value={assignRoleId}
                onChange={setAssignRoleId}
                options={roles?.map((r) => ({ label: r.name, value: r.id }))}
              />
            </Modal>
            <Modal
              open={!!crudModal}
              onCancel={() => setCrudModal(null)}
              onOk={async () => {
                if (
                  crudModal?.mode === "add" &&
                  resourceName &&
                  resourceType &&
                  (!isServerType(resourceType) || resourceEngine)
                ) {
                  await createResource.mutateAsync({
                    name: resourceName,
                    type: resourceType,
                    parent_id: crudModal.parentId,
                    engine: resourceEngine,
                    details: resourceDetails || undefined,
                  });
                  setCrudModal(null);
                  setResourceName("");
                  setResourceType(undefined);
                  setResourceEngine(undefined);
                  setResourceDetails("");
                } else if (crudModal?.mode === "edit" && crudModal.resource) {
                  await updateResource.mutateAsync({
                    resourceId: crudModal.resource.id,
                    name: resourceName,
                    engine: resourceEngine,
                    details: resourceDetails || undefined,
                  });
                  setCrudModal(null);
                }
              }}
              title={
                crudModal?.mode === "add" ? "Add Resource" : "Edit Resource"
              }
              okButtonProps={{
                disabled:
                  !resourceName ||
                  !resourceType ||
                  (isServerType(resourceType) && !resourceEngine),
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <label>
                  Name<span style={{ color: "red" }}>*</span>
                </label>
                <input
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>
                  Type<span style={{ color: "red" }}>*</span>
                </label>
                <Select
                  value={resourceType}
                  onChange={setResourceType}
                  style={{ width: "100%" }}
                  options={[
                    "server",
                    "database",
                    "schema",
                    "table",
                    "collection",
                  ].map((t) => ({ label: t, value: t }))}
                />
              </div>
              {isServerType(resourceType) && (
                <div style={{ marginBottom: 12 }}>
                  <label>
                    Engine<span style={{ color: "red" }}>*</span>
                  </label>
                  <Select
                    value={resourceEngine}
                    onChange={setResourceEngine}
                    style={{ width: "100%" }}
                    options={["mysql", "postgres", "mongodb"].map((e) => ({
                      label: e,
                      value: e,
                    }))}
                  />
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <label>Details</label>
                <textarea
                  value={resourceDetails}
                  onChange={(e) => setResourceDetails(e.target.value)}
                  style={{ width: "100%", minHeight: 60 }}
                  placeholder="Optional JSON or text details"
                />
              </div>
            </Modal>
            {diffModal && (
              <PermissionDiffModal
                beforeState={diffModal.before}
                afterState={diffModal.after}
                open={!!diffModal}
                onClose={() => setDiffModal(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Helper for type check
function isServerType(type?: string) {
  return type === "server";
}

// (removed duplicate export)

export default ResourceTreePage;
