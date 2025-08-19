import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAccessRequests, useReviewAccessRequest } from "../../api/rbac";
import PageHeader from "./components/PageHeader";
import DataTable from "./components/DataTable";

const NewAccessRequestsPage: React.FC = () => {
  const theme = useTheme();
  const { data: requests, isLoading, refetch } = useAccessRequests();
  const reviewRequest = useReviewAccessRequest();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ 
    open: false, 
    message: "", 
    severity: 'success' 
  });

  const handleReview = async (approve: boolean) => {
    if (!selectedRequest) return;
    try {
      await reviewRequest.mutateAsync({
        request_id: selectedRequest.id,
        approve,
        review_note: reviewNote,
      });
      setSnackbar({ 
        open: true, 
        message: approve ? "Request approved" : "Request denied", 
        severity: 'success' 
      });
      setSelectedRequest(null);
      setReviewNote("");
      refetch();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: "Error processing request", 
        severity: 'error' 
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Inline approve/deny action handler
  const handleReviewAction = async (row: any, approve: boolean) => {
    setSelectedRequest(row);
    setReviewNote("");
    await handleReview(approve);
  };

  const columns = [
    { id: "user_id", label: "User ID" },
    { id: "resource_type", label: "Resource Type" },
    { id: "resource_id", label: "Resource ID" },
    { id: "requested_role", label: "Requested Role" },
    { id: "justification", label: "Justification" },
    { 
      id: "status", 
      label: "Status",
      render: (row: any) => {
        let color: "success" | "error" | "warning" | "default";
        switch (row.status) {
          case "approved":
            color = "success";
            break;
          case "rejected":
            color = "error";
            break;
          case "pending":
            color = "warning";
            break;
          default:
            color = "default";
        }
        return <Chip label={row.status} color={color} size="small" />;
      }
    },
    {
      id: "actions",
      label: "Actions",
      render: (row: any) => (
        <>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ mr: 1 }}
            disabled={row.status !== "pending"}
            onClick={() => handleReviewAction(row, true)}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            disabled={row.status !== "pending"}
            onClick={() => handleReviewAction(row, false)}
          >
            Deny
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => setSelectedRequest(row)}
          >
            Review
          </Button>
        </>
      ),
    },
  ];
const actions = [
  {
    label: "Approve",
    onClick: (row: any) => handleReviewAction(row, true),
    disabled: (row: any) => row.status !== "pending",
  },
  {
    label: "Deny",
    onClick: (row: any) => handleReviewAction(row, false),
    disabled: (row: any) => row.status !== "pending",
  },
  {
    label: "Review",
    onClick: (row: any) => setSelectedRequest(row),
  },
];
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Access Requests" />
      
<DataTable
  columns={columns}
  data={requests || []}
  loading={isLoading}
  keyExtractor={(row) => row.id}
  actions={actions}
/>
      
      <Dialog 
        open={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Review Access Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" paragraph>
                <Typography component="span" fontWeight="bold">User ID:</Typography> {selectedRequest.user_id}
              </Typography>
              <Typography variant="body1" paragraph>
                <Typography component="span" fontWeight="bold">Resource:</Typography> {selectedRequest.resource_type} / {selectedRequest.resource_id}
              </Typography>
              <Typography variant="body1" paragraph>
                <Typography component="span" fontWeight="bold">Requested Role:</Typography> {selectedRequest.requested_role}
              </Typography>
              <Typography variant="body1" paragraph>
                <Typography component="span" fontWeight="bold">Justification:</Typography> {selectedRequest.justification}
              </Typography>
              <TextField
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                label="Review note (optional)"
                multiline
                minRows={2}
                maxRows={4}
                fullWidth
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            color="error" 
            onClick={() => handleReview(false)}
            disabled={reviewRequest.isPending}
          >
            Deny
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleReview(true)}
            disabled={reviewRequest.isPending}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewAccessRequestsPage;