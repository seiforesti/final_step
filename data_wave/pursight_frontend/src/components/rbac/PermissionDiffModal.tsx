import React from "react";
import { Modal, Tag } from "antd";
import AdvancedJsonDiffView from "./AdvancedJsonDiffView";
import {
  fetchPermissionDiff,
  PermissionDiffRequest,
  PermissionDiffResult,
} from "../../api/rbac";

export const PermissionDiffModal: React.FC<{
  userId?: number;
  roleId?: number;
  resourceType?: string;
  resourceId?: string;
  beforeState?: { action: string; resource: string }[];
  afterState?: { action: string; resource: string }[];
  open: boolean;
  onClose: () => void;
}> = ({
  userId,
  roleId,
  resourceType,
  resourceId,
  beforeState,
  afterState,
  open,
  onClose,
}) => {
  const [diff, setDiff] = React.useState<PermissionDiffResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      fetchPermissionDiff({
        user_id: userId,
        role_id: roleId,
        resource_type: resourceType,
        resource_id: resourceId,
        before_state: beforeState,
        after_state: afterState,
      })
        .then(setDiff)
        .finally(() => setLoading(false));
    } else {
      setDiff(null);
    }
  }, [open, userId, roleId, resourceType, resourceId, beforeState, afterState]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title="Permission Diff"
      destroyOnClose
    >
      {loading ? (
        <div>Loading...</div>
      ) : diff ? (
        <div>
          <h4>Added</h4>
          {diff.added.length === 0 ? (
            <div>None</div>
          ) : (
            diff.added.map((p, i) => (
              <Tag color="green" key={i}>
                {p.action} {p.resource}
              </Tag>
            ))
          )}
          <h4>Removed</h4>
          {diff.removed.length === 0 ? (
            <div>None</div>
          ) : (
            diff.removed.map((p, i) => (
              <Tag color="red" key={i}>
                {p.action} {p.resource}
              </Tag>
            ))
          )}
          <h4>Unchanged</h4>
          {diff.unchanged.length === 0 ? (
            <div>None</div>
          ) : (
            diff.unchanged.map((p, i) => (
              <Tag key={i}>
                {p.action} {p.resource}
              </Tag>
            ))
          )}
        </div>
      ) : (
        <div>No diff data</div>
      )}
    </Modal>
  );
};

export default PermissionDiffModal;
