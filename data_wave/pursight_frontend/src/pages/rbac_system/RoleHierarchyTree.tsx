import React, { useMemo } from "react";
import { Tree, Typography, Card } from "antd";
import { useRoles, Role } from "../../api/rbac";

const { Title } = Typography;

// Helper: build tree data from flat roles list
function buildRoleTree(roles: Role[]): any[] {
  // Map roles by id
  const roleMap: Record<number, Role & { children: any[] }> = {};
  roles.forEach((r) => (roleMap[r.id] = { ...r, children: [] }));
  // Build parent/child relationships
  roles.forEach((role) => {
    if ((role as any).parents && (role as any).parents.length > 0) {
      (role as any).parents.forEach((parent: Role) => {
        if (roleMap[parent.id]) {
          roleMap[parent.id].children.push(roleMap[role.id]);
        }
      });
    }
  });
  // Roots: roles with no parents
  return Object.values(roleMap).filter(
    (r) => !(r as any).parents || (r as any).parents.length === 0
  );
}

const RoleHierarchyTree: React.FC = () => {
  const { data: roles, isLoading } = useRoles();
  // Assume roles have a 'parents' field (fetch with parents in backend or augment in frontend)
  const treeData = useMemo(() => {
    if (!roles) return [];
    // If roles don't have parents, treat all as roots
    if (!roles.some((r) => (r as any).parents)) {
      return roles.map((r) => ({
        title: r.name,
        key: r.id,
        children: [],
      }));
    }
    // Build tree
    const roots = buildRoleTree(roles);
    const toTreeNode = (r: any): any => ({
      title: r.name,
      key: r.id,
      children: r.children.map(toTreeNode),
    });
    return roots.map(toTreeNode);
  }, [roles]);

  return (
    <Card style={{ background: "#181818", borderRadius: 12 }}>
      <Title level={4} style={{ color: "#fff" }}>
        Role Hierarchy
      </Title>
      <Tree
        treeData={treeData}
        defaultExpandAll
        style={{ background: "#222", color: "#fff", borderRadius: 8 }}
      />
    </Card>
  );
};

export default RoleHierarchyTree;
