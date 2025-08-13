import React, { useState } from 'react';

// Define types
interface DenyAssignment {
  id: number;
  principal_type: 'user' | 'group';
  principal_id: number | string;
  action: string;
  resource: string;
  conditions?: any;
}
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  RadioGroup,
  Radio,
  FormControlLabel,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BlockIcon from '@mui/icons-material/Block';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import {
  useDenyAssignments,
  useCreateDenyAssignment,
  useDeleteDenyAssignment,
  useUsers,
  useGroups,
  useConditionTemplates,
} from '../../api/rbac';

import PageHeader from './components/PageHeader';
import CommandBar from './components/CommandBar';
import DataTable from './components/DataTable';
import FilterBar from './components/FilterBar';
import ConfirmationDialog from './components/ConfirmationDialog';
import StatusCard from './components/StatusCard';
import JsonViewer from './components/JsonViewer';
import DenyAssignmentDialog from './components/DenyAssignmentDialog';

const NewDenyAssignmentsPage: React.FC = () => {
  // State for filters
  const [filterType, setFilterType] = useState<'user' | 'group' | undefined>(undefined);
  const [filterId, setFilterId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data fetching hooks
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: conditionTemplates = [] } = useConditionTemplates();
  const { 
    data: denyAssignments = [], 
    refetch, 
    isLoading 
  } = useDenyAssignments(
    filterType && filterId
      ? { principal_type: filterType, principal_id: filterId }
      : {}
  );
  
  // Mutation hooks
  const createDeny = useCreateDenyAssignment();
  const deleteDeny = useDeleteDenyAssignment();
  
  // State for modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [selectedDenyAssignment, setSelectedDenyAssignment] = useState<DenyAssignment | null>(null);
  
  // Form state
  const [formValues, setFormValues] = useState({
    principal_type: 'user',
    principal_id: '',
    action: '',
    resource: '',
    conditions: '{}',
  });
  
  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
    
    // Reset principal_id when principal_type changes
    if (field === 'principal_type') {
      setFormValues(prev => ({
        ...prev,
        principal_id: '',
      }));
    }
  };
  
  // Handle create deny assignment
  const handleCreate = () => {
    setFormValues({
      principal_type: 'user',
      principal_id: '',
      action: '',
      resource: '',
      conditions: '{}',
    });
    setCreateModalOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      await createDeny.mutateAsync({
        principal_type: values.principal_type,
        principal_id: values.principal_id,
        action: values.action,
        resource: values.resource,
        conditions: values.conditions !== '{}' ? values.conditions : undefined,
      });
      setCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create deny assignment:', error);
    }
  };
  
  // Handle delete deny assignment
  const handleDelete = async () => {
    if (!selectedDenyAssignment) return;
    
    try {
      await deleteDeny.mutateAsync(selectedDenyAssignment.id);
      setDeleteModalOpen(false);
      setSelectedDenyAssignment(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete deny assignment:', error);
    }
  };
  
  // Filter deny assignments based on search query
  const filteredDenyAssignments = denyAssignments.filter(assignment => {
    if (!searchQuery) return true;
    
    const user = users.find(u => u.id === assignment.principal_id && assignment.principal_type === 'user');
    const group = groups.find(g => g.id === assignment.principal_id && assignment.principal_type === 'group');
    const principalName = assignment.principal_type === 'user' 
      ? (user?.email || `User #${assignment.principal_id}`) 
      : (group?.name || `Group #${assignment.principal_id}`);
    
    return (
      principalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignment.conditions && JSON.stringify(assignment.conditions).toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  
  // Define table columns
  const columns = [
    {
      id: 'principal',
      label: 'Principal',
      minWidth: 180,
      format: (_: any, row: any) => {
        const user = users.find(u => u.id === row.principal_id && row.principal_type === 'user');
        const group = groups.find(g => g.id === row.principal_id && row.principal_type === 'group');
        return (
          <Chip 
            label={row.principal_type === 'user' 
              ? (user?.email || `User #${row.principal_id}`) 
              : (group?.name || `Group #${row.principal_id}`)}
            color={row.principal_type === 'user' ? 'primary' : 'secondary'}
            size="small"
          />
        );
      },
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: 120,
      format: (value: string) => (
        <Chip label={value} color="error" size="small" />
      ),
    },
    {
      id: 'resource',
      label: 'Resource',
      minWidth: 150,
    },
    {
      id: 'conditions',
      label: 'Conditions',
      minWidth: 200,
      format: (value: any) => {
        if (!value) {
          return <Typography variant="body2" color="text.secondary">-</Typography>;
        }
        
        const conditionObj = typeof value === 'string' ? JSON.parse(value) : value;
        const isEmpty = Object.keys(conditionObj).length === 0;
        
        if (isEmpty) {
          return <Typography variant="body2" color="text.secondary">-</Typography>;
        }
        
        return (
          <Tooltip 
            title={
              <JsonViewer 
                data={conditionObj} 
                title="Conditions" 
                maxHeight="400px"
              />
            }
            placement="left"
          >
            <Box 
              sx={{ 
                maxWidth: 300, 
                maxHeight: 80, 
                overflow: 'auto', 
                fontFamily: 'monospace', 
                fontSize: '0.75rem',
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              {JSON.stringify(conditionObj, null, 2)}
            </Box>
          </Tooltip>
        );
      },
    },
  ];
  
  // Define row actions
  const actions = [
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row: any) => {
        setSelectedDenyAssignment(row);
        setDeleteModalOpen(true);
      },
    },
  ];
  
  // Define command bar actions
  const primaryActions = [
    {
      key: 'create-deny',
      label: 'New Deny Assignment',
      icon: <AddIcon />,
      onClick: handleCreate,
      primary: true,
    },
  ];
  
  // Define filter options
  const filterOptions = [
    {
      id: 'principal_type',
      label: 'Principal Type',
      options: [
        { value: 'user', label: 'User' },
        { value: 'group', label: 'Group' },
      ],
    },
  ];
  
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader 
        title="Deny Assignments" 
        subtitle={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1">Manage deny assignments to explicitly block access</Typography>
            <Tooltip title={
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" paragraph>
                  Deny assignments take precedence over any role assignments and explicitly block access to resources.
                </Typography>
                <Typography variant="body2" paragraph>
                  Use deny assignments when you need to override permissions granted by roles or to implement temporary restrictions.
                </Typography>
                <Typography variant="body2">
                  Examples: Blocking specific users from sensitive operations, implementing time-based restrictions, or enforcing separation of duties.
                </Typography>
              </Box>
            } placement="bottom-start">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
        breadcrumbs={[
          { label: 'RBAC System', href: '/rbac' },
          { label: 'Deny Assignments', href: '/rbac/deny-assignments' },
        ]}
      />
      
      <CommandBar 
        primaryActions={primaryActions}
        secondaryActions={[
          {
            label: 'Help',
            icon: <HelpOutlineIcon />,
            onClick: () => {
              setHelpDialogOpen(true);
            },
          },
        ]}
      />
      
      <Box sx={{ my: 2 }}>
        <FilterBar 
          searchPlaceholder="Search deny assignments..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterOptions={filterOptions}
          activeFilters={[]}
          onFilterChange={() => {}}
          onFilterRemove={() => {}}
          onFiltersClear={() => {}}
        />
        
        <Box sx={{ display: 'flex', mt: 2, mb: 1, alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ mr: 2 }}>Filter by:</Typography>
          <RadioGroup 
            row 
            value={filterType || ''} 
            onChange={(e) => {
              const value = e.target.value;
              setFilterType(value === '' ? undefined : value as 'user' | 'group');
              setFilterId(undefined);
            }}
          >
            <FormControlLabel value="" control={<Radio />} label="All" />
            <FormControlLabel value="user" control={<Radio />} label="User" />
            <FormControlLabel value="group" control={<Radio />} label="Group" />
          </RadioGroup>
          
          {filterType && (
            <FormControl sx={{ minWidth: 200, ml: 2 }} size="small">
              <InputLabel id="principal-select-label">{filterType === 'user' ? 'User' : 'Group'}</InputLabel>
              <Select
                labelId="principal-select-label"
                value={filterId || ''}
                onChange={(e) => setFilterId(e.target.value as number)}
                label={filterType === 'user' ? 'User' : 'Group'}
              >
                <MenuItem value="">All {filterType === 'user' ? 'Users' : 'Groups'}</MenuItem>
                {(filterType === 'user' ? users : groups).map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {filterType === 'user' ? item.email : item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>
      
      {isLoading ? (
        <StatusCard
          type="loading"
          title="Loading Deny Assignments"
          message="Please wait while we fetch the deny assignments..."
        />
      ) : filteredDenyAssignments.length === 0 ? (
        <StatusCard
          type="info"
          title="No Deny Assignments Found"
          message={
            <Box>
              <Typography variant="body2" paragraph>
                There are no deny assignments matching your current filters.
              </Typography>
              <Typography variant="body2">
                Deny assignments allow you to explicitly block access to resources, overriding any permissions granted by roles.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />} 
                onClick={handleCreate}
                sx={{ mt: 2 }}
              >
                Create Deny Assignment
              </Button>
            </Box>
          }
        />
      ) : (
        <DataTable 
          columns={columns}
          data={filteredDenyAssignments}
          keyExtractor={(row) => row.id?.toString() || ''}
          loading={isLoading}
          actions={actions}
          pagination
          emptyMessage="No deny assignments found. Create a new deny assignment to get started."
        />
      )}
      
      {/* Create Deny Assignment Modal */}
      <DenyAssignmentDialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={formValues}
        users={users}
        groups={groups}
        conditionTemplates={conditionTemplates}
        loading={createDeny.isPending}
        title="Create Deny Assignment"
        submitLabel="Create"
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteModalOpen}
        title="Delete Deny Assignment"
        message={`Are you sure you want to delete this deny assignment? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        severity="error"
        loading={deleteDeny.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpOutlineIcon sx={{ mr: 1 }} />
            Understanding Deny Assignments
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              What are Deny Assignments?
            </Typography>
            <Typography variant="body1" paragraph>
              Deny assignments are a powerful access control mechanism that explicitly block access to resources, 
              even if a user has been granted access through role assignments. They take precedence over any role-based permissions.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              When to Use Deny Assignments
            </Typography>
            <Typography variant="body1" paragraph>
              Use deny assignments in the following scenarios:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><BlockIcon color="error" /></ListItemIcon>
                <ListItemText primary="Emergency Access Control" secondary="Quickly block access during security incidents" />
              </ListItem>
              <ListItem>
                <ListItemIcon><AccessTimeIcon color="warning" /></ListItemIcon>
                <ListItemText primary="Temporary Restrictions" secondary="Implement time-bound access restrictions" />
              </ListItem>
              <ListItem>
                <ListItemIcon><SecurityIcon color="info" /></ListItemIcon>
                <ListItemText primary="Separation of Duties" secondary="Prevent conflicts of interest by ensuring users can't perform certain combinations of tasks" />
              </ListItem>
              <ListItem>
                <ListItemIcon><PersonOffIcon color="error" /></ListItemIcon>
                <ListItemText primary="Privileged Access Management" secondary="Restrict highly privileged operations for specific users" />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Components of a Deny Assignment
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Component</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Principal (User/Group)</TableCell>
                    <TableCell>The identity that will be denied access</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>The operation that is being denied (e.g., read, write, delete)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Resource</TableCell>
                    <TableCell>The object to which access is being denied</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Conditions</TableCell>
                    <TableCell>Optional JSON conditions that further refine when the deny assignment applies</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Best Practices
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                <ListItemText primary="Be specific" secondary="Target deny assignments as narrowly as possible" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                <ListItemText primary="Document your deny assignments" secondary="Keep records of why each deny assignment was created" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                <ListItemText primary="Regular review" secondary="Periodically audit deny assignments to ensure they're still needed" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                <ListItemText primary="Use conditions" secondary="Leverage JSON conditions for more granular control" />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewDenyAssignmentsPage;