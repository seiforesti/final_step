"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Calendar, CheckCircle, XCircle, Settings } from "lucide-react"
import type { ScanSchedule } from "./types"
import { ScanScheduleModal } from "./scan-schedule-modal"

interface ScanScheduleListProps {
  schedules: ScanSchedule[]
  onUpdateSchedule: (scanId: string, cron: string, timezone: string, enabled: boolean) => Promise<void>
}

export function ScanScheduleList({ schedules, onUpdateSchedule }: ScanScheduleListProps) {
  const [editingSchedule, setEditingSchedule] = useState<ScanSchedule | null>(null)

  const formatCronDescription = (cron: string) => {
    const descriptions: Record<string, string> = {
      "0 2 * * *": "Daily at 2:00 AM",
      "0 2 * * 0": "Weekly on Sunday at 2:00 AM",
      "0 2 1 * *": "Monthly on 1st at 2:00 AM",
      "0 */6 * * *": "Every 6 hours",
      "0 */12 * * *": "Every 12 hours",
    }
    return descriptions[cron] || cron
  }

  const handleToggleSchedule = async (schedule: ScanSchedule) => {
    try {
      await onUpdateSchedule(schedule.scanId, schedule.cron, schedule.timezone, !schedule.enabled)
    } catch (error) {
      console.error("Failed to toggle schedule:", error)
    }
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No scheduled scans</h3>
          <p className="text-muted-foreground text-center">
            Configure schedules for your scans to run them automatically.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{schedule.scanName}</CardTitle>
                  <CardDescription>
                    {formatCronDescription(schedule.cron)} • {schedule.timezone}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={schedule.enabled} onCheckedChange={() => handleToggleSchedule(schedule)} />
                  <Button variant="outline" size="sm" onClick={() => setEditingSchedule(schedule)}>
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge variant={schedule.enabled ? "default" : "secondary"}>
                      {schedule.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Next Run:</span>
                  <p className="font-medium">
                    {schedule.enabled ? new Date(schedule.nextRun).toLocaleString() : "Not scheduled"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Run:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    {schedule.lastRun ? (
                      <>
                        {schedule.lastStatus === "success" ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                        <span className="text-xs">{new Date(schedule.lastRun).toLocaleDateString()}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs">Never</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{new Date(schedule.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingSchedule && (
        <ScanScheduleModal
          open={!!editingSchedule}
          onOpenChange={(open) => !open && setEditingSchedule(null)}
          schedule={editingSchedule}
          onUpdateSchedule={onUpdateSchedule}
        />
      )}
    </>
  )
}
