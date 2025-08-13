"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Database, Table, Columns, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import type { DiscoveredEntity } from "./types"

interface ScanEntitiesViewProps {
  entities: DiscoveredEntity[]
}

export function ScanEntitiesView({ entities }: ScanEntitiesViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [classificationFilter, setClassificationFilter] = useState<string>("all")
  const [piiFilter, setPiiFilter] = useState<string>("all")

  const filteredEntities = entities.filter((entity) => {
    if (searchQuery && !entity.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (typeFilter !== "all" && entity.type !== typeFilter) {
      return false
    }
    if (classificationFilter !== "all" && !entity.classifications.includes(classificationFilter)) {
      return false
    }
    if (piiFilter === "yes" && entity.piiTags.length === 0) {
      return false
    }
    if (piiFilter === "no" && entity.piiTags.length > 0) {
      return false
    }
    return true
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "database":
        return <Database className="h-4 w-4" />
      case "table":
        return <Table className="h-4 w-4" />
      case "column":
        return <Columns className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  // Get unique classifications for filter
  const allClassifications = Array.from(new Set(entities.flatMap((entity) => entity.classifications)))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter Entities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="column">Column</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                {allClassifications.map((classification) => (
                  <SelectItem key={classification} value={classification}>
                    {classification}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={piiFilter} onValueChange={setPiiFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="PII" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PII</SelectItem>
                <SelectItem value="yes">Has PII</SelectItem>
                <SelectItem value="no">No PII</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entities List */}
      <div className="space-y-4">
        {filteredEntities.map((entity) => (
          <Card key={entity.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(entity.type)}
                    <CardTitle className="text-base">{entity.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {entity.type}
                    </Badge>
                    {entity.piiTags.length > 0 && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>PII</span>
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="font-mono text-xs">{entity.path}</CardDescription>
                  {entity.description && <p className="text-sm text-muted-foreground">{entity.description}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  {getQualityIcon(entity.qualityScore)}
                  <span className={`font-medium ${getQualityColor(entity.qualityScore)}`}>{entity.qualityScore}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">Data Source:</span>
                  <p className="font-medium">{entity.dataSource}</p>
                </div>
                {entity.dataType && (
                  <div>
                    <span className="text-muted-foreground">Data Type:</span>
                    <p className="font-medium font-mono">{entity.dataType}</p>
                  </div>
                )}
                {entity.rowCount && (
                  <div>
                    <span className="text-muted-foreground">Row Count:</span>
                    <p className="font-medium">{entity.rowCount.toLocaleString()}</p>
                  </div>
                )}
                {entity.size && (
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <p className="font-medium">{(entity.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                {entity.lastModified && (
                  <div>
                    <span className="text-muted-foreground">Last Modified:</span>
                    <p className="font-medium">{new Date(entity.lastModified).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Classifications */}
              {entity.classifications.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium">Classifications:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entity.classifications.map((classification, index) => (
                      <Badge key={index} variant="secondary">
                        {classification}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* PII Tags */}
              {entity.piiTags.length > 0 && (
                <div>
                  <span className="text-sm font-medium">PII Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entity.piiTags.map((tag, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Column-specific info */}
              {entity.type === "column" && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    {entity.nullable !== undefined && <span>Nullable: {entity.nullable ? "Yes" : "No"}</span>}
                    {entity.primaryKey && (
                      <Badge variant="outline" className="text-xs">
                        Primary Key
                      </Badge>
                    )}
                    {entity.foreignKey && (
                      <Badge variant="outline" className="text-xs">
                        Foreign Key
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntities.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No entities found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || typeFilter !== "all" || classificationFilter !== "all" || piiFilter !== "all"
                ? "No entities match your current filters."
                : "No entities were discovered during this scan."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
