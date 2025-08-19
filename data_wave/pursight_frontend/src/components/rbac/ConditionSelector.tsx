import React from "react";
import { Select, Input, Spin, message } from "antd";
import { useConditionTemplates, useValidateCondition } from "../../api/rbac";

interface ConditionSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  templates?: { label: string; value: string }[];
}

const ConditionSelector: React.FC<ConditionSelectorProps> = ({
  value,
  onChange,
  templates: propTemplates,
}) => {
  const { data: templates, isLoading } = useConditionTemplates();
  const validateCondition = useValidateCondition();
  const [custom, setCustom] = React.useState("");
  const [validation, setValidation] = React.useState<string | null>(null);

  const mergedTemplates = propTemplates || templates;

  React.useEffect(() => {
    if (value && !mergedTemplates?.some((t) => t.value === value)) {
      setCustom(value);
    }
  }, [value, mergedTemplates]);

  const handleTemplateChange = (val: string) => {
    setCustom("");
    setValidation(null);
    onChange?.(val);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidation(null);
    setCustom(e.target.value);
    onChange?.(e.target.value);
  };

  const handleValidate = async () => {
    if (!custom && !value) return;
    let condStr = custom || value || "";
    let condObj: any = null;
    try {
      condObj = JSON.parse(condStr);
    } catch (e) {
      setValidation("Invalid JSON: " + e);
      return;
    }
    try {
      const { data } = await validateCondition.mutateAsync(condObj);
      setValidation(data.valid ? "Valid condition" : "Invalid condition");
    } catch (e: any) {
      setValidation(e?.response?.data?.detail || "Validation failed");
    }
  };

  return (
    <div>
      <label>Predefined Conditions:</label>
      {isLoading ? (
        <Spin />
      ) : (
        <Select
          style={{ width: "100%", marginBottom: 8 }}
          value={mergedTemplates?.some((t) => t.value === value) ? value : ""}
          onChange={handleTemplateChange}
        >
          <Select.Option value="">-- Select --</Select.Option>
          {(mergedTemplates || []).map((t) => (
            <Select.Option key={t.label} value={t.value}>
              {t.label}
            </Select.Option>
          ))}
        </Select>
      )}
      <label>Or enter custom condition (JSON):</label>
      <Input
        value={custom}
        onChange={handleCustomChange}
        placeholder='e.g. {"department": "HR", "region": "EU"}'
      />
      <button type="button" onClick={handleValidate} style={{ marginTop: 8 }}>
        Validate
      </button>
      {validation && (
        <div
          style={{
            marginTop: 8,
            color: validation === "Valid condition" ? "green" : "red",
          }}
        >
          {validation}
        </div>
      )}
    </div>
  );
};

export default ConditionSelector;
