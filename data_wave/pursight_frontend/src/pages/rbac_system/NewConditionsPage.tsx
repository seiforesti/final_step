import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CodeIcon from "@mui/icons-material/Code";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import {
  useConditionTemplates,
  usePrebuiltConditionTemplates,
  useCreateConditionTemplate,
  useUpdateConditionTemplate,
  useDeleteConditionTemplate,
  ConditionTemplate,
} from "../../api/rbac";

import PageHeader from "./components/PageHeader";
import CommandBar from "./components/CommandBar";
import DataTable from "./components/DataTable";
import FilterBar from "./components/FilterBar";
import FormDialog from "./components/FormDialog";
import ConfirmationDialog from "./components/ConfirmationDialog";
import StatusCard from "./components/StatusCard";
import JsonViewer from "./components/JsonViewer";

const NewConditionsPage: React.FC = () => {
  // Data fetching hooks
  const {
    data: templates = [],
    isLoading: templatesLoading,
    refetch,
  } = useConditionTemplates();
  const { data: prebuiltTemplates = [], isLoading: prebuiltLoading } =
    usePrebuiltConditionTemplates();
  const createTemplate = useCreateConditionTemplate();
  const updateTemplate = useUpdateConditionTemplate();
  const deleteTemplate = useDeleteConditionTemplate();

  // State for modals and panels
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // State for selected items
  const [selectedTemplate, setSelectedTemplate] =
    useState<ConditionTemplate | null>(null);

  // Form state
  const [selectedPrebuilt, setSelectedPrebuilt] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  // Reset form when opening add modal
  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setSelectedPrebuilt("");
    setCustomLabel("");
    setCustomValue("");
    setCustomDescription("");
    setJsonError(null);
    setAddEditModalOpen(true);
  };

  // Set form values when opening edit modal
  const handleEditTemplate = (template: ConditionTemplate) => {
    setSelectedTemplate(template);
    setSelectedPrebuilt("");
    setCustomLabel(template.label);
    setCustomValue(template.value);
    setCustomDescription(template.description || "");
    setJsonError(null);
    setAddEditModalOpen(true);
  };

  // Validate JSON format
  const validateJson = (value: string): boolean => {
    if (!value.trim()) {
      setJsonError("JSON value is required");
      return false;
    }

    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch (error) {
      setJsonError("Invalid JSON format");
      return false;
    }
  };

  // Handle form submission for add/edit
  const handleSaveTemplate = async () => {
    // Check if using prebuilt template
    if (selectedPrebuilt) {
      const prebuilt = prebuiltTemplates.find(
        (t) => t.label === selectedPrebuilt
      );
      if (!prebuilt) return;

      // Check for duplicate label
      if (
        templates.some(
          (t) =>
            t.label.trim().toLowerCase() ===
              prebuilt.label.trim().toLowerCase() &&
            (!selectedTemplate || t.id !== selectedTemplate.id)
        )
      ) {
        setJsonError("A condition template with this label already exists");
        return;
      }

      try {
        await createTemplate.mutateAsync({ ...prebuilt, from_prebuilt: true });
        setAddEditModalOpen(false);
        refetch();
      } catch (error) {
        console.error("Failed to create template from prebuilt:", error);
      }
    } else {
      // Using custom template
      if (!customLabel.trim()) {
        setJsonError("Label is required");
        return;
      }

      if (!validateJson(customValue)) {
        return;
      }

      // Check for duplicate label
      if (
        templates.some(
          (t) =>
            t.label.trim().toLowerCase() === customLabel.trim().toLowerCase() &&
            (!selectedTemplate || t.id !== selectedTemplate.id)
        )
      ) {
        setJsonError("A condition template with this label already exists");
        return;
      }

      try {
        if (selectedTemplate) {
          // Update existing template
          await updateTemplate.mutateAsync({
            id: selectedTemplate.id as number,
            label: customLabel.trim(),
            value: customValue,
            description: customDescription,
          });
        } else {
          // Create new template
          await createTemplate.mutateAsync({
            label: customLabel.trim(),
            value: customValue,
            description: customDescription,
          });
        }
        setAddEditModalOpen(false);
        refetch();
      } catch (error) {
        console.error("Failed to save condition template:", error);
      }
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate || typeof selectedTemplate.id !== "number") return;

    try {
      await deleteTemplate.mutateAsync(selectedTemplate.id);
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete condition template:", error);
    }
  };

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;

    return (
      template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description &&
        template.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Define table columns
  const columns = [
    {
      id: "label",
      label: "Label",
      minWidth: 150,
      format: (value: string) => (
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      ),
      sortable: true,
    },
    {
      id: "value",
      label: "Value",
      minWidth: 250,
      format: (value: string) => (
        <Box
          sx={{ maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis" }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      id: "description",
      label: "Description",
      minWidth: 200,
      format: (value: string) => (
        <Typography
          variant="body2"
          color={value ? "textPrimary" : "textSecondary"}
        >
          {value || "No description"}
        </Typography>
      ),
    },
  ];

  // Define row actions
  const actions = [
    {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      onClick: (row: ConditionTemplate) => handleEditTemplate(row),
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row: ConditionTemplate) => {
        setSelectedTemplate(row);
        setDeleteDialogOpen(true);
      },
    },
  ];

  // Define command bar actions
  const primaryActions = [
    {
      key: "add-template",
      label: "Add Condition Template",
      icon: <AddIcon />,
      onClick: handleAddTemplate,
      primary: true,
    },
  ];

  const secondaryActions = [
    {
      key: "import",
      label: "Import",
      icon: <UploadFileIcon />,
      onClick: () => console.log("Import clicked"),
    },
    {
      key: "export",
      label: "Export",
      icon: <DownloadIcon />,
      onClick: () => console.log("Export clicked"),
    },
  ];

  // Define filter options
  const filterOptions = [
    {
      id: "source",
      label: "Source",
      options: [
        { value: "prebuilt", label: "From prebuilt" },
        { value: "custom", label: "Custom" },
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Condition Templates"
        subtitle="Manage condition templates for ABAC permissions"
        breadcrumbs={[
          { label: "RBAC System", href: "/rbac" },
          { label: "Conditions", href: "/rbac/conditions" },
        ]}
        helpLink="/openapi#tag/Condition-Templates"
        helpTooltip="See OpenAPI documentation for condition template schema, usage, and examples."
      />

      <CommandBar
        primaryActions={primaryActions}
        secondaryActions={secondaryActions}
      />

      <Box sx={{ my: 2 }}>
        <FilterBar
          searchPlaceholder="Search templates..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          onFilterRemove={(filterId) => {
            setActiveFilters(activeFilters.filter((f) => f.id !== filterId));
          }}
          onFiltersClear={() => setActiveFilters([])}
        />
      </Box>

      <DataTable
        columns={columns}
        data={filteredTemplates}
        keyExtractor={(row) => row.id?.toString() || row.label}
        loading={templatesLoading}
        actions={actions}
        pagination
        emptyMessage="No condition templates found. Create a new template to get started."
      />

      {/* Add/Edit Template Modal */}
      <FormDialog
        open={addEditModalOpen}
        title={
          selectedTemplate
            ? "Edit Condition Template"
            : "Add Condition Template"
        }
        onClose={() => setAddEditModalOpen(false)}
        onSubmit={handleSaveTemplate}
        submitLabel={selectedTemplate ? "Save Changes" : "Add Template"}
        loading={createTemplate.isPending || updateTemplate.isPending}
        maxWidth="md"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {!selectedTemplate && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Prebuilt Templates
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="prebuilt-select-label">
                  Select Prebuilt Template
                </InputLabel>
                <Select
                  labelId="prebuilt-select-label"
                  value={selectedPrebuilt}
                  onChange={(e) => setSelectedPrebuilt(e.target.value)}
                  label="Select Prebuilt Template"
                  disabled={prebuiltLoading}
                >
                  <MenuItem value="">-- Select a template --</MenuItem>
                  {prebuiltTemplates.map((template) => (
                    <MenuItem key={template.label} value={template.label}>
                      {template.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {prebuiltLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
            </Box>
          )}

          <Typography variant="subtitle1" gutterBottom>
            {selectedTemplate ? "Edit Template" : "Custom Template"}
            <Tooltip title="A condition template defines a reusable set of conditions for ABAC policies. See OpenAPI docs for schema.">
              <HelpOutlineIcon
                fontSize="small"
                sx={{ ml: 1, verticalAlign: "middle" }}
              />
            </Tooltip>
          </Typography>

          <TextField
            label="Label"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            fullWidth
            required
            disabled={!!selectedPrebuilt}
            error={!customLabel.trim() && !selectedPrebuilt}
            helperText={
              !customLabel.trim() && !selectedPrebuilt
                ? "Label is required"
                : ""
            }
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Value (JSON)
              <Tooltip
                title={
                  'Enter a valid JSON object. Example: {"department": "HR"}. See OpenAPI docs for more.'
                }
              >
                <InfoOutlinedIcon
                  fontSize="small"
                  sx={{ ml: 1, verticalAlign: "middle" }}
                />
              </Tooltip>
            </Typography>
            <TextField
              value={customValue}
              onChange={(e) => {
                setCustomValue(e.target.value);
                validateJson(e.target.value);
              }}
              fullWidth
              multiline
              rows={6}
              placeholder='{"department": "HR"}'
              variant="outlined"
              disabled={!!selectedPrebuilt}
              error={!!jsonError}
              helperText={jsonError}
              sx={{ fontFamily: "monospace" }}
            />
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Example: {'{"department": "HR"}'}
              </Typography>
            </Box>
          </Box>

          <TextField
            label="Description"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Describe the purpose of this condition template"
            disabled={!!selectedPrebuilt}
          />

          {selectedPrebuilt && (
            <StatusCard
              type="info"
              title="Using Prebuilt Template"
              message="You are creating a template based on a prebuilt template. The label, value, and description will be copied from the selected template."
            />
          )}
        </Box>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Condition Template"
        message={`Are you sure you want to delete the condition template "${selectedTemplate?.label}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteTemplate}
        onCancel={() => setDeleteDialogOpen(false)}
        severity="error"
        confirmButtonColor="error"
        loading={deleteTemplate.isPending}
      />
    </Box>
  );
};

export default NewConditionsPage;
