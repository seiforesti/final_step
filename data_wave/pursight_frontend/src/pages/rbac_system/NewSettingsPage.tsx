import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Stack,
  Alert,
  Paper,
} from "@mui/material";
import { useBuiltinRoles, useTestAbac } from "../../api/rbac";
import PageHeader from "./components/PageHeader";
import JsonViewer from "./components/JsonViewer";

const NewSettingsPage: React.FC = () => {
  const { data: builtinRoles, isLoading: loadingBuiltin } = useBuiltinRoles();
  const testAbac = useTestAbac();
  const [formValues, setFormValues] = useState({
    user_id: "",
    action: "",
    resource: "",
    conditions: "",
  });
  const [abacResult, setAbacResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAbacTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { user_id, action, resource, conditions } = formValues;
      const condObj = conditions ? JSON.parse(conditions) : {};
      const res = await testAbac.mutateAsync({
        user_id: Number(user_id),
        action,
        resource,
        conditions: condObj,
      });
      setAbacResult(res.data);
    } catch (e: any) {
      setAbacResult(null);
      setError(e.message || "ABAC test failed. Check input format.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="RBAC System Settings" />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardHeader title="Built-in Roles" />
        <CardContent>
          {loadingBuiltin ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List>
              {(builtinRoles || []).map((role, index) => (
                <ListItem
                  key={index}
                  divider={index < (builtinRoles?.length || 0) - 1}
                >
                  <ListItemText
                    primary={
                      <Chip
                        label={role.name}
                        color="primary"
                        sx={{ fontSize: "1rem", height: 32 }}
                      />
                    }
                    secondary={role.description}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardHeader title="ABAC Test Utility" />
        <CardContent>
          <Box component="form" onSubmit={handleAbacTest}>
            <Stack spacing={2}>
              <TextField
                name="user_id"
                label="User ID"
                value={formValues.user_id}
                onChange={handleInputChange}
                placeholder="e.g. 1"
                required
                fullWidth
              />
              <TextField
                name="action"
                label="Action"
                value={formValues.action}
                onChange={handleInputChange}
                placeholder="e.g. read, write"
                required
                fullWidth
              />
              <TextField
                name="resource"
                label="Resource"
                value={formValues.resource}
                onChange={handleInputChange}
                placeholder="e.g. database"
                required
                fullWidth
              />
              <TextField
                name="conditions"
                label="Conditions (JSON)"
                value={formValues.conditions}
                onChange={handleInputChange}
                placeholder='{"env": "prod"}'
                multiline
                minRows={2}
                maxRows={4}
                fullWidth
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={testAbac.isPending}
                  startIcon={
                    testAbac.isPending ? <CircularProgress size={20} /> : null
                  }
                >
                  Test ABAC
                </Button>
              </Box>
            </Stack>
          </Box>

          {abacResult && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Result:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <JsonViewer data={abacResult} />
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" color="text.secondary">
        Advanced RBAC features and system configuration will appear here.
      </Typography>
    </Box>
  );
};

export default NewSettingsPage;
