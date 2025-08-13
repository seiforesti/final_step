"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, MoreHorizontal, Edit, Trash2, Copy, Calendar, Database, Shield, BarChart3 } from "lucide-react"
import type { ScanConfig } from "./types"

interface ScanListProps {
  scans: ScanConfig[]
  onEdit: (scan: ScanConfig) => void
  onDelete: (scanId: string) => void
  onRun: (scanId: string) => void
  onDuplicate: (scan: ScanConfig) => void
}

export function ScanList({ scans, onEdit, onDelete, onRun, onDuplicate }: ScanListProps) {
  const getScanTypeIcon = (type: ScanConfig["scanType"]) => {
    switch (type) {
      case "full":
        return <Database className="h-4 w-4" />
      case "incremental":
        return <BarChart3 className="h-4 w-4" />
      case "sample":
        return <Shield className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getScanTypeColor = (type: ScanConfig["scanType"]) => {
    switch (type) {
      case "full":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "incremental":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "sample":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No scans configured</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first scan configuration to start discovering and governing your data.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <Card key={scan.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-base">{scan.name}</CardTitle>
                  <Badge variant="secondary" className={`${getScanTypeColor(scan.scanType)} border-0`}>
                    <span className="flex items-center space-x-1">
                      {getScanTypeIcon(scan.scanType)}
                      <span className="capitalize">{scan.scanType}</span>
                    </span>
                  </Badge>
                  <Badge variant={scan.status === "active" ? "default" : "secondary"}>{scan.status}</Badge>
                </div>
                <CardDescription>{scan.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={() => onRun(scan.id)} disabled={scan.status !== "active"}>
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(scan)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(scan)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(scan.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Data Source:</span>
                <p className="font-medium">{scan.dataSourceName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Scope:</span>
                <p className="font-medium">
                  {scan.scope.databases?.length || 0} databases, {scan.scope.tables?.length || 0} tables
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Features:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scan.settings.enablePII && (
                    <Badge variant="outline" className="text-xs">
                      PII
                    </Badge>
                  )}
                  {scan.settings.enableClassification && (
                    <Badge variant="outline" className="text-xs">
                      Classification
                    </Badge>
                  )}
                  {scan.settings.enableLineage && (
                    <Badge variant="outline" className="text-xs">
                      Lineage
                    </Badge>
                  )}
                  {scan.settings.enableQuality && (
                    <Badge variant="outline" className="text-xs">
                      Quality
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Schedule:</span>
                <div className="flex items-center space-x-1 mt-1">
                  {scan.schedule?.enabled ? (
                    <>
                      <Calendar className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 text-xs">Enabled</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs">Manual</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
              <span>Created by {scan.createdBy}</span>
              <span>Updated {new Date(scan.updatedAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
