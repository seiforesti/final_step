"use client"

import { useState, useEffect } from "react"
import {
  Filter,
  Search,
  X,
  Save,
  Star,
  MoreHorizontal,
  RefreshCw,
  Database,
  Calendar,
  Tag,
  Shield,
  Cloud,
  MapPin,
  Users,
  Building,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { Slider } from "@/components/ui/slider"

import { DataSource } from "./types"

interface DataSourceFiltersProps {
  filters: any
  onFiltersChange: (filters: any) => void
  dataSources?: DataSource[]
}

interface FilterPreset {
  id: string
  name: string
  description: string
  filters: any
  isDefault?: boolean
  isFavorite?: boolean
}

const defaultPresets: FilterPreset[] = [
  {
    id: "all",
    name: "All Data Sources",
    description: "Show all data sources",
    filters: {},
    isDefault: true,
  },
  {
    id: "connected",
    name: "Connected Sources",
    description: "Only connected data sources",
    filters: { status: ["connected"] },
  },
  {
    id: "production",
    name: "Production Environment",
    description: "Production data sources only",
    filters: { environment: ["production"], criticality: ["high", "critical"] },
  },
  {
    id: "issues",
    name: "Sources with Issues",
    description: "Data sources with errors or warnings",
    filters: { status: ["error", "warning"] },
  },
  {
    id: "cloud",
    name: "Cloud Sources",
    description: "Cloud-based data sources",
    filters: { type: ["s3", "azure", "gcp"] },
  },
  {
    id: "databases",
    name: "Database Sources",
    description: "Traditional database sources",
    filters: { type: ["postgresql", "mysql", "mongodb"] },
  },
]

export function DataSourceFilters({
  filters,
  onFiltersChange,
  dataSources = []
}: DataSourceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activePreset, setActivePreset] = useState("all")
  const [customPresets, setCustomPresets] = useState<FilterPreset[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newPresetName, setNewPresetName] = useState("")
  const [newPresetDescription, setNewPresetDescription] = useState("")

  // Extract unique values from data sources for filter options
  const filterOptions = {
    types: [...new Set(dataSources.map(ds => ds.type))],
    statuses: [...new Set(dataSources.map(ds => ds.status))],
    environments: [...new Set(dataSources.map(ds => ds.environment).filter(Boolean))],
    locations: [...new Set(dataSources.map(ds => ds.location).filter(Boolean))],
    owners: [...new Set(dataSources.map(ds => ds.owner).filter(Boolean))],
    teams: [...new Set(dataSources.map(ds => ds.team).filter(Boolean))],
    tags: [...new Set(dataSources.flatMap(ds => ds.tags || []))],
  }

  const allPresets = [...defaultPresets, ...customPresets]

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    onFiltersChange(newFilters)
    setActivePreset("") // Clear preset when manual filter is applied
  }

  const handleMultiSelectChange = (key: string, value: string, checked: boolean) => {
    const currentValues = filters[key] || []
    let newValues
    
    if (checked) {
      newValues = [...currentValues, value]
    } else {
      newValues = currentValues.filter((v: string) => v !== value)
    }
    
    handleFilterChange(key, newValues.length > 0 ? newValues : undefined)
  }

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters)
    setActivePreset(preset.id)
  }

  const clearFilters = () => {
    onFiltersChange({})
    setActivePreset("all")
  }

  const saveCustomPreset = () => {
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName,
      description: newPresetDescription,
      filters: { ...filters },
    }
    
    setCustomPresets(prev => [...prev, newPreset])
    setShowSaveDialog(false)
    setNewPresetName("")
    setNewPresetDescription("")
    setActivePreset(newPreset.id)
  }

  const deletePreset = (presetId: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== presetId))
    if (activePreset === presetId) {
      setActivePreset("all")
    }
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== "" && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length
  }

  const MultiSelectFilter = ({ 
    title, 
    options, 
    filterKey, 
    icon: Icon 
  }: {
    title: string
    options: string[]
    filterKey: string
    icon: any
  }) => (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium">{title}</span>
          {filters[filterKey]?.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters[filterKey].length}
            </Badge>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-3 pt-0">
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {options.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${filterKey}-${option}`}
                checked={filters[filterKey]?.includes(option) || false}
                onCheckedChange={(checked) => 
                  handleMultiSelectChange(filterKey, option, checked as boolean)
                }
              />
              <Label htmlFor={`${filterKey}-${option}`} className="text-sm capitalize">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Save Current Filters
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onFiltersChange({...filters})}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Results
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allPresets.map(preset => (
              <Button
                key={preset.id}
                variant={activePreset === preset.id ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs"
              >
                {preset.isFavorite && <Star className="h-3 w-3 mr-1" />}
                {preset.name}
                {!preset.isDefault && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => deletePreset(preset.id)}>
                        <X className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <div className="space-y-4">
            {/* Search Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search data sources..."
                    value={filters.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <MultiSelectFilter
                  title="Data Source Type"
                  options={filterOptions.types}
                  filterKey="type"
                  icon={Database}
                />
                <Separator />
                <MultiSelectFilter
                  title="Connection Status"
                  options={filterOptions.statuses}
                  filterKey="status"
                  icon={Activity}
                />
                <Separator />
                <MultiSelectFilter
                  title="Environment"
                  options={filterOptions.environments}
                  filterKey="environment"
                  icon={Cloud}
                />
                <Separator />
                <MultiSelectFilter
                  title="Location"
                  options={filterOptions.locations}
                  filterKey="location"
                  icon={MapPin}
                />
              </CardContent>
            </Card>

            {/* Ownership Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ownership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <MultiSelectFilter
                  title="Owner"
                  options={filterOptions.owners}
                  filterKey="owner"
                  icon={Users}
                />
                <Separator />
                <MultiSelectFilter
                  title="Team"
                  options={filterOptions.teams}
                  filterKey="team"
                  icon={Building}
                />
              </CardContent>
            </Card>

            {/* Feature Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monitoring-filter">Monitoring Enabled</Label>
                  <Switch
                    id="monitoring-filter"
                    checked={filters.monitoring_enabled || false}
                    onCheckedChange={(checked) => 
                      handleFilterChange("monitoring_enabled", checked ? true : undefined)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="backup-filter">Backup Enabled</Label>
                  <Switch
                    id="backup-filter"
                    checked={filters.backup_enabled || false}
                    onCheckedChange={(checked) => 
                      handleFilterChange("backup_enabled", checked ? true : undefined)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="encryption-filter">Encryption Enabled</Label>
                  <Switch
                    id="encryption-filter"
                    checked={filters.encryption_enabled || false}
                    onCheckedChange={(checked) => 
                      handleFilterChange("encryption_enabled", checked ? true : undefined)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date Range Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Date Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Created Date</Label>
                    <DatePickerWithRange
                      value={filters.created_date_range}
                      onChange={(range) => handleFilterChange("created_date_range", range)}
                    />
                  </div>
                  <div>
                    <Label>Last Updated</Label>
                    <DatePickerWithRange
                      value={filters.updated_date_range}
                      onChange={(range) => handleFilterChange("updated_date_range", range)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Health Score Range</Label>
                  <div className="px-2 py-4">
                    <Slider
                      value={filters.health_score_range || [0, 100]}
                      onValueChange={(value) => handleFilterChange("health_score_range", value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{filters.health_score_range?.[0] || 0}%</span>
                      <span>{filters.health_score_range?.[1] || 100}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Response Time (ms)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.response_time_min || ""}
                      onChange={(e) => handleFilterChange("response_time_min", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.response_time_max || ""}
                      onChange={(e) => handleFilterChange("response_time_max", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags Filter */}
            {filterOptions.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <MultiSelectFilter
                    title="Available Tags"
                    options={filterOptions.tags}
                    filterKey="tags"
                    icon={Tag}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Summary */}
      {getActiveFilterCount() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null
                
                return (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key.replace(/_/g, " ")}: {
                      Array.isArray(value) ? value.join(", ") : value.toString()
                    }
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleFilterChange(key, undefined)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Filter Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save the current filter configuration as a preset for quick access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Enter preset name"
              />
            </div>
            <div>
              <Label htmlFor="preset-description">Description</Label>
              <Input
                id="preset-description"
                value={newPresetDescription}
                onChange={(e) => setNewPresetDescription(e.target.value)}
                placeholder="Enter description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCustomPreset} disabled={!newPresetName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}