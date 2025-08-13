"use client"

import { useState, useEffect } from "react"
import {
  X,
  Database,
  Table,
  Columns,
  Folder,
  File,
  Shield,
  Tag,
  Info,
  Plus,
  Trash2,
  Copy,
  Save,
  AlertTriangle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data
const mockDataSources = [
  { id: 1, name: "PostgreSQL Production", type: "postgresql" },
  { id: 2, name: "MySQL Inventory", type: "mysql" },
  { id: 3, name: "MongoDB Logs", type: "mongodb" },
  { id: 4, name: "Snowflake Analytics", type: "snowflake" },
]

const mockSensitivityLabels = [
  { id: 1, name: "Low", level: "low", description: "Public or non-sensitive data" },
  { id: 2, name: "Medium", level: "medium", description: "Internal business data" },
  { id: 3, name: "High", level: "high", description: "Confidential or PII data" },
  { id: 4, name: "Critical", level: "critical", description: "Highly sensitive regulated data" },
]

const mockParentEntities = [
  { id: 1, name: "production", entity_type: "database", qualified_name: "production" },
  { id: 2, name: "analytics", entity_type: "schema", qualified_name: "production.analytics" },
  { id: 3, name: "users", entity_type: "schema", qualified_name: "production.users" },
  { id: 4, name: "inventory", entity_type: "schema", qualified_name: "production.inventory" },
]

// Entity type configuration
const entityTypes = [
  { value: "database", label: "Database", icon: Database, description: "Top-level database container" },
  { value: "schema", label: "Schema", icon: Folder, description: "Logical grouping within database" },
  { value: "table", label: "Table", icon: Table, description: "Structured data table" },
  { value: "column", label: "Column", icon: Columns, description: "Individual table column" },
  { value: "file", label: "File", icon: File, description: "File-based data asset" },
]

// Common classifications
const commonClassifications = [
  "PII",
  "Financial",
  "Customer Data",
  "Product",
  "Analytics",
  "Logs",
  "Confidential",
  "Public",
  "Internal",
  "Regulatory",
  "Compliance",
  "Audit",
  "Marketing",
  "Sales",
  "Operations",
]

// Get entity icon
const getEntityIcon = (type: string) => {
  const entityType = entityTypes.find((t) => t.value === type)
  return entityType ? entityType.icon : Database
}

// Get sensitivity color
const getSensitivityColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case "critical":
      return "destructive"
    case "high":
      return "destructive"
    case "medium":
      return "warning"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}

// Get parent type based on entity type
const getParentType = (entityType: string) => {
  switch (entityType) {
    case "schema":
      return "database"
    case "table":
      return "schema"
    case "column":
      return "table"
    case "file":
      return "folder"
    default:
      return null
  }
}

interface EntityCreateEditModalProps {
  open: boolean
  onClose: () => void
  entityToEdit?: any
  onSuccess: () => void
}

