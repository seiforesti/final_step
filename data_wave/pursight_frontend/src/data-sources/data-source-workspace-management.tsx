"use client"

import { useState, useEffect, useMemo } from "react"
import { Users, Settings, Share2, Lock, Unlock, UserPlus, UserMinus, Crown, Eye, Edit, Trash2, Copy, Download, Upload, RefreshCw, Search, Filter, MoreHorizontal, Plus, Folder, FolderPlus, FileText, Star, StarOff, Clock, Calendar, Activity, Shield, Key, Globe, Building, Tag, BookOpen, MessageSquare, Bell, Check, X, AlertTriangle, Info, ExternalLink,  } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { DataSource, Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceActivity } from "./types"
import {
  useWorkspacesQuery,
  useWorkspaceMembersQuery,
  useWorkspaceInvitationsQuery,
  useWorkspaceActivitiesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
} from "./services/apis"

interface DataSourceWorkspaceManagementProps {
  dataSource: DataSource
}

export function DataSourceWorkspaceManagement({ dataSource }: DataSourceWorkspaceManagementProps) {
  const [activeTab, setActiveTab] = useState("workspaces")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
    visibility: "private",
    auto_join: false,
  })
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "viewer",
    message: "",
  })

  // Queries
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspacesQuery(dataSource.id)
  const { data: members, isLoading: membersLoading } = useWorkspaceMembersQuery(selectedWorkspace?.id)
  const { data: invitations, isLoading: invitationsLoading } = useWorkspaceInvitationsQuery(selectedWorkspace?.id)
  const { data: activities, isLoading: activitiesLoading } = useWorkspaceActivitiesQuery(selectedWorkspace?.id)

  // Mutations
  const createWorkspaceMutation = useCreateWorkspaceMutation()
  const updateWorkspaceMutation = useUpdateWorkspaceMutation()
  const deleteWorkspaceMutation = useDeleteWorkspaceMutation()
  const inviteMemberMutation = useInviteMemberMutation()
  const updateMemberRoleMutation = useUpdateMemberRoleMutation()
  const removeMemberMutation = useRemoveMemberMutation()
  const acceptInvitationMutation = useAcceptInvitationMutation()
  const declineInvitationMutation = useDeclineInvitationMutation()

  const handleCreateWorkspace = async () => {
    try {
      await createWorkspaceMutation.mutateAsync({
        data_source_id: dataSource.id,
        ...newWorkspace,
      })
      setWorkspaceDialogOpen(false)
      setNewWorkspace({
        name: "",
        description: "",
        visibility: "private",
        auto_join: false,
      })
    } catch (error) {
      console.error("Failed to create workspace:", error)
    }
  }

  const handleInviteMember = async () => {
    if (!selectedWorkspace) return
    try {
      await inviteMemberMutation.mutateAsync({
        workspace_id: selectedWorkspace.id,
        ...inviteForm,
      })
      setInviteDialogOpen(false)
      setInviteForm({
        email: "",
        role: "viewer",
        message: "",
      })
    } catch (error) {
      console.error("Failed to invite member:", error)
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRoleMutation.mutateAsync({
        member_id: memberId,
        role: newRole,
      })
    } catch (error) {
      console.error("Failed to update member role:", error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMemberMutation.mutateAsync(memberId)
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitationMutation.mutateAsync(invitationId)
    } catch (error) {
      console.error("Failed to accept invitation:", error)
    }
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await declineInvitationMutation.mutateAsync(invitationId)
    } catch (error) {
      console.error("Failed to decline invitation:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />
      case "editor":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "viewer":
        return <Eye className="h-4 w-4 text-gray-500" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "destructive"
      case "editor":
        return "secondary"
      case "viewer":
        return "outline"
      default:
        return "outline"
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4 text-green-500" />
      case "organization":
        return <Building className="h-4 w-4 text-blue-500" />
      case "private":
        return <Lock className="h-4 w-4 text-gray-500" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "member_joined":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "member_left":
        return <UserMinus className="h-4 w-4 text-red-500" />
      case "workspace_created":
        return <FolderPlus className="h-4 w-4 text-blue-500" />
      case "permission_changed":
        return <Shield className="h-4 w-4 text-yellow-500" />
      case "data_accessed":
        return <Eye className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return []
    return workspaces.filter(workspace =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [workspaces, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workspace Management</h2>
          <p className="text-muted-foreground">
            Manage workspaces and collaboration for {dataSource.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={workspaceDialogOpen} onOpenChange={setWorkspaceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Create a workspace to organize and share data with your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workspace name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace-description">Description</Label>
                  <Textarea
                    id="workspace-description"
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the workspace purpose"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace-visibility">Visibility</Label>
                  <Select
                    value={newWorkspace.visibility}
                    onValueChange={(value) => setNewWorkspace(prev => ({ ...prev, visibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private - Invite only
                        </div>
                      </SelectItem>
                      <SelectItem value="organization">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Organization - All org members
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Public - Anyone can join
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-join"
                    checked={newWorkspace.auto_join}
                    onCheckedChange={(checked) => setNewWorkspace(prev => ({ ...prev, auto_join: checked }))}
                  />
                  <Label htmlFor="auto-join">Enable auto-join for organization members</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWorkspaceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkspace} disabled={createWorkspaceMutation.isPending}>
                  {createWorkspaceMutation.isPending ? "Creating..." : "Create Workspace"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workspaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Workspaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspacesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredWorkspaces.map((workspace) => (
                <Card key={workspace.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedWorkspace(workspace)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(workspace.visibility)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Workspace
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {workspace.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{workspace.member_count} members</span>
                        </div>
                        <Badge variant={workspace.visibility === "public" ? "default" : "secondary"}>
                          {workspace.visibility}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(workspace.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    {workspace.tags && workspace.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {workspace.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {workspace.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{workspace.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          {!selectedWorkspace ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a Workspace</h3>
                  <p className="text-muted-foreground">
                    Choose a workspace to view and manage its members
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Workspace Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Folder className="h-5 w-5" />
                        {selectedWorkspace.name}
                      </CardTitle>
                      <CardDescription>{selectedWorkspace.description}</CardDescription>
                    </div>
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Member</DialogTitle>
                          <DialogDescription>
                            Invite a new member to {selectedWorkspace.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="invite-email">Email Address</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              value={inviteForm.email}
                              onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter email address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invite-role">Role</Label>
                            <Select
                              value={inviteForm.role}
                              onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Viewer - Can view data
                                  </div>
                                </SelectItem>
                                <SelectItem value="editor">
                                  <div className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    Editor - Can edit and view
                                  </div>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Admin - Full workspace access
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                            <Textarea
                              id="invite-message"
                              value={inviteForm.message}
                              onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                              placeholder="Add a personal message to the invitation"
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleInviteMember} disabled={inviteMemberMutation.isPending}>
                            {inviteMemberMutation.isPending ? "Sending..." : "Send Invitation"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
              </Card>

              {/* Members List */}
              <Card>
                <CardHeader>
                  <CardTitle>Members ({members?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[100px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {members?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback>
                                {member.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              {member.role}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {member.last_active ? new Date(member.last_active).toLocaleDateString() : "Never"}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, "viewer")}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Viewer
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, "editor")}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editor
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, "admin")}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Admin
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4">
          {!selectedWorkspace ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a Workspace</h3>
                  <p className="text-muted-foreground">
                    Choose a workspace to view and manage invitations
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Manage pending invitations for {selectedWorkspace.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitationsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : invitations && invitations.length > 0 ? (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {invitation.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{invitation.email}</p>
                              <p className="text-sm text-muted-foreground">
                                Invited as {invitation.role} • {new Date(invitation.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Pending</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Resend Invitation
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel Invitation
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {invitation.message && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm">{invitation.message}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Pending Invitations</h3>
                    <p className="text-muted-foreground mb-4">
                      There are currently no pending invitations for this workspace
                    </p>
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          {!selectedWorkspace ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a Workspace</h3>
                  <p className="text-muted-foreground">
                    Choose a workspace to view activity history
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>
                  Recent activity in {selectedWorkspace.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[300px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user_name}</span>{" "}
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                            {activity.metadata && (
                              <Badge variant="outline" className="text-xs">
                                {activity.metadata.resource_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Activity Yet</h3>
                    <p className="text-muted-foreground">
                      Activity will appear here as members interact with the workspace
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
