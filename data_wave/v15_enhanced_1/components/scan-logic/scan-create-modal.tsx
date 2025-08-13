"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { X, Plus } from "lucide-react"
import type { ScanConfig } from "./types"

interface ScanCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateScan: (scan: Omit<ScanConfig, "id" | "createdAt" | "updatedAt">) => Promise<ScanConfig>
}

export function ScanCreateModal({ open, onOpenChange, onCreateScan }: ScanCreateModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dataSourceId: "",
    dataSourceName: "",
    scanType: "full" as ScanConfig["scanType"],
    scope: {
      databases: [] as string[],
      schemas: [] as string[],
      tables: [] as string[],
    },
    settings: {
      enablePII: true,
      enableClassification: true,
      enableLineage: false,
      enableQuality: true,
      sampleSize: 1000,
      parallelism: 4,
    },
    schedule: {
      enabled: false,
      cron: "0 2 * * *",
      timezone: "UTC",
    },
    createdBy: "current.user@company.com",
    status: "active" as ScanConfig["status"],
  })

  const [newDatabase, setNewDatabase] = useState("")
  const [newSchema, setNewSchema] = useState("")
  const [newTable, setNewTable] = useState("")

  const mockDataSources = [
    { id: "ds-1", name: "Customer PostgreSQL" },
    { id: "ds-2", name: "Sales MySQL" },
    { id: "ds-3", name: "AWS S3 Data Lake" },
    { id: "ds-4", name: "Snowflake DW" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onCreateScan(formData)
      onOpenChange(false)
      // Reset form
      setFormData({
        name: "",
        description: "",
        dataSourceId: "",
        dataSourceName: "",
        scanType: "full",
        scope: { databases: [], schemas: [], tables: [] },
        settings: {
          enablePII: true,
          enableClassification: true,
          enableLineage: false,
          enableQuality: true,
          sampleSize: 1000,
          parallelism: 4,
        },
        schedule: {
          enabled: false,
          cron: "0 2 * * *",
          timezone: "UTC",
        },
        createdBy: "current.user@company.com",
        status: "active",
      })
    } catch (error) {
      console.error("Failed to create scan:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToScope = (type: "databases" | "schemas" | "tables", value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        scope: {
          ...prev.scope,
          [type]: [...prev.scope[type], value.trim()],
        },
      }))
    }
  }

  const removeFromScope = (type: "databases" | "schemas" | "tables", index: number) => {
    setFormData((prev) => ({
      ...prev,
      scope: {
        ...prev.scope,
        [type]: prev.scope[type].filter((_, i) => i !== index),
      },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Scan</DialogTitle>
          <DialogDescription>Configure a new data discovery scan to analyze your data sources.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="scope">Scope</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Scan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter scan name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scanType">Scan Type</Label>
                  <Select
                    value={formData.scanType}
                    onValueChange={(value: ScanConfig["scanType"]) =>
                      setFormData((prev) => ({ ...prev, scanType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Scan</SelectItem>
                      <SelectItem value="incremental">Incremental Scan</SelectItem>
                      <SelectItem value="sample">Sample Scan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this scan"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataSource">Data Source</Label>
                <Select
                  value={formData.dataSourceId}
                  onValueChange={(value) => {
                    const source = mockDataSources.find((ds) => ds.id === value)
                    setFormData((prev) => ({
                      ...prev,
                      dataSourceId: value,
                      dataSourceName: source?.name || "",
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDataSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="scope" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Scan Scope</CardTitle>
                  <CardDescription>Define which databases, schemas, and tables to include in the scan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Databases */}
                  <div className="space-y-2">
                    <Label>Databases</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={newDatabase}
                        onChange={(e) => setNewDatabase(e.target.value)}
                        placeholder="Database name"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addToScope("databases", newDatabase)
                            setNewDatabase("")
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          addToScope("databases", newDatabase)
                          setNewDatabase("")
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.scope.databases.map((db, index) => (
                        <Badge key={index} variant="secondary">
                          {db}
                          <button
                            type="button"
                            onClick={() => removeFromScope("databases", index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Schemas */}
                  <div className="space-y-2">
                    <Label>Schemas (Optional)</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={newSchema}
                        onChange={(e) => setNewSchema(e.target.value)}
                        placeholder="Schema name"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addToScope("schemas", newSchema)
                            setNewSchema("")
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          addToScope("schemas", newSchema)
                          setNewSchema("")
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.scope.schemas.map((schema, index) => (
                        <Badge key={index} variant="secondary">
                          {schema}
                          <button
                            type="button"
                            onClick={() => removeFromScope("schemas", index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Tables */}
                  <div className="space-y-2">
                    <Label>Tables (Optional)</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={newTable}
                        onChange={(e) => setNewTable(e.target.value)}
                        placeholder="Table name"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addToScope("tables", newTable)
                            setNewTable("")
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          addToScope("tables", newTable)
                          setNewTable("")
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.scope.tables.map((table, index) => (
                        <Badge key={index} variant="secondary">
                          {table}
                          <button
                            type="button"
                            onClick={() => removeFromScope("tables", index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Scan Features</CardTitle>
                  <CardDescription>Configure which features to enable during the scan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>PII Detection</Label>
                        <p className="text-sm text-muted-foreground">Detect personally identifiable information</p>
                      </div>
                      <Switch
                        checked={formData.settings.enablePII}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, enablePII: checked },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Classification</Label>
                        <p className="text-sm text-muted-foreground">Automatically classify data types</p>
                      </div>
                      <Switch
                        checked={formData.settings.enableClassification}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, enableClassification: checked },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Lineage</Label>
                        <p className="text-sm text-muted-foreground">Track data flow and dependencies</p>
                      </div>
                      <Switch
                        checked={formData.settings.enableLineage}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, enableLineage: checked },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Quality</Label>
                        <p className="text-sm text-muted-foreground">Assess data quality metrics</p>
                      </div>
                      <Switch
                        checked={formData.settings.enableQuality}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, enableQuality: checked },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    {formData.scanType === "sample" && (
                      <div className="space-y-2">
                        <Label htmlFor="sampleSize">Sample Size</Label>
                        <Input
                          id="sampleSize"
                          type="number"
                          value={formData.settings.sampleSize}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              settings: { ...prev.settings, sampleSize: Number.parseInt(e.target.value) || 1000 },
                            }))
                          }
                          min="100"
                          max="100000"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="parallelism">Parallelism</Label>
                      <Select
                        value={formData.settings.parallelism.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, parallelism: Number.parseInt(value) },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 thread</SelectItem>
                          <SelectItem value="2">2 threads</SelectItem>
                          <SelectItem value="4">4 threads</SelectItem>
                          <SelectItem value="8">8 threads</SelectItem>
                          <SelectItem value="16">16 threads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Schedule Configuration</CardTitle>
                  <CardDescription>Set up automatic scheduling for this scan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Scheduling</Label>
                      <p className="text-sm text-muted-foreground">Run this scan automatically on a schedule</p>
                    </div>
                    <Switch
                      checked={formData.schedule.enabled}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          schedule: { ...prev.schedule, enabled: checked },
                        }))
                      }
                    />
                  </div>

                  {formData.schedule.enabled && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cron">Cron Expression</Label>
                          <Select
                            value={formData.schedule.cron}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                schedule: { ...prev.schedule, cron: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0 2 * * *">Daily at 2:00 AM</SelectItem>
                              <SelectItem value="0 2 * * 0">Weekly on Sunday at 2:00 AM</SelectItem>
                              <SelectItem value="0 2 1 * *">Monthly on 1st at 2:00 AM</SelectItem>
                              <SelectItem value="0 */6 * * *">Every 6 hours</SelectItem>
                              <SelectItem value="0 */12 * * *">Every 12 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select
                            value={formData.schedule.timezone}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                schedule: { ...prev.schedule, timezone: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">Eastern Time</SelectItem>
                              <SelectItem value="America/Chicago">Central Time</SelectItem>
                              <SelectItem value="America/Denver">Mountain Time</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                              <SelectItem value="Europe/London">London</SelectItem>
                              <SelectItem value="Europe/Paris">Paris</SelectItem>
                              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.dataSourceId}>
              {loading ? "Creating..." : "Create Scan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
