"use client"

import React, { useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Users,
  MessageSquare,
  Video,
  Share,
  Bell,
  Calendar,
  FileText,
  GitBranch,
  Activity,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pin,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

import { cn } from "../../utils/cn"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  lastActive?: string
}

interface Discussion {
  id: string
  title: string
  description: string
  author: TeamMember
  participants: TeamMember[]
  messages: number
  lastActivity: string
  tags: string[]
  status: 'active' | 'resolved' | 'archived'
  priority: 'low' | 'medium' | 'high'
}

interface Announcement {
  id: string
  title: string
  content: string
  author: TeamMember
  timestamp: string
  type: 'info' | 'warning' | 'success'
  pinned: boolean
  reactions: { emoji: string; count: number; users: string[] }[]
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Data Engineer",
    status: "online",
    lastActive: "now"
  },
  {
    id: "2", 
    name: "Mike Johnson",
    role: "Compliance Officer",
    status: "online",
    lastActive: "5 min ago"
  },
  {
    id: "3",
    name: "Alex Rivera",
    role: "Data Scientist",
    status: "away",
    lastActive: "1 hour ago"
  },
  {
    id: "4",
    name: "Dr. Emily Watson",
    role: "Data Steward",
    status: "offline",
    lastActive: "2 hours ago"
  }
]

const mockDiscussions: Discussion[] = [
  {
    id: "1",
    title: "GDPR Compliance Updates",
    description: "Discussion about the latest GDPR requirements and implementation changes",
    author: mockTeamMembers[1],
    participants: [mockTeamMembers[0], mockTeamMembers[1], mockTeamMembers[3]],
    messages: 15,
    lastActivity: "2024-01-20T14:30:00Z",
    tags: ["compliance", "gdpr", "legal"],
    status: "active",
    priority: "high"
  },
  {
    id: "2",
    title: "Data Quality Issues in Customer DB",
    description: "Investigating anomalies in customer data quality metrics",
    author: mockTeamMembers[0],
    participants: [mockTeamMembers[0], mockTeamMembers[2]],
    messages: 8,
    lastActivity: "2024-01-20T13:45:00Z",
    tags: ["data-quality", "customer", "investigation"],
    status: "active",
    priority: "medium"
  },
  {
    id: "3",
    title: "New Classification Model Results",
    description: "Sharing results from the latest ML classification model training",
    author: mockTeamMembers[2],
    participants: mockTeamMembers,
    messages: 23,
    lastActivity: "2024-01-20T12:15:00Z",
    tags: ["ml", "classification", "results"],
    status: "resolved",
    priority: "low"
  }
]

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "System Maintenance Scheduled",
    content: "Planned maintenance window this Sunday 2-4 AM EST for database optimization.",
    author: mockTeamMembers[0],
    timestamp: "2024-01-20T10:00:00Z",
    type: "warning",
    pinned: true,
    reactions: [
      { emoji: "👍", count: 8, users: ["1", "2", "3"] },
      { emoji: "📅", count: 3, users: ["4", "1"] }
    ]
  },
  {
    id: "2",
    title: "New Data Governance Guidelines",
    content: "Updated guidelines for data classification and retention policies are now available.",
    author: mockTeamMembers[3],
    timestamp: "2024-01-19T16:30:00Z",
    type: "info",
    pinned: false,
    reactions: [
      { emoji: "🎉", count: 12, users: ["1", "2", "3", "4"] }
    ]
  }
]

const statusColors = {
  online: "bg-green-500",
  away: "bg-yellow-500", 
  offline: "bg-gray-400"
}

const priorityColors = {
  low: "text-gray-500",
  medium: "text-blue-500",
  high: "text-red-500"
}

const announcementColors = {
  info: "border-blue-200 bg-blue-50",
  warning: "border-yellow-200 bg-yellow-50",
  success: "border-green-200 bg-green-50"
}

export const CollaborationSpace: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("discussions")
  const [searchQuery, setSearchQuery] = useState("")

  // Format relative time
  const formatRelativeTime = useCallback((timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    return `${diffHours}h ago`
  }, [])

  // Render team member
  const renderTeamMember = useCallback((member: TeamMember) => (
    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.avatar} />
          <AvatarFallback>
            {member.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
          statusColors[member.status]
        )} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.role}</p>
      </div>
      <div className="text-xs text-muted-foreground">
        {member.lastActive}
      </div>
    </div>
  ), [])

  // Render discussion
  const renderDiscussion = useCallback((discussion: Discussion) => (
    <Card key={discussion.id} className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-sm">{discussion.title}</CardTitle>
              <Badge variant="outline" className={cn("text-xs", priorityColors[discussion.priority])}>
                {discussion.priority}
              </Badge>
              {discussion.status === 'resolved' && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {discussion.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Discussion
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pin className="h-4 w-4 mr-2" />
                Pin
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Follow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {discussion.participants.slice(0, 3).map(participant => (
                <Avatar key={participant.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="text-xs">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {discussion.participants.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs">+{discussion.participants.length - 3}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {discussion.messages}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(discussion.lastActivity)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {discussion.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="h-4 px-1 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  ), [formatRelativeTime])

  // Render announcement
  const renderAnnouncement = useCallback((announcement: Announcement) => (
    <Card key={announcement.id} className={cn("relative", announcementColors[announcement.type])}>
      {announcement.pinned && (
        <div className="absolute top-2 right-2">
          <Pin className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={announcement.author.avatar} />
            <AvatarFallback className="text-xs">
              {announcement.author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-sm">{announcement.title}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{announcement.author.name}</span>
              <span>•</span>
              <span>{formatRelativeTime(announcement.timestamp)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{announcement.content}</p>
        
        {announcement.reactions.length > 0 && (
          <div className="flex gap-2">
            {announcement.reactions.map((reaction, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  ), [formatRelativeTime])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Collaboration Space</h1>
            <p className="text-muted-foreground">
              Connect and collaborate with your data governance team
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Start Meeting
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
              <div className="px-6 pt-4">
                <TabsList>
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                  <TabsTrigger value="files">Shared Files</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="discussions" className="flex-1 px-6 pb-6">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {mockDiscussions.map(renderDiscussion)}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="announcements" className="flex-1 px-6 pb-6">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {mockAnnouncements.map(renderAnnouncement)}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="files" className="flex-1 px-6 pb-6">
                <div className="text-center py-20">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Shared Files</h3>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar" className="flex-1 px-6 pb-6">
                <div className="text-center py-20">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Team Calendar</h3>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="border-l border-border bg-muted/20">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Team Members ({mockTeamMembers.length})</h3>
              <div className="space-y-1">
                {mockTeamMembers.map(renderTeamMember)}
              </div>

              <Separator className="my-4" />

              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Share className="h-4 w-4 mr-2" />
                  Share Resource
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  View Activity
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollaborationSpace