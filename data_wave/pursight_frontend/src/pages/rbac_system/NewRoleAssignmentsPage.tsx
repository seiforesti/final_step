import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Chip, 
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  useRoleAssignments,
  useUsers,
  useRoles,
  useAssignRoleScope,
  useRemoveRoleScope,
  ResourceRole,
} from '../../api/rbac';

import PageHeader from './components/PageHeader';
import CommandBar from './components/CommandBar';
import DataTable from './components/DataTable';
import FilterBar from './components/FilterBar';
import FormDialog from './components/FormDialog';
import ConfirmationDialog from './components/ConfirmationDialog';
import DetailPanel from './components/DetailPanel';
import PropertyList from './components/PropertyList';
import StatusCard from './components/StatusCard';

interface RequestAccessModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  resourceType: string;
  resourceId: string;
}

// Simplified RequestAccessModal using Material UI
const RequestAccessModal: React.FC<RequestAccessModalProps> = ({
  open,
  onClose,
  userId,
  resourceType,
  resourceId,
}) => {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const { data: roles, isLoading: loadingRoles } = useRoles();
  
  const handleSubmit = () => {
    // Implementation would go here
    onClose();
  };

  return (
    <FormDialog
      open={open}
      title="Request Access"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Submit Request"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2">
          Request access to resources by selecting a role you need.
        </Typography>
        
        {loadingRoles ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {roles?.map(role => (
              <Chip
                key={role.id}
                label={role.name}
                icon={<VpnKeyIcon />}
                onClick={() => setSelectedRole(role.id)}
                color={selectedRole === role.id ? 'primary' : 'default'}
                variant={selectedRole === role.id ? 'filled' : 'outlined'}
                sx={{ justifyContent: 'flex-start', width: '100%' }}
              />
            ))}
          </Box>
        )}
      </Box>
    </FormDialog>
  );
};

