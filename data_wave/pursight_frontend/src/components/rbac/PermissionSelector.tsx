import React from "react";
import { Select, Spin } from "antd";
import { usePermissions } from "../../api/rbac";

interface PermissionSelectorProps {
  value?: number[];
  onChange?: (value: number[]) => void;
}

const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  value,
  onChange,
}) => {
  const { data: permissions, isLoading } = usePermissions();
  return (
    <div>
      <label>Permissions:</label>
      {isLoading ? (
        <Spin />
      ) : (
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          value={value}
          onChange={onChange}
          optionLabelProp="label"
        >
          {(permissions || []).map((p: any) => (
            <Select.Option
              key={p.id}
              value={p.id}
              label={`${p.action} on ${p.resource}`}
            >
              {p.action} on {p.resource}{" "}
              {p.conditions ? `(Cond: ${p.conditions})` : ""}
            </Select.Option>
          ))}
        </Select>
      )}
    </div>
  );
};

export default PermissionSelector;
