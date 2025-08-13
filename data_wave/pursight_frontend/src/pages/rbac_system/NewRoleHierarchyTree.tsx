import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import { TreeView, TreeItem } from "@mui/lab";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useRoles, Role } from "../../api/rbac";
import PageHeader from "./components/PageHeader";

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

// Recursive component to render tree nodes
const RenderTreeNodes = ({ nodes }: { nodes: any[] }) => {
  return (
    <>
      {nodes.map((node) => (
        <TreeItem key={node.id} nodeId={String(node.id)} label={node.name}>
          {node.children && node.children.length > 0 && (
            <RenderTreeNodes nodes={node.children} />
          )}
        </TreeItem>
      ))}
    </>
  );
};

const NewRoleHierarchyTree: React.FC = () => {
  const theme = useTheme();
  const { data: roles, isLoading } = useRoles();

  // Process roles data to create tree structure
  const rootNodes = useMemo(() => {
    if (!roles) return [];

    // If roles don't have parents, treat all as roots
    if (!roles.some((r) => (r as any).parents)) {
      return roles.map((r) => ({
        ...r,
        children: [],
      }));
    }

    // Build tree
    return buildRoleTree(roles);
  }, [roles]);

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Role Hierarchy" />

      <Card variant="outlined">
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : rootNodes.length > 0 ? (
            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              defaultExpanded={rootNodes.map((node) => String(node.id))}
              sx={{
                height: "auto",
                flexGrow: 1,
                maxWidth: "100%",
                overflowY: "auto",
                p: 2,
              }}
            >
              <RenderTreeNodes nodes={rootNodes} />
            </TreeView>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No role hierarchy data available.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewRoleHierarchyTree;
