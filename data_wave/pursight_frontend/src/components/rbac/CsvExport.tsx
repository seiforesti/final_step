import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import React from "react";

const CsvExport: React.FC<{ data: any[]; filename: string }> = ({
  data,
  filename,
}) => {
  const handleExport = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, filename);
  };
  return (
    <Button
      icon={<DownloadOutlined />}
      onClick={handleExport}
      style={{ marginLeft: 8 }}
    >
      Export CSV
    </Button>
  );
};

export default CsvExport;
