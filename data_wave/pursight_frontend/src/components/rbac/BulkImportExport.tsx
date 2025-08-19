import React, { useRef } from "react";
import { Button, Upload, message, Space } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import axios from "axios";

const RBAC_PREFIX = "/sensitivity-labels/rbac";

const BulkImportExport: React.FC<{
  type: "users" | "roles" | "permissions";
}> = ({ type }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const res = await axios.get(`${RBAC_PREFIX}/${type}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      message.error("Export failed");
    }
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`${RBAC_PREFIX}/${type}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Import successful");
    } catch (e) {
      message.error("Import failed");
    }
  };

  return (
    <Space>
      <Button icon={<DownloadOutlined />} onClick={handleExport}>
        Export {type}
      </Button>
      <Upload
        beforeUpload={(file) => {
          handleImport(file);
          return false;
        }}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Import {type}</Button>
      </Upload>
    </Space>
  );
};

export default BulkImportExport;
