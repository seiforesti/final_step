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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import type { ScanSchedule } from "./types"

interface ScanScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: ScanSchedule
  onUpdateSchedule: (scanId: string, cron: string, timezone: string, enabled: boolean) => Promise<void>
}

export function ScanScheduleModal({ open, onOpenChange, schedule, onUpdateSchedule }: ScanScheduleModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    enabled: schedule.enabled,
    cron: schedule.cron,
    timezone: schedule.timezone,
  })

  const cronPresets = [
    { value: "0 2 * * *", label: "Daily at 2:00 AM" },
    { value: "0 2 * * 0", label: "Weekly on Sunday at 2:00 AM" },
    { value: "0 2 1 * *", label: "Monthly on 1st at 2:00 AM" },
    { value: "0 */6 * * *", label: "Every 6 hours" },
    { value: "0 */12 * * *", label: "Every 12 hours" },
    { value: "0 0 * * 1-5", label: "Weekdays at midnight" },
    { value: "custom", label: "Custom expression" },
  ]

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Asia/Tokyo", label: "Tokyo" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onUpdateSchedule(schedule.scanId, formData.cron, formData.timezone, formData.enabled)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const isCustomCron = !cronPresets.some((preset) => preset.value === formData.cron && preset.value !== "custom")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>Configure the schedule for "{schedule.scanName}"</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Schedule</Label>
              <p className="text-sm text-muted-foreground">Run this scan automatically</p>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>

          {formData.enabled && (
            <>
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Select
                  value={isCustomCron ? "custom" : formData.cron}
                  onValueChange={(value) => {
                    if (value !== "custom") {
                      setFormData((prev) => ({ ...prev, cron: value }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cronPresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isCustomCron && (
                <div className="space-y-2">
                  <Label>Custom Cron Expression</Label>
                  <Input
                    value={formData.cron}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cron: e.target.value }))}
                    placeholder="0 2 * * *"
                  />
                  <p className="text-xs text-muted-foreground">Format: minute hour day month day-of-week</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
