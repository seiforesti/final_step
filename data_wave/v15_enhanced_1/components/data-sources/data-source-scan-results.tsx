"use client"

import { useState, useMemo } from "react"
import { useDataSources } from "@/hooks/useDataSources"

// Import enterprise hooks for better backend integration
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"
import { useScanResultsQuery } from "./services/apis"

import { Search, Filter, Download, RefreshCw, Eye, AlertTriangle, CheckCircle, XCircle, Info, Clock, Database, FileText, Calendar, User, Tag, MoreHorizontal, ChevronDown, ChevronRight, Shield, Bug, Zap, TrendingUp, Target, Settings, Play, Pause, BarChart3, Activity, Layers, Code, Table as TableIcon, Columns, Key, Lock, Unlock, Hash, Type,  } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { DataSource } from "./types"

interface ScanResultsProps {
  dataSourceId: number
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

export function DataSourceScanResults({ 
  dataSourceId, 
  onNavigateToComponent, 
  className = "" 
}: ScanResultsProps) {
  const [selectedScan, setSelectedScan] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("7d")

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceScanResults',
    dataSourceId,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // Backend data queries
  const { 
    data: scanResults, 
    isLoading,
    error,
    refetch 
  } = useScanResultsQuery(dataSourceId, { timeRange })

  // Transform and use real scan results
  const results = useMemo(() => {
    if (scanResults && scanResults.length > 0) {
      return scanResults.map(scan => ({
        id: scan.id,
        scanType: scan.scan_type || 'full',
        status: scan.status,
        startTime: new Date(scan.start_time),
        endTime: scan.end_time ? new Date(scan.end_time) : null,
        duration: scan.duration || 0,
        entitiesScanned: scan.total_entities || 0,
        entitiesFound: scan.entities_discovered || 0,
        issuesFound: scan.issues_count || 0,
        completionRate: scan.completion_rate || 0,
        dataQualityScore: scan.quality_score || 0,
        complianceScore: scan.compliance_score || 0,
        errorMessage: scan.error_message,
        metadata: scan.metadata || {}
      }))
    }
    
    // Return empty array if no real data available
    return []
  }, [scanResults])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [showResolved, setShowResolved] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<string>("category")
  const [selectedResult, setSelectedResult] = useState<any | null>(null)

  // Filter and group results
  const filteredResults = useMemo(() => {
    return results.filter((result: any) => {
      const matchesSearch = 
        result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.schema.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.rule.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSeverity = selectedSeverity === "all" || result.severity === selectedSeverity
      const matchesCategory = selectedCategory === "all" || result.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || result.status === selectedStatus
      const matchesResolved = showResolved || !result.resolved

      return matchesSearch && matchesSeverity && matchesCategory && matchesStatus && matchesResolved
    })
  }, [results, searchQuery, selectedSeverity, selectedCategory, selectedStatus, showResolved])

  const groupedResults = useMemo(() => {
    const groups: Record<string, any[]> = {}
    
    filteredResults.forEach((result: any) => {
      const groupKey = groupBy === "category" ? result.category :
                      groupBy === "severity" ? result.severity :
                      groupBy === "schema" ? result.schema :
                      groupBy === "scan" ? result.scanName : "all"
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(result)
    })

    return groups
  }, [filteredResults, groupBy])

  const severityConfig = {
    critical: { color: "text-red-600", bg: "bg-red-50", badge: "destructive" as const },
    high: { color: "text-orange-600", bg: "bg-orange-50", badge: "destructive" as const },
    medium: { color: "text-yellow-600", bg: "bg-yellow-50", badge: "secondary" as const },
    low: { color: "text-blue-600", bg: "bg-blue-50", badge: "outline" as const },
    info: { color: "text-gray-600", bg: "bg-gray-50", badge: "outline" as const }
  }

  const categoryIcons = {
    security: Shield,
    compliance: FileText,
    quality: Target,
    performance: Zap,
    structure: Database
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return XCircle
      case "high": return AlertTriangle
      case "medium": return Info
      case "low": return CheckCircle
      default: return Info
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle
      case "running": return Clock
      case "failed": return XCircle
      case "cancelled": return XCircle
      default: return Clock
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredResults.map((r: any) => r.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id])
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id))
    }
  }

  const ResultCard = ({ result }: { result: any }) => {
    const SeverityIcon = getSeverityIcon(result.severity)
    const StatusIcon = getStatusIcon(result.status) 
    const CategoryIcon = categoryIcons[result.category as keyof typeof categoryIcons] || Database
    const severityStyle = severityConfig[result.severity as keyof typeof severityConfig]

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedItems.includes(result.id)}
                onCheckedChange={(checked) => handleSelectItem(result.id, checked as boolean)}
              />
              <div className={`p-2 rounded-lg ${severityStyle.bg}`}>
                <SeverityIcon className={`h-4 w-4 ${severityStyle.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Badge variant={severityStyle.badge} className="text-xs">
                    {result.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {result.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {result.status}
                  </Badge>
                  {result.resolved && (
                    <Badge variant="default" className="text-xs">
                      Resolved
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold mt-1">{result.rule}</h4>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedResult(result)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Assign
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{result.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Schema:</span>
                <div className="font-medium">{result.schema}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Table:</span>
                <div className="font-medium">{result.table}</div>
              </div>
              {result.column && (
                <div>
                  <span className="text-muted-foreground">Column:</span>
                  <div className="font-medium">{result.column}</div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Effort:</span>
                <Badge variant="outline" className="text-xs">
                  {result.effort}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Recommendation:</span>
                <p className="text-sm mt-1">{result.recommendation}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Impact:</span>
                <p className="text-sm mt-1">{result.impact}</p>
              </div>
            </div>

            {result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Hash className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
              <span>Scan: {result.scanName}</span>
              <span>Found: {new Date(result.timestamp).toLocaleDateString()}</span>
              {result.assignee && <span>Assigned: {result.assignee}</span>}
              {result.dueDate && <span>Due: {new Date(result.dueDate).toLocaleDateString()}</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSummaryStats = () => {
    const total = filteredResults.length
    const bySeverity = filteredResults.reduce((acc: Record<string, number>, result: any) => {
      acc[result.severity] = (acc[result.severity] || 0) + 1
      return acc
    }, {})
    const resolved = filteredResults.filter((r: any) => r.resolved).length
    const unresolved = total - resolved

    return { total, bySeverity, resolved, unresolved }
  }

  const stats = getSummaryStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scan Results</h2>
          <p className="text-muted-foreground">
            Security, compliance, and quality findings for {dataSource.name}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Run New Scan
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Findings</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {(stats.bySeverity.critical || 0) + (stats.bySeverity.high || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Critical & High</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">
                {stats.bySeverity.medium || 0}
              </p>
              <p className="text-sm text-muted-foreground">Medium Priority</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{stats.unresolved}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search findings, tables, rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="structure">Structure</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="severity">By Severity</SelectItem>
              <SelectItem value="schema">By Schema</SelectItem>
              <SelectItem value="scan">By Scan</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-resolved"
              checked={showResolved}
              onCheckedChange={setShowResolved}
            />
            <Label htmlFor="show-resolved" className="text-sm">Show resolved</Label>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedItems.length === filteredResults.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedItems.length} selected
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Bulk Assign
            </Button>
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Resolved
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {Object.entries(groupedResults).map(([groupKey, groupResults]) => (
          <Collapsible key={groupKey} defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <ChevronRight className="h-4 w-4" />
                <h3 className="font-semibold capitalize">{groupKey}</h3>
                <Badge variant="outline">{groupResults.length} findings</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {groupResults.map((result: any) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Empty State */}
      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No scan results found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedSeverity !== "all" || selectedCategory !== "all"
              ? "Try adjusting your filters"
              : "Run a scan to identify security, compliance, and quality issues"
            }
          </p>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Run New Scan
          </Button>
        </div>
      )}

      {/* Result Details Dialog */}
      {selectedResult && (
        <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>{selectedResult.rule}</span>
              </DialogTitle>
              <DialogDescription>
                Found in {selectedResult.schema}.{selectedResult.table}
                {selectedResult.column && `.${selectedResult.column}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Severity</Label>
                  <Badge variant={severityConfig[selectedResult.severity as keyof typeof severityConfig].badge} className="mt-1">
                    {selectedResult.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-sm font-medium capitalize">{selectedResult.category}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm font-medium capitalize">{selectedResult.status}</p>
                </div>
                <div>
                  <Label>Effort</Label>
                  <p className="text-sm font-medium capitalize">{selectedResult.effort}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <p className="text-sm mt-1">{selectedResult.description}</p>
                </div>
                <div>
                  <Label>Recommendation</Label>
                  <p className="text-sm mt-1">{selectedResult.recommendation}</p>
                </div>
                <div>
                  <Label>Impact</Label>
                  <p className="text-sm mt-1">{selectedResult.impact}</p>
                </div>
              </div>

              {Object.keys(selectedResult.metadata).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label>Additional Details</Label>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <pre className="text-xs">
                        {JSON.stringify(selectedResult.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}