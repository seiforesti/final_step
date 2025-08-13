// API for bulk import/export of Sensitivity Labels
import axios from "./axiosConfig";

export async function bulkImportLabels(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post("/sensitivity-labels/bulk/labels/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function bulkExportLabels(format: string) {
  const response = await axios.get(`/sensitivity-labels/bulk/labels/export`, {
    params: { format },
    responseType: "blob",
  });
  // Trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `sensitivity_labels.${format === "excel" ? "xlsx" : format}`
  );
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
}
