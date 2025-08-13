"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, Info } from "lucide-react"
import { LoadingSpinner } from "./LoadingSpinner"
import type { ScanRuleSet } from "../types"

const editRuleSetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  type: z.enum(["system", "custom"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  dataSourceTypes: z.array(z.string()).min(1, "At least one data source type is required"),
  tags: z.array(z.string()).optional(),
  compliance: z
    .object({
      gdpr: z.boolean(),
      hipaa: z.boolean(),
      sox: z.boolean(),
      pci: z.boolean(),
    })
    .optional(),
  schedule: z
    .object({
      enabled: z.boolean(),
      cron: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
})

type EditRuleSetFormData = z.infer<typeof editRuleSetSchema>

interface ScanRuleSetEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ruleSet: ScanRuleSet
  onSubmit: (data: Partial<ScanRuleSet>) => Promise<void>
  isLoading?: boolean
}

const dataSourceTypes = [
  "postgresql",
  "mysql",
  "oracle",
  "sqlserver",
  "snowflake",
  "bigquery",
  "redshift",
  "mongodb",
  "cassandra",
  "s3",
  "azure-blob",
  "gcs",
]

const timezones = ["UTC", "EST", "PST", "GMT", "CET", "JST", "IST"]

export const ScanRuleSetEditModal: React.FC<ScanRuleSetEditModalProps> = ({
  open,
  onOpenChange,
  ruleSet,
  onSubmit,
  isLoading = false,
}) => {
  const [newTag, setNewTag] = useState("")
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>(ruleSet.dataSourceTypes || [])
  const [tags, setTags] = useState<string[]>(ruleSet.tags || [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditRuleSetFormData>({
    resolver: zodResolver(editRuleSetSchema),
    defaultValues: {
      name: ruleSet.name,
      description: ruleSet.description,
      type: ruleSet.type,
      priority: ruleSet.priority,
      dataSourceTypes: ruleSet.dataSourceTypes,
      tags: ruleSet.tags,
      compliance: ruleSet.compliance || {
        gdpr: false,
        hipaa: false,
        sox: false,
        pci: false,
      },
      schedule: ruleSet.schedule || {
        enabled: false,
        timezone: "UTC",
      },
    },
  })

  const watchedValues = watch()

  // Update form when ruleSet changes
  useEffect(() => {
    if (ruleSet) {
      reset({
        name: ruleSet.name,
        description: ruleSet.description,
        type: ruleSet.type,
        priority: ruleSet.priority,
        dataSourceTypes: ruleSet.dataSourceTypes,
        tags: ruleSet.tags,
        compliance: ruleSet.compliance || {
          gdpr: false,
          hipaa: false,
          sox: false,
          pci: false,
        },
        schedule: ruleSet.schedule || {
          enabled: false,
          timezone: "UTC",
        },
      })
      setSelectedDataSources(ruleSet.dataSourceTypes || [])
      setTags(ruleSet.tags || [])
    }
  }, [ruleSet, reset])

  const handleDataSourceToggle = useCallback(
    (dataSource: string) => {
      const newSelection = selectedDataSources.includes(dataSource)
        ? selectedDataSources.filter((ds) => ds !== dataSource)
        : [...selectedDataSources, dataSource]

      setSelectedDataSources(newSelection)
      setValue("dataSourceTypes", newSelection)
    },
    [selectedDataSources, setValue],
  )

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const newTags = [...tags, newTag.trim()]
      setTags(newTags)
      setValue("tags", newTags)
      setNewTag("")
    }
  }, [newTag, tags, setValue])

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove)
      setTags(newTags)
      setValue("tags", newTags)
    },
    [tags, setValue],
  )

  const handleFormSubmit = useCallback(
    async (data: EditRuleSetFormData) => {
      try {
        await onSubmit(data)
      } catch (error) {
        // Error handling is done in the parent component
      }
    },
    [onSubmit],
  )

  const handleCancel = useCallback(() => {
    reset()
    setSelectedDataSources(ruleSet.dataSourceTypes || [])
    setTags(ruleSet.tags || [])
    setNewTag("")
    onOpenChange(false)
  }, [reset, ruleSet, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Scan Rule Set</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="datasources">Data Sources</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" {...register("name")} placeholder="Enter rule set name" />
                      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={watchedValues.type}
                        onValueChange={(value) => setValue("type", value as "system" | "custom")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe what this rule set does"
                      rows={3}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={watchedValues.priority}
                      onValueChange={(value) => setValue("priority", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && <p className="text-sm text-destructive">{errors.priority.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="datasources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supported Data Sources</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select the data source types this rule set can be applied to
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {dataSourceTypes.map((dataSource) => (
                      <div key={dataSource} className="flex items-center space-x-2">
                        <Checkbox
                          id={dataSource}
                          checked={selectedDataSources.includes(dataSource)}
                          onCheckedChange={() => handleDataSourceToggle(dataSource)}
                        />
                        <Label htmlFor={dataSource} className="capitalize">
                          {dataSource.replace("-", " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.dataSourceTypes && (
                    <p className="text-sm text-destructive mt-2">{errors.dataSourceTypes.message}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Standards</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Mark which compliance standards this rule set helps meet
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gdpr"
                        checked={watchedValues.compliance?.gdpr}
                        onCheckedChange={(checked) => setValue("compliance.gdpr", checked as boolean)}
                      />
                      <Label htmlFor="gdpr">GDPR (General Data Protection Regulation)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hipaa"
                        checked={watchedValues.compliance?.hipaa}
                        onCheckedChange={(checked) => setValue("compliance.hipaa", checked as boolean)}
                      />
                      <Label htmlFor="hipaa">HIPAA (Health Insurance Portability)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sox"
                        checked={watchedValues.compliance?.sox}
                        onCheckedChange={(checked) => setValue("compliance.sox", checked as boolean)}
                      />
                      <Label htmlFor="sox">SOX (Sarbanes-Oxley Act)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pci"
                        checked={watchedValues.compliance?.pci}
                        onCheckedChange={(checked) => setValue("compliance.pci", checked as boolean)}
                      />
                      <Label htmlFor="pci">PCI DSS (Payment Card Industry)</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Execution Schedule</CardTitle>
                  <p className="text-sm text-muted-foreground">Configure when this rule set should run automatically</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule-enabled"
                      checked={watchedValues.schedule?.enabled}
                      onCheckedChange={(checked) => setValue("schedule.enabled", checked as boolean)}
                    />
                    <Label htmlFor="schedule-enabled">Enable automatic scheduling</Label>
                  </div>

                  {watchedValues.schedule?.enabled && (
                    <div className="space-y-4 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor="cron">Cron Expression</Label>
                        <Input id="cron" {...register("schedule.cron")} placeholder="0 2 * * * (daily at 2 AM)" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4" />
                          <span>Use standard cron format: minute hour day month weekday</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={watchedValues.schedule?.timezone}
                          onValueChange={(value) => setValue("schedule.timezone", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" variant="inline" message="Updating..." /> : "Update Rule Set"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
