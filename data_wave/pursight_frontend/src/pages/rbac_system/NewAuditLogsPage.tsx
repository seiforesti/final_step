import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AccessTime as ClockIcon,
  Person as UserIcon,
  Description as FileIcon,
  VpnKey as KeyIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAuditLogsSimple, RbacAuditLog } from "../../api/rbac";
import PageHeader from "./components/PageHeader";
import CommandBar from "./components/CommandBar";
import DataTable from "./components/DataTable";
import JsonViewer from "./components/JsonViewer";

const NewAuditLogsPage: React.FC = () => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<RbacAuditLog | null>(null);
  const { data, isLoading } = useAuditLogsSimple({ limit: 100 });

  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];
    if (!search) return data.logs;
    return data.logs.filter(
      (log) =>
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        log.performed_by?.toLowerCase().includes(search.toLowerCase()) ||
        log.target_user?.toLowerCase().includes(search.toLowerCase()) ||
        log.resource_type?.toLowerCase().includes(search.toLowerCase()) ||
        log.resource_id?.toLowerCase().includes(search.toLowerCase()) ||
        log.role?.toLowerCase().includes(search.toLowerCase()) ||
        log.status?.toLowerCase().includes(search.toLowerCase()) ||
        log.note?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit-logs.json");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const columns = [
    {
      id: "timestamp",
      label: "Timestamp",
      render: (row: RbacAuditLog) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ClockIcon fontSize="small" color="action" />
          {new Date(row.timestamp).toLocaleString()}
        </Box>
      ),
      sortable: true,
      defaultSort: "desc",
    },
    {
      id: "action",
      label: "Action",
      render: (row: RbacAuditLog) => (
        <Chip
          label={row.action}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      id: "performed_by",
      label: "By",
      render: (row: RbacAuditLog) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UserIcon fontSize="small" color="action" />
          {row.performed_by}
        </Box>
      ),
    },
    {
      id: "target_user",
      label: "Target",
      render: (row: RbacAuditLog) =>
        row.target_user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserIcon fontSize="small" color="action" />
            {row.target_user}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        ),
    },
    {
      id: "resource",
      label: "Resource",
      render: (row: RbacAuditLog) =>
        row.resource_type ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FileIcon fontSize="small" color="action" />
            {row.resource_type}{" "}
            <Typography
              variant="body2"
              sx={{
                backgroundColor: theme.palette.action.hover,
                px: 0.5,
                borderRadius: 0.5,
              }}
            >
              {row.resource_id}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        ),
    },
    {
      id: "role",
      label: "Role",
      render: (row: RbacAuditLog) =>
        row.role ? (
          <Chip
            icon={<KeyIcon fontSize="small" />}
            label={row.role}
            size="small"
            color="secondary"
            variant="outlined"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        ),
    },
    {
      id: "status",
      label: "Status",
      render: (row: RbacAuditLog) =>
        row.status ? (
          <Chip
            label={row.status}
            size="small"
            color={row.status === "success" ? "success" : "error"}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        ),
    },
    {
      id: "note",
      label: "Note",
      render: (row: RbacAuditLog) =>
        row.note ? (
          <Tooltip title={row.note}>
            <Typography
              variant="body2"
              sx={{
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.note}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Audit Logs" />

      <Box sx={{ mb: 3 }}>
        <CommandBar>
          <TextField
            placeholder="Filter logs by action, user, resource, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 320 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </CommandBar>
      </Box>

      <DataTable
        columns={columns}
        data={filteredLogs}
        loading={isLoading}
        onRowClick={(row) => setSelectedLog(row)}
        keyExtractor={(row) => row.id}
        defaultSortBy="timestamp"
        defaultSortDirection="desc"
      />

      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Audit Log Details
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setSelectedLog(null)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <JsonViewer data={selectedLog} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default NewAuditLogsPage;
