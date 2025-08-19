import React from "react";
import { Card } from "antd";

function jsonDiff(before: any, after: any): React.ReactNode {
  // Simple line-by-line diff for JSON objects (for demo, not production-grade)
  const beforeStr = JSON.stringify(before, null, 2).split("\n");
  const afterStr = JSON.stringify(after, null, 2).split("\n");
  const maxLen = Math.max(beforeStr.length, afterStr.length);
  const lines = [];
  for (let i = 0; i < maxLen; i++) {
    const b = beforeStr[i] || "";
    const a = afterStr[i] || "";
    if (b === a) {
      lines.push(
        <div key={i} style={{ color: "#aaa" }}>
          {b}
        </div>
      );
    } else {
      if (b)
        lines.push(
          <div
            key={i + "-b"}
            style={{ background: "#2d2323", color: "#ff7875" }}
          >
            - {b}
          </div>
        );
      if (a)
        lines.push(
          <div
            key={i + "-a"}
            style={{ background: "#232d23", color: "#95de64" }}
          >
            + {a}
          </div>
        );
    }
  }
  return <pre style={{ fontSize: 13 }}>{lines}</pre>;
}

const JsonDiffView: React.FC<{ before?: any; after?: any }> = ({
  before,
  after,
}) => {
  if (!before && !after) return <Card>No data</Card>;
  if (JSON.stringify(before) === JSON.stringify(after))
    return <Card>No changes</Card>;
  return (
    <Card
      title="Change Diff"
      size="small"
      bodyStyle={{ background: "#181818" }}
    >
      {jsonDiff(before, after)}
    </Card>
  );
};

export default JsonDiffView;
