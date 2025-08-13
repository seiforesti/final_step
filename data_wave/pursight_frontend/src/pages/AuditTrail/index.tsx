import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRowSelectionModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  useAuditTrail,
  useAuditDetail,
  exportAuditTrail,
  AuditEvent,
} from "../../api/auditTrail";
import { ErrorBoundary } from "../../components/ErrorBoundary";

export default function AuditTrailPage() {
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    [] as unknown as GridRowSelectionModel
  );
  const [filter, setFilter] = useState({
    user: "",
    action: "",
    entity_type: "",
    entity_id: "",
  });
  const [detailId, setDetailId] = useState<number | null>(null);
  // --- Advanced Filters & Pagination ---
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { data = [], isLoading } = useAuditTrail({
    ...filter,
    skip: paginationModel.page * paginationModel.pageSize,
    limit: paginationModel.pageSize,
    start_date: dateFrom || undefined,
    end_date: dateTo || undefined,
  });
  const { data: detail } = useAuditDetail(detailId || 0);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const blob = await exportAuditTrail(filter, "csv");
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit_trail.csv");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    setExporting(false);
  };

  const columns: GridColDef[] = [
    { field: "timestamp", headerName: "Timestamp", width: 180 },
    { field: "performed_by", headerName: "User", width: 180 },
    { field: "action", headerName: "Action", width: 160 },
    {
      field: "entity_type",
      headerName: "Entity Type",
      width: 160,
      valueGetter: (params: GridRenderCellParams<any, any>) =>
        params.row?.proposal?.object_type || "",
    },
    {
      field: "entity_id",
      headerName: "Entity ID",
      width: 120,
      valueGetter: (params: GridRenderCellParams<any, any>) =>
        params.row?.proposal?.object_id || "",
    },
    { field: "note", headerName: "Details", flex: 1 },
  ];

  return (
    <Box p={3}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Audit Trail
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View, filter, and export all audit events. Click a row for details
            and context links.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} mb={2}>
        <input
          placeholder="User"
          value={filter.user}
          onChange={(e) => setFilter((f) => ({ ...f, user: e.target.value }))}
        />
        <input
          placeholder="Action"
          value={filter.action}
          onChange={(e) => setFilter((f) => ({ ...f, action: e.target.value }))}
        />
        <input
          placeholder="Entity Type"
          value={filter.entity_type}
          onChange={(e) =>
            setFilter((f) => ({ ...f, entity_type: e.target.value }))
          }
        />
        <input
          placeholder="Entity ID"
          value={filter.entity_id}
          onChange={(e) =>
            setFilter((f) => ({ ...f, entity_id: e.target.value }))
          }
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setFilter({ user: "", action: "", entity_type: "", entity_id: "" });
            setDateFrom("");
            setDateTo("");
          }}
        >
          Clear
        </Button>
      </Stack>
      <Paper elevation={2} sx={{ height: 600, width: "100%" }}>
        <ErrorBoundary>
          <DataGrid
            rows={Array.isArray(data) ? data : []}
            columns={Array.isArray(columns) ? columns : []}
            loading={isLoading}
            getRowId={(row) => row.id}
            checkboxSelection
            slots={{ toolbar: GridToolbar }}
            onRowSelectionModelChange={(ids) =>
              setSelectionModel(ids as GridRowSelectionModel)
            }
            rowSelectionModel={selectionModel}
            onRowClick={(params) => setDetailId(params.row.id)}
            pagination
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            paginationMode="server"
          />
        </ErrorBoundary>
      </Paper>
      <Dialog
        open={!!detailId}
        onClose={() => setDetailId(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Audit Event Details</DialogTitle>
        <DialogContent>
          {detail ? (
            <Box>
              <Typography>
                <b>Timestamp:</b> {detail.timestamp}
              </Typography>
              <Typography>
                <b>User:</b> {detail.performed_by}
              </Typography>
              <Typography>
                <b>Action:</b> {detail.action}
              </Typography>
              <Typography>
                <b>Entity Type:</b> {detail.proposal?.object_type}
              </Typography>
              <Typography>
                <b>Entity ID:</b> {detail.proposal?.object_id}
              </Typography>
              <Typography>
                <b>Details:</b> {detail.note}
              </Typography>
            </Box>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
