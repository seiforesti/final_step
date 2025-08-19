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
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  useUsers,
  useRoleAssignments,
  useResourceRoleAssignments,
} from "../../api/rbac";
import { useRbacMe } from "../../rbac/useRbacMe";
import PageHeader from "./components/PageHeader";
import StatusCard from "./components/StatusCard";

const NewCheckAccessPage: React.FC = () => {
  const { data: me, isLoading: loadingMe } = useRbacMe();
  const { data: users, isLoading: loadingUsers } = useUsers();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const { data: assignments, isLoading: loadingAssignments } =
    useRoleAssignments(selectedUser ? { user_id: selectedUser.id } : undefined);
  const { data: resourceRoles, isLoading: loadingResourceRoles } =
    useResourceRoleAssignments(
      selectedUser ? { user_id: selectedUser.id } : undefined
    );

  // Filter users for search
  const filteredUsers =
    users?.filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Check Access" />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Card variant="outlined">
          <CardHeader
            avatar={<SecurityIcon color="primary" />}
            title="My Access"
          />
          <CardContent>
            {loadingMe ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              me && (
                <Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" component="span">
                      Email:
                    </Typography>{" "}
                    <Typography variant="body2" component="span">
                      {me.email}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" component="span">
                      Roles:
                    </Typography>{" "}
                    {me.roles.length === 0 ? (
                      <Chip label="None" size="small" />
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {me.roles.map((r) => (
                          <Chip
                            key={r}
                            label={r}
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" component="span">
                      Permissions:
                    </Typography>{" "}
                    {me.permissions.length === 0 ? (
                      <Chip label="None" size="small" />
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {me.permissions.map(([action, resource], i) => (
                          <Chip
                            key={i}
                            label={`${action}:${resource}`}
                            size="small"
                            color="secondary"
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )
            )}
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader
            avatar={<SecurityIcon color="primary" />}
            title="Check Access"
          />
          <CardContent>
            <Box sx={{ maxWidth: 400, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search user by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          const found = users?.find(
                            (u) =>
                              u.email.toLowerCase() === search.toLowerCase()
                          );
                          setSelectedUser(found || null);
                        }}
                        edge="end"
                        disabled={loadingUsers}
                      >
                        {loadingUsers ? (
                          <CircularProgress size={24} />
                        ) : (
                          <SearchIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {search && filteredUsers.length > 0 && (
              <Paper variant="outlined" sx={{ maxWidth: 400, mb: 2 }}>
                <List dense>
                  {filteredUsers.map((item) => (
                    <ListItemButton
                      key={item.id}
                      onClick={() => setSelectedUser(item)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item.email} />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}

            {selectedUser && (
              <Box sx={{ mt: 2 }}>
                <Divider textAlign="left" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    Access for {selectedUser.email}
                  </Typography>
                </Divider>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" component="span">
                    Roles:
                  </Typography>{" "}
                  {selectedUser.roles.length === 0 ? (
                    <Chip label="None" size="small" />
                  ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selectedUser.roles.map((r: string) => (
                        <Chip key={r} label={r} size="small" color="primary" />
                      ))}
                    </Box>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Resource-level Assignments:
                  </Typography>
                  {loadingResourceRoles ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 1 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : resourceRoles && resourceRoles.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Role</TableCell>
                            <TableCell>Resource Type</TableCell>
                            <TableCell>Resource ID</TableCell>
                            <TableCell>Assigned At</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {resourceRoles.map((row: any) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.role_id}</TableCell>
                              <TableCell>{row.resource_type}</TableCell>
                              <TableCell>{row.resource_id}</TableCell>
                              <TableCell>{row.assigned_at}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <StatusCard message="No resource-level assignments found" />
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2">
                    Direct Permissions:
                  </Typography>
                  {/* Optionally, fetch and show direct permissions for this user */}
                  <StatusCard message="No direct permissions information available" />
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default NewCheckAccessPage;
