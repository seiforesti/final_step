"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserCheck, Shield, Lock, Unlock, Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

// Import backend services and hooks
import { useDataSourceAccessControlQuery, useCreateAccessControlMutation, useUpdateAccessControlMutation, useDeleteAccessControlMutation } from "./services/enterprise-apis"
import { useEnterpriseFeatures } from "./hooks/use-enterprise-features"
import { useRBACIntegration } from "./hooks/use-rbac-integration"
import { DataSource } from "./types"

interface AccessControlProps {
  dataSource: DataSource
  onNavigateToComponent?: (componentId: string, data?: any) => void
  className?: string
}

interface UserPermission {
  id: string
  userId: string
  username: string
  email: string
  role: "admin" | "read" | "write" | "execute"
  permissions: string[]
  grantedAt: string
  grantedBy: string
  expiresAt?: string
  status: "active" | "expired" | "revoked"
}

const AVAILABLE_PERMISSIONS = [
  { id: "read", label: "Read Data", description: "View data source content" },
  { id: "write", label: "Write Data", description: "Modify data source content" },
  { id: "execute", label: "Execute Operations", description: "Run queries and operations" },
  { id: "admin", label: "Admin Access", description: "Full administrative access" },
  { id: "scan", label: "Scan Management", description: "Manage scans and discovery" },
  { id: "configure", label: "Configuration", description: "Modify data source settings" }
]

const AVAILABLE_ROLES = [
  { id: "read", label: "Read Only", description: "Can only view data" },
  { id: "write", label: "Read/Write", description: "Can view and modify data" },
  { id: "execute", label: "Executor", description: "Can execute operations" },
  { id: "admin", label: "Administrator", description: "Full access to all features" }
]

