import React, { useState } from "react";

const templates = [
  {
    label: "Wildcard Region",
    value: '{\n  "region": "EMEA*"\n}',
  },
  {
    label: "Department List",
    value: '{\n  "department": ["finance", "hr"]\n}',
  },
  {
    label: "Regex Email",
    value: '{\n  "email": { "$op": "regex", "value": "^admin@.*\\.com$" }\n}',
  },
  {
    label: "Score >= 80",
    value: '{\n  "score": { "$op": "gte", "value": 80 }\n}',
  },
  {
    label: "User Attribute (department)",
    value:
      '{\n  "department": { "$op": "user_attr", "value": "department" }\n}',
  },
  {
    label: "Combined Example",
    value:
      '{\n  "region": "EMEA*",\n  "department": ["finance", "hr"],\n  "email": { "$op": "regex", "value": "^admin@.*\\.com$" },\n  "score": { "$op": "gte", "value": 80 },\n  "user_type": { "$op": "eq", "value": "manager" }\n}',
  },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const PermissionConditionHelper: React.FC<Props> = ({ value, onChange }) => {
  const [editorValue, setEditorValue] = useState(value);

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontWeight: "bold" }}>Condition JSON</label>
      <textarea
        rows={6}
        style={{ width: "100%", fontFamily: "monospace" }}
        value={editorValue}
        onChange={(e) => {
          setEditorValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="Paste or edit JSON conditions here..."
      />
      <div style={{ marginTop: 8 }}>
        <span>Templates: </span>
        {templates.map((t) => (
          <button
            key={t.label}
            style={{ marginRight: 8 }}
            onClick={() => {
              setEditorValue(t.value);
              onChange(t.value);
            }}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PermissionConditionHelper;