const NewRoleAssignmentsPage: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [requestAccessOpen, setRequestAccessOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ResourceRole | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  
  // Form state
  const [formUserId, setFormUserId] = useState<number | undefined>(undefined);
  const [formRoleId, setFormRoleId] = useState<number | undefined>(undefined);
  const [formResourceType, setFormResourceType] = useState('');
  const [formResourceId, setFormResourceId] = useState('');
  
  // Data fetching hooks
  const { data: assignments = [], isLoading: loadingAssignments, refetch } = useRoleAssignments({ 
    role_id: roleFilter 
  });
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const { data: roles = [], isLoading: loadingRoles } = useRoles();
  const assignRoleScope = useAssignRoleScope();
  const removeRoleScope = useRemoveRoleScope();

  // Filtered assignments by search
  const filteredAssignments = useMemo(() => {
    if (!searchQuery) return assignments;
    
    return assignments.filter(assignment => {
      const user = users.find(u => u.id === assignment.user_id);
      return user?.email.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [assignments, searchQuery, users]);

  // Reset form when opening add modal
  const handleAddAssignment = () => {
    setFormUserId(undefined);
    setFormRoleId(undefined);
    setFormResourceType('');
    setFormResourceId('');
    setAddModalOpen(true);
  };

  // Handle form submission for add
  const handleSaveAssignment = async () => {
    if (!formUserId || !formRoleId || !formResourceType || !formResourceId) {
      return; // Form validation would be handled by FormDialog
    }
    
    try {
      await assignRoleScope.mutateAsync({
        user_id: formUserId,
        role_id: formRoleId,
        resource_type: formResourceType,
        resource_id: formResourceId,
      });
      setAddModalOpen(false);
      refetch(); // Refresh the data
    } catch (error) {
      console.error('Failed to add role assignment:', error);
    }
  };

  // Handle assignment deletion
  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      await removeRoleScope.mutateAsync({
        id: selectedAssignment.id,
      });
      setDeleteDialogOpen(false);
      setSelectedAssignment(null);
      refetch(); // Refresh the data
    } catch (error) {
      console.error('Failed to delete role assignment:', error);
    }
  };

  // Open assignment details panel
  const handleViewAssignmentDetails = (assignment: ResourceRole) => {
    setSelectedAssignment(assignment);
    setDetailPanelOpen(true);
  };

  // Define table columns
  const columns = [
    {
      id: 'user_id',
      label: 'User',
      minWidth: 200,
      format: (value: number, row: ResourceRole) => {
        const user = users.find(u => u.id === value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {user ? user.email : 'Loading...'}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'role_id',
      label: 'Role',
      minWidth: 150,
      format: (value: number, row: ResourceRole) => {
        const role = roles.find(r => r.id === value);
        return (
          <Chip
            icon={<VpnKeyIcon />}
            label={role ? role.name : 'Loading...'}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'resource_type',
      label: 'Resource Type',
      minWidth: 150,
      format: (value: string) => (
        <Typography variant="body2">{value}</Typography>
      ),
    },
    {
      id: 'resource_id',
      label: 'Resource ID',
      minWidth: 150,
      format: (value: string) => (
        <Typography variant="body2">{value}</Typography>
      ),
    },
    {
      id: 'assigned_at',
      label: 'Assigned At',
      minWidth: 180,
      format: (value: string) => (
        <Typography variant="body2">
          {new Date(value).toLocaleString()}
        </Typography>
      ),
    },
  ];

  // Define row actions
  const actions = [
    {
      label: 'View Details',
      icon: <PersonIcon fontSize="small" />,
      onClick: (row: ResourceRole) => handleViewAssignmentDetails(row),
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row: ResourceRole) => {
        setSelectedAssignment(row);
        setDeleteDialogOpen(true);
      },
    },
  ];

  // Define command bar actions
  const primaryActions = [
    {
      key: 'add-assignment',
      label: 'Add Assignment',
      icon: <AddIcon />,
      onClick: handleAddAssignment,
      primary: true,
    },
  ];

  const secondaryActions = [
    {
      key: 'request-access',
      label: 'Request Access',
      icon: <VpnKeyIcon />,
      onClick: () => setRequestAccessOpen(true),
    },
    {
      key: 'refresh',
      label: 'Refresh',
      icon: <RefreshIcon />,
      onClick: () => refetch(),
    },
  ];

  // Define filter options
  const filterOptions = [
    {
      id: 'role',
      label: 'Role',
      options: roles.map(role => ({ value: role.id, label: role.name })),
    },
  ];

  // Handle filter changes
  const handleFilterChange = (filters: any[]) => {
    const roleFilterItem = filters.find(f => f.id === 'role');
    setRoleFilter(roleFilterItem ? roleFilterItem.value : undefined);
    setActiveFilters(filters);
  };

  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader 
        title="Role Assignments" 
        subtitle="Manage role assignments for users and resources"
        breadcrumbs={[
          { label: 'RBAC System', href: '/rbac' },
          { label: 'Role Assignments', href: '/rbac/role-assignments' },
        ]}
      />
      
      <CommandBar 
        primaryActions={primaryActions}
        secondaryActions={secondaryActions}
      />
      
      <Box sx={{ my: 2 }}>
        <FilterBar 
          searchPlaceholder="Search by user email..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterRemove={(filterId) => {
            setActiveFilters(activeFilters.filter(f => f.id !== filterId));
            if (filterId === 'role') setRoleFilter(undefined);
          }}
          onFiltersClear={() => {
            setActiveFilters([]);
            setRoleFilter(undefined);
          }}
        />
      </Box>
      
      <DataTable 
        columns={columns}
        data={filteredAssignments}
        keyExtractor={(row) => row.id}
        loading={loadingAssignments || loadingUsers || loadingRoles}
        actions={actions}
        onRowClick={handleViewAssignmentDetails}
        pagination
        emptyMessage="No role assignments found. Add a new assignment to get started."
      />
      
      {/* Add Role Assignment Modal */}
      <FormDialog
        open={addModalOpen}
        title="Add Role Assignment"
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleSaveAssignment}
        submitLabel="Add Assignment"
        loading={assignRoleScope.isPending}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>User</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {loadingUsers ? (
                <CircularProgress size={24} />
              ) : (
                users.map(user => (
                  <Chip
                    key={user.id}
                    label={user.email}
                    icon={<PersonIcon />}
                    onClick={() => setFormUserId(user.id)}
                    color={formUserId === user.id ? 'primary' : 'default'}
                    variant={formUserId === user.id ? 'filled' : 'outlined'}
                    sx={{ justifyContent: 'flex-start' }}
                  />
                ))
              )}
            </Box>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Role</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {loadingRoles ? (
                <CircularProgress size={24} />
              ) : (
                roles.map(role => (
                  <Chip
                    key={role.id}
                    label={role.name}
                    icon={<VpnKeyIcon />}
                    onClick={() => setFormRoleId(role.id)}
                    color={formRoleId === role.id ? 'primary' : 'default'}
                    variant={formRoleId === role.id ? 'filled' : 'outlined'}
                  />
                ))
              )}
            </Box>
          </Box>
          
          <TextField
            label="Resource Type"
            value={formResourceType}
            onChange={(e) => setFormResourceType(e.target.value)}
            fullWidth
            required
            placeholder="e.g. database, schema, table"
            error={!formResourceType}
            helperText={!formResourceType ? 'Resource type is required' : ''}
          />
          
          <TextField
            label="Resource ID"
            value={formResourceId}
            onChange={(e) => setFormResourceId(e.target.value)}
            fullWidth
            required
            placeholder="e.g. db1, schema1, table1"
            error={!formResourceId}
            helperText={!formResourceId ? 'Resource ID is required' : ''}
          />
        </Box>
      </FormDialog>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Role Assignment"
        message={`Are you sure you want to delete this role assignment? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteAssignment}
        onCancel={() => setDeleteDialogOpen(false)}
        severity="error"
        confirmButtonColor="error"
        loading={removeRoleScope.isPending}
      />
      
      {/* Role Assignment Details Panel */}
      <DetailPanel
        open={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        title="Role Assignment Details"
        width={500}
      >
        {selectedAssignment && (
          <Box sx={{ p: 2 }}>
            <PropertyList
              properties={[
                {
                  key: 'user',
                  label: 'User',
                  value: users.find(u => u.id === selectedAssignment.user_id)?.email || 'Unknown',
                  type: 'text',
                  icon: <PersonIcon fontSize="small" />,
                },
                {
                  key: 'role',
                  label: 'Role',
                  value: roles.find(r => r.id === selectedAssignment.role_id)?.name || 'Unknown',
                  type: 'chip',
                  chipProps: { color: 'primary', icon: <VpnKeyIcon /> },
                },
                {
                  key: 'resourceType',
                  label: 'Resource Type',
                  value: selectedAssignment.resource_type,
                  type: 'text',
                },
                {
                  key: 'resourceId',
                  label: 'Resource ID',
                  value: selectedAssignment.resource_id,
                  type: 'text',
                },
                {
                  key: 'assignedAt',
                  label: 'Assigned At',
                  value: new Date(selectedAssignment.assigned_at).toLocaleString(),
                  type: 'date',
                },
              ]}
            />
          </Box>
        )}
      </DetailPanel>
      
      {/* Request Access Modal */}
      <RequestAccessModal
        open={requestAccessOpen}
        onClose={() => setRequestAccessOpen(false)}
        userId={1} // This would be the current user's ID
        resourceType="resource_type"
        resourceId="resource_id"
      />
    </Box>
  );
};

export default NewRoleAssignmentsPage;