export function DataSourceAccessControl({
  dataSource,
  onNavigateToComponent,
  className = ""
}: AccessControlProps) {
  const [selectedPermission, setSelectedPermission] = useState<UserPermission | null>(null)
  const [showAddPermission, setShowAddPermission] = useState(false)
  const [showEditPermission, setShowEditPermission] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newPermission, setNewPermission] = useState({
    username: "",
    email: "",
    role: "read" as const,
    permissions: [] as string[],
    expiresAt: ""
  })

  // Backend integration hooks
  const { data: accessData, isLoading, error, refetch } = useDataSourceAccessControlQuery(dataSource.id)
  const createPermissionMutation = useCreateAccessControlMutation()
  const updatePermissionMutation = useUpdateAccessControlMutation()
  const deletePermissionMutation = useDeleteAccessControlMutation()

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'DataSourceAccessControl',
    dataSourceId: dataSource.id,
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  // RBAC integration
  const { 
    currentUser, 
    hasPermission, 
    logUserAction 
  } = useRBACIntegration()

  // Process backend data
  const permissions = useMemo(() => {
    if (!accessData?.data) return []
    return accessData.data.map((permission: any) => ({
      id: permission.id,
      userId: permission.user_id,
      username: permission.username,
      email: permission.email,
      role: permission.role,
      permissions: permission.permissions || [],
      grantedAt: permission.granted_at,
      grantedBy: permission.granted_by,
      expiresAt: permission.expires_at,
      status: permission.status
    }))
  }, [accessData])

  // Handlers for CRUD operations
  const handleCreatePermission = async () => {
    if (!newPermission.username || !newPermission.email) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await createPermissionMutation.mutateAsync({
        data_source_id: dataSource.id,
        username: newPermission.username,
        email: newPermission.email,
        role: newPermission.role,
        permissions: newPermission.permissions,
        expires_at: newPermission.expiresAt || null,
        granted_by: currentUser?.username || 'system'
      })
      
      toast.success("Access permission created successfully")
      logUserAction('permission_created', 'access_control', dataSource.id)
      refetch()
      setShowAddPermission(false)
      setNewPermission({
        username: "",
        email: "",
        role: "read",
        permissions: [],
        expiresAt: ""
      })
    } catch (error) {
      toast.error("Failed to create access permission")
      console.error('Error creating permission:', error)
    }
  }

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return

    try {
      await updatePermissionMutation.mutateAsync({
        permission_id: selectedPermission.id,
        role: selectedPermission.role,
        permissions: selectedPermission.permissions,
        expires_at: selectedPermission.expiresAt || null
      })
      
      toast.success("Access permission updated successfully")
      logUserAction('permission_updated', 'access_control', selectedPermission.id)
      refetch()
      setShowEditPermission(false)
      setSelectedPermission(null)
    } catch (error) {
      toast.error("Failed to update access permission")
      console.error('Error updating permission:', error)
    }
  }

  const handleDeletePermission = async (permissionId: string) => {
    try {
      await deletePermissionMutation.mutateAsync(permissionId)
      
      toast.success("Access permission deleted successfully")
      logUserAction('permission_deleted', 'access_control', permissionId)
      refetch()
    } catch (error) {
      toast.error("Failed to delete access permission")
      console.error('Error deleting permission:', error)
    }
  }

  const handleEditPermission = (permission: UserPermission) => {
    setSelectedPermission(permission)
    setShowEditPermission(true)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "text-red-600 bg-red-50"
      case "write": return "text-orange-600 bg-orange-50"
      case "read": return "text-blue-600 bg-blue-50"
      case "execute": return "text-green-600 bg-green-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50"
      case "expired": return "text-yellow-600 bg-yellow-50"
      case "revoked": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      const matchesSearch = !searchTerm ||
        permission.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.role.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [permissions, searchTerm])

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load access control data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Access Control
          </h2>
          <p className="text-muted-foreground">
            Manage user permissions and access rights for {dataSource.name}
          </p>
        </div>
        {hasPermission('access_control.manage') && (
          <Button onClick={() => setShowAddPermission(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Permission
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {filteredPermissions.length} {filteredPermissions.length === 1 ? 'user' : 'users'}
        </Badge>
      </div>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
          <CardDescription>
            Current user access permissions for this data source
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPermissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No user permissions found</p>
              <p className="text-sm">Add users to grant access to this data source</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{permission.username}</div>
                        <div className="text-sm text-muted-foreground">{permission.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(permission.role)}>
                        {permission.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {permission.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(permission.status)}>
                        {permission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(permission.grantedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {hasPermission('access_control.edit') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPermission(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission('access_control.delete') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePermission(permission.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Permission Dialog */}
      <Dialog open={showAddPermission} onOpenChange={setShowAddPermission}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add User Permission</DialogTitle>
            <DialogDescription>
              Grant access to this data source for a new user
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={newPermission.username}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newPermission.email}
                  onChange={(e) => setNewPermission(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newPermission.role} onValueChange={(value: any) => setNewPermission(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Specific Permissions</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={newPermission.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewPermission(prev => ({ 
                            ...prev, 
                            permissions: [...prev.permissions, permission.id] 
                          }))
                        } else {
                          setNewPermission(prev => ({ 
                            ...prev, 
                            permissions: prev.permissions.filter(p => p !== permission.id) 
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={permission.id} className="text-sm">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Expires At (Optional)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={newPermission.expiresAt}
                onChange={(e) => setNewPermission(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPermission(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePermission}
              disabled={createPermissionMutation.isPending}
            >
              {createPermissionMutation.isPending ? "Creating..." : "Create Permission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={showEditPermission} onOpenChange={setShowEditPermission}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Permission</DialogTitle>
            <DialogDescription>
              Modify access permissions for {selectedPermission?.username}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPermission && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={selectedPermission.role} 
                  onValueChange={(value: any) => setSelectedPermission(prev => prev ? ({ ...prev, role: value }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ROLES.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Specific Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${permission.id}`}
                        checked={selectedPermission.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermission(prev => prev ? ({ 
                              ...prev, 
                              permissions: [...prev.permissions, permission.id] 
                            }) : null)
                          } else {
                            setSelectedPermission(prev => prev ? ({ 
                              ...prev, 
                              permissions: prev.permissions.filter(p => p !== permission.id) 
                            }) : null)
                          }
                        }}
                      />
                      <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPermission(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePermission}
              disabled={updatePermissionMutation.isPending}
            >
              {updatePermissionMutation.isPending ? "Updating..." : "Update Permission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}