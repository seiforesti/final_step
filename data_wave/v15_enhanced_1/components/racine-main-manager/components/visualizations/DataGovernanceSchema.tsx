"use client"

import React, { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  GitBranch,
  Target,
  Network,
  Layers,
  Eye,
  Settings,
  Filter,
  Search,
  ZoomIn,
  ZoomOut,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react"

import { cn } from "../../utils/cn"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface SchemaNode {
  id: string
  type: 'data-source' | 'scan-rule' | 'classification' | 'compliance' | 'catalog' | 'workflow' | 'pipeline' | 'user-group'
  name: string
  description: string
  status: 'healthy' | 'warning' | 'error' | 'inactive'
  category: 'data' | 'governance' | 'process' | 'security' | 'management'
  metadata: {
    count?: number
    complianceScore?: number
    criticality?: 'low' | 'medium' | 'high' | 'critical'
  }
}

const mockNodes: SchemaNode[] = [
  {
    id: "ds-1",
    type: "data-source",
    name: "Customer Database", 
    description: "Primary customer data repository",
    status: "healthy",
    category: "data",
    metadata: { count: 2500000, complianceScore: 98, criticality: "critical" }
  },
  {
    id: "ds-2",
    type: "data-source", 
    name: "Payment Gateway",
    description: "Financial transaction data",
    status: "warning",
    category: "data",
    metadata: { count: 850000, complianceScore: 94, criticality: "critical" }
  },
  {
    id: "cl-1",
    type: "classification",
    name: "PII Classification",
    description: "Personal identifiable information",
    status: "healthy",
    category: "governance",
    metadata: { count: 15, criticality: "critical" }
  },
  {
    id: "cr-1",
    type: "compliance",
    name: "GDPR Compliance",
    description: "European data protection regulation", 
    status: "healthy",
    category: "security",
    metadata: { count: 25, complianceScore: 96, criticality: "critical" }
  },
  {
    id: "wf-1",
    type: "workflow",
    name: "Data Quality Check",
    description: "Automated data validation",
    status: "healthy",
    category: "process",
    metadata: { count: 150, criticality: "high" }
  },
  {
    id: "pl-1", 
    type: "pipeline",
    name: "Customer ETL",
    description: "Extract, transform, load customer data",
    status: "healthy",
    category: "process",
    metadata: { count: 89, criticality: "high" }
  }
]

const nodeTypeIcons = {
  "data-source": Database,
  "scan-rule": Scan,
  "classification": FileText,
  "compliance": Shield,
  "catalog": BookOpen,
  "workflow": GitBranch,
  "pipeline": Layers,
  "user-group": Users
}

const statusColors = {
  healthy: "border-green-500 bg-green-50 text-green-700",
  warning: "border-yellow-500 bg-yellow-50 text-yellow-700", 
  error: "border-red-500 bg-red-50 text-red-700",
  inactive: "border-gray-300 bg-gray-50 text-gray-500"
}

const statusIcons = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  inactive: Clock
}

export const DataGovernanceSchema: React.FC = () => {
  const [nodes, setNodes] = useState<SchemaNode[]>(mockNodes)
  const [selectedNode, setSelectedNode] = useState<SchemaNode | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || node.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [nodes, searchQuery, selectedCategory])

  // Calculate stats
  const stats = useMemo(() => {
    const total = nodes.length
    const healthy = nodes.filter(n => n.status === 'healthy').length
    const warnings = nodes.filter(n => n.status === 'warning').length
    const errors = nodes.filter(n => n.status === 'error').length
    
    return {
      total,
      healthy,
      warnings,
      errors,
      healthScore: Math.round((healthy / total) * 100)
    }
  }, [nodes])

  // Render node card
  const renderNodeCard = useCallback((node: SchemaNode) => {
    const NodeIcon = nodeTypeIcons[node.type]
    const StatusIcon = statusIcons[node.status]
    
    return (
      <Card 
        key={node.id}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          selectedNode?.id === node.id && "ring-2 ring-primary",
          statusColors[node.status]
        )}
        onClick={() => setSelectedNode(node)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <NodeIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-sm">{node.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon className="h-3 w-3" />
                <Badge variant="outline" className="text-xs">
                  {node.type.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {node.description}
          </p>
          
          {/* Metadata */}
          <div className="space-y-2">
            {node.metadata.count && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{node.metadata.count.toLocaleString()}</span>
              </div>
            )}
            {node.metadata.complianceScore && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Compliance:</span>
                  <span className="font-medium">{node.metadata.complianceScore}%</span>
                </div>
                <Progress value={node.metadata.complianceScore} className="h-1" />
              </div>
            )}
            {node.metadata.criticality && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Criticality:</span>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  node.metadata.criticality === 'critical' && "text-red-600",
                  node.metadata.criticality === 'high' && "text-orange-600",
                  node.metadata.criticality === 'medium' && "text-yellow-600",
                  node.metadata.criticality === 'low' && "text-gray-600"
                )}>
                  {node.metadata.criticality}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }, [selectedNode])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Data Governance Schema</h1>
            <p className="text-muted-foreground">
              Comprehensive overview of your data governance architecture
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Components</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{stats.healthy}</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-600">{stats.warnings}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold text-red-600">{stats.errors}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xl font-bold">{stats.healthScore}%</p>
              <p className="text-xs text-muted-foreground">Health Score</p>
            </div>
          </Card>
        </div>
        
        {/* Controls */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Category: {selectedCategory === 'all' ? 'All' : selectedCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('data')}>
                Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('governance')}>
                Governance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('process')}>
                Process
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('security')}>
                Security
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('management')}>
                Management
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNodes.map(renderNodeCard)}
        </div>
        
        {filteredNodes.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Network className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium mb-1">No components found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Node Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="border-t border-border bg-background p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Component Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{selectedNode.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium">{selectedNode.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2 font-medium capitalize">{selectedNode.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {selectedNode.metadata.count && (
                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <span className="ml-2 font-medium">{selectedNode.metadata.count.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedNode.metadata.complianceScore && (
                      <div>
                        <span className="text-muted-foreground">Compliance:</span>
                        <span className="ml-2 font-medium">{selectedNode.metadata.complianceScore}%</span>
                      </div>
                    )}
                    {selectedNode.metadata.criticality && (
                      <div>
                        <span className="text-muted-foreground">Criticality:</span>
                        <span className="ml-2 font-medium capitalize">{selectedNode.metadata.criticality}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-3 w-3 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Settings className="h-3 w-3 mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <BarChart3 className="h-3 w-3 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DataGovernanceSchema