export default function EntityCreateEditModal({ open, onClose, entityToEdit, onSuccess }: EntityCreateEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [showJsonPreview, setShowJsonPreview] = useState(false)
  const [newClassification, setNewClassification] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    entity_type: "",
    name: "",
    qualified_name: "",
    description: "",
    data_source_id: "",
    parent_id: "",
    sensitivity_label_id: "",
    classifications: [] as string[],
    properties: {} as Record<string, any>,
  })

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const isEditMode = Boolean(entityToEdit)

  // Initialize form data
  useEffect(() => {
    if (entityToEdit) {
      setFormData({
        entity_type: entityToEdit.entity_type || "",
        name: entityToEdit.name || "",
        qualified_name: entityToEdit.qualified_name || "",
        description: entityToEdit.description || "",
        data_source_id: entityToEdit.data_source_id?.toString() || "",
        parent_id: entityToEdit.parent_id?.toString() || "",
        sensitivity_label_id: entityToEdit.sensitivity_label_id?.toString() || "",
        classifications: entityToEdit.classifications || [],
        properties: entityToEdit.properties || {},
      })
    } else {
      setFormData({
        entity_type: "",
        name: "",
        qualified_name: "",
        description: "",
        data_source_id: "",
        parent_id: "",
        sensitivity_label_id: "",
        classifications: [],
        properties: {},
      })
    }
    setValidationErrors({})
    setError(null)
    setActiveTab("basic")
  }, [entityToEdit, open])

  // Auto-generate qualified name
  useEffect(() => {
    if (!isEditMode && formData.name && formData.data_source_id) {
      const parentEntity = mockParentEntities.find((pe) => pe.id.toString() === formData.parent_id)

      let qualifiedName = ""
      if (parentEntity) {
        qualifiedName = `${parentEntity.qualified_name}.${formData.name}`
      } else {
        qualifiedName = formData.name
      }

      if (qualifiedName !== formData.qualified_name) {
        setFormData((prev) => ({ ...prev, qualified_name: qualifiedName }))
      }
    }
  }, [formData.name, formData.data_source_id, formData.parent_id, isEditMode])

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.entity_type) errors.entity_type = "Entity type is required"
    if (!formData.name) errors.name = "Name is required"
    if (!formData.qualified_name) errors.qualified_name = "Qualified name is required"
    if (!formData.data_source_id) errors.data_source_id = "Data source is required"

    // Parent validation
    if (formData.entity_type !== "database" && !formData.parent_id) {
      errors.parent_id = "Parent entity is required for non-database entities"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setActiveTab("basic")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock success
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? "update" : "create"} entity`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle classification changes
  const handleClassificationAdd = (classification: string) => {
    if (!formData.classifications.includes(classification)) {
      setFormData((prev) => ({
        ...prev,
        classifications: [...prev.classifications, classification],
      }))
    }
  }

  const handleClassificationRemove = (classification: string) => {
    setFormData((prev) => ({
      ...prev,
      classifications: prev.classifications.filter((c) => c !== classification),
    }))
  }

  const handleAddNewClassification = () => {
    if (newClassification.trim() && !formData.classifications.includes(newClassification.trim())) {
      handleClassificationAdd(newClassification.trim())
      setNewClassification("")
    }
  }

  // Handle property changes
  const handlePropertyAdd = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      properties: { ...prev.properties, [key]: value },
    }))
  }

  const handlePropertyRemove = (key: string) => {
    setFormData((prev) => {
      const newProperties = { ...prev.properties }
      delete newProperties[key]
      return { ...prev, properties: newProperties }
    })
  }

  // Get filtered parent entities
  const getFilteredParentEntities = () => {
    const parentType = getParentType(formData.entity_type)
    if (!parentType) return []

    return mockParentEntities.filter(
      (entity) =>
        entity.entity_type === parentType &&
        (!formData.data_source_id || entity.qualified_name.startsWith("production")), // Mock filtering by data source
    )
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Database className="h-5 w-5" />
                Edit Entity
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Create New Entity
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the entity information and metadata"
              : "Add a new data entity to your catalog with proper classification and metadata"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="classification" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Classification
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Properties
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entity Type */}
                <div className="space-y-2">
                  <Label htmlFor="entity_type">
                    Entity Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.entity_type}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, entity_type: value, parent_id: "" }))
                      setValidationErrors((prev) => ({ ...prev, entity_type: "" }))
                    }}
                    disabled={isEditMode}
                  >
                    <SelectTrigger className={cn(validationErrors.entity_type && "border-destructive")}>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map((type) => {
                        const Icon = type.icon
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {validationErrors.entity_type && (
                    <p className="text-sm text-destructive">{validationErrors.entity_type}</p>
                  )}
                </div>

                {/* Data Source */}
                <div className="space-y-2">
                  <Label htmlFor="data_source_id">
                    Data Source <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.data_source_id}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, data_source_id: value, parent_id: "" }))
                      setValidationErrors((prev) => ({ ...prev, data_source_id: "" }))
                    }}
                    disabled={isEditMode}
                  >
                    <SelectTrigger className={cn(validationErrors.data_source_id && "border-destructive")}>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{source.name}</div>
                              <div className="text-xs text-muted-foreground">{source.type}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.data_source_id && (
                    <p className="text-sm text-destructive">{validationErrors.data_source_id}</p>
                  )}
                </div>

                {/* Parent Entity */}
                {formData.entity_type && formData.entity_type !== "database" && (
                  <div className="space-y-2">
                    <Label htmlFor="parent_id">
                      Parent{" "}
                      {getParentType(formData.entity_type)?.charAt(0).toUpperCase() +
                        getParentType(formData.entity_type)?.slice(1)}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.parent_id}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, parent_id: value }))
                        setValidationErrors((prev) => ({ ...prev, parent_id: "" }))
                      }}
                    >
                      <SelectTrigger className={cn(validationErrors.parent_id && "border-destructive")}>
                        <SelectValue placeholder={`Select parent ${getParentType(formData.entity_type)}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getFilteredParentEntities().map((parent) => {
                          const Icon = getEntityIcon(parent.entity_type)
                          return (
                            <SelectItem key={parent.id} value={parent.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">{parent.name}</div>
                                  <div className="text-xs text-muted-foreground">{parent.qualified_name}</div>
                                </div>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {validationErrors.parent_id && (
                      <p className="text-sm text-destructive">{validationErrors.parent_id}</p>
                    )}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                      setValidationErrors((prev) => ({ ...prev, name: "" }))
                    }}
                    placeholder="Enter entity name"
                    className={cn(validationErrors.name && "border-destructive")}
                  />
                  {validationErrors.name && <p className="text-sm text-destructive">{validationErrors.name}</p>}
                </div>
              </div>

              {/* Qualified Name */}
              <div className="space-y-2">
                <Label htmlFor="qualified_name">
                  Qualified Name <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="qualified_name"
                    value={formData.qualified_name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, qualified_name: e.target.value }))
                      setValidationErrors((prev) => ({ ...prev, qualified_name: "" }))
                    }}
                    placeholder="Fully qualified name (e.g., database.schema.table)"
                    className={cn(validationErrors.qualified_name && "border-destructive")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(formData.qualified_name)}
                    disabled={!formData.qualified_name}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {validationErrors.qualified_name && (
                  <p className="text-sm text-destructive">{validationErrors.qualified_name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  The fully qualified name uniquely identifies this entity across your data ecosystem
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and content of this entity"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Classification Tab */}
            <TabsContent value="classification" className="space-y-6">
              {/* Sensitivity Label */}
              <div className="space-y-2">
                <Label htmlFor="sensitivity_label_id">Sensitivity Level</Label>
                <Select
                  value={formData.sensitivity_label_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, sensitivity_label_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sensitivity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No sensitivity classification</SelectItem>
                    {mockSensitivityLabels.map((label) => (
                      <SelectItem key={label.id} value={label.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSensitivityColor(label.level) as any} className="w-2 h-2 p-0" />
                          <div>
                            <div className="font-medium">{label.name}</div>
                            <div className="text-xs text-muted-foreground">{label.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Classifications */}
              <div className="space-y-4">
                <div>
                  <Label>Classifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Add tags to categorize and organize this entity for better discovery and governance
                  </p>
                </div>

                {/* Current Classifications */}
                {formData.classifications.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Current Classifications</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.classifications.map((classification) => (
                        <Badge key={classification} variant="secondary" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {classification}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => handleClassificationRemove(classification)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Classification */}
                <div className="space-y-2">
                  <Label className="text-sm">Add Classification</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newClassification}
                      onChange={(e) => setNewClassification(e.target.value)}
                      placeholder="Enter custom classification"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddNewClassification()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddNewClassification} disabled={!newClassification.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Common Classifications */}
                <div className="space-y-2">
                  <Label className="text-sm">Common Classifications</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {commonClassifications.map((classification) => (
                      <Button
                        key={classification}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="justify-start bg-transparent"
                        onClick={() => handleClassificationAdd(classification)}
                        disabled={formData.classifications.includes(classification)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {classification}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Classification Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Classification Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>
                    <strong>PII:</strong> Personally Identifiable Information (names, emails, SSN, etc.)
                  </div>
                  <div>
                    <strong>Financial:</strong> Financial data, transactions, payment information
                  </div>
                  <div>
                    <strong>Confidential:</strong> Internal business data not for public disclosure
                  </div>
                  <div>
                    <strong>Public:</strong> Data that can be freely shared externally
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Custom Properties</Label>
                  <p className="text-xs text-muted-foreground">
                    Add custom metadata properties specific to this entity type
                  </p>
                </div>

                {/* Existing Properties */}
                {Object.keys(formData.properties).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Current Properties</Label>
                    <div className="space-y-2">
                      {Object.entries(formData.properties).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 p-2 border rounded">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input value={key} disabled className="font-mono text-sm" />
                            <Input
                              value={typeof value === "object" ? JSON.stringify(value) : String(value)}
                              onChange={(e) => {
                                try {
                                  const newValue = JSON.parse(e.target.value)
                                  handlePropertyAdd(key, newValue)
                                } catch {
                                  handlePropertyAdd(key, e.target.value)
                                }
                              }}
                              className="font-mono text-sm"
                            />
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handlePropertyRemove(key)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Property */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Add New Property</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Property Name</Label>
                        <Input placeholder="e.g., data_type, max_length" className="font-mono text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Property Value</Label>
                        <Input placeholder="e.g., varchar, 255" className="font-mono text-sm" />
                      </div>
                    </div>
                    <Button type="button" className="mt-2" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </CardContent>
                </Card>

                {/* Property Examples */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Property Examples
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>
                      <strong>Table Properties:</strong> row_count, size_bytes, partitions, compression
                    </div>
                    <div>
                      <strong>Column Properties:</strong> data_type, max_length, nullable, default_value
                    </div>
                    <div>
                      <strong>File Properties:</strong> file_format, encoding, delimiter, header_row
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? "Update Entity" : "Create Entity"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
