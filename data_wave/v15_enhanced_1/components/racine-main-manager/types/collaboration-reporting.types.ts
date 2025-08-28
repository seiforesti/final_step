/**
 * Collaboration and Reporting Types - Enterprise Team Management and BI
 * =====================================================================
 *
 * This file contains comprehensive TypeScript type definitions for team collaboration,
 * project management, business intelligence, and advanced reporting features.
 */

import { ISODateString, UUID } from './racine-core.types';
import { CronSchedule, ExecutionLog } from './advanced-analytics.types';

// =============================================================================
// TEAM COLLABORATION TYPES
// =============================================================================

export interface TeamCollaboration {
  teams: Team[];
  projects: CollaborationProject[];
  sessions: CollaborationSession[];
  communications: Communication[];
  sharedResources: SharedResource[];
  workspaces: CollaborativeWorkspace[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  lead: string;
  permissions: string[];
  projects: string[];
  createdAt: ISODateString;
  lastActivity: ISODateString;
  status: "active" | "inactive" | "archived";
}

export interface TeamMember {
  userId: string;
  role: "member" | "lead" | "admin" | "viewer";
  permissions: string[];
  joinedAt: ISODateString;
  lastActive: ISODateString;
  contributions: {
    commits: number;
    reviews: number;
    issues: number;
    discussions: number;
  };
}

export interface CollaborationProject {
  id: string;
  name: string;
  description: string;
  type:
    | "data_migration"
    | "compliance_review"
    | "quality_improvement"
    | "governance_setup"
    | "custom";
  status: "planning" | "active" | "review" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  timeline: {
    startDate: ISODateString;
    endDate: ISODateString;
    milestones: ProjectMilestone[];
  };
  team: string;
  resources: string[];
  progress: number; // 0-100
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: ISODateString;
  status: "pending" | "in_progress" | "completed" | "overdue";
  dependencies: string[];
  deliverables: string[];
  assignee: string;
}

export interface CollaborationSession {
  id: string;
  type: "meeting" | "review" | "workshop" | "training" | "incident_response";
  title: string;
  participants: string[];
  startTime: ISODateString;
  endTime?: ISODateString;
  agenda: string[];
  notes: string;
  recordings: string[];
  decisions: SessionDecision[];
  actionItems: ActionItem[];
}

export interface SessionDecision {
  id: string;
  description: string;
  rationale: string;
  impact: string;
  decidedBy: string;
  timestamp: ISODateString;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: ISODateString;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "completed" | "cancelled";
  dependencies: string[];
}

export interface Communication {
  id: string;
  type: "announcement" | "discussion" | "question" | "update" | "alert";
  title: string;
  content: string;
  author: string;
  timestamp: ISODateString;
  recipients: string[];
  tags: string[];
  priority: "low" | "medium" | "high" | "urgent";
  responses: CommunicationResponse[];
  readBy: Array<{ userId: string; readAt: ISODateString }>;
}

export interface CommunicationResponse {
  id: string;
  content: string;
  author: string;
  timestamp: ISODateString;
  parentId?: string; // for threaded responses
}

export interface SharedResource {
  id: string;
  name: string;
  type: "document" | "dataset" | "model" | "workflow" | "dashboard" | "report";
  owner: string;
  sharedWith: Array<{
    userId?: string;
    teamId?: string;
    permissions: ("read" | "write" | "execute" | "admin")[];
  }>;
  lastModified: ISODateString;
  version: string;
  tags: string[];
  usage: {
    views: number;
    downloads: number;
    lastAccessed: ISODateString;
  };
}

export interface CollaborativeWorkspace {
  id: string;
  name: string;
  description: string;
  type: "project" | "team" | "temporary" | "shared";
  members: string[];
  resources: string[];
  permissions: Record<string, string[]>;
  settings: {
    privacy: "public" | "private" | "restricted";
    notifications: boolean;
    autoSync: boolean;
    backupSchedule: string;
  };
  activity: WorkspaceActivity[];
}

export interface WorkspaceActivity {
  id: string;
  type:
    | "file_change"
    | "member_join"
    | "member_leave"
    | "permission_change"
    | "resource_add"
    | "resource_remove";
  description: string;
  user: string;
  timestamp: ISODateString;
  metadata: Record<string, any>;
}

// =============================================================================
// ADVANCED REPORTING TYPES
// =============================================================================

export interface ReportingEngine {
  templates: ReportTemplate[];
  schedules: ReportSchedule[];
  executions: ReportExecution[];
  subscriptions: ReportSubscription[];
  customizations: ReportCustomization[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "compliance"
    | "performance"
    | "security"
    | "cost"
    | "usage"
    | "custom";
  type: "standard" | "executive" | "technical" | "regulatory";
  format: "pdf" | "excel" | "html" | "json" | "csv";
  sections: ReportSection[];
  parameters: ReportParameter[];
  visualizations: ReportVisualization[];
  compliance: {
    frameworks: string[];
    requirements: string[];
    certifications: string[];
  };
}

export interface ReportSection {
  id: string;
  name: string;
  type: "summary" | "detailed" | "chart" | "table" | "text" | "custom";
  order: number;
  configuration: Record<string, any>;
  dataSource: string;
  filters: ReportFilter[];
}

export interface ReportParameter {
  name: string;
  type: "string" | "number" | "date" | "boolean" | "select" | "multiselect";
  required: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface ReportVisualization {
  id: string;
  type:
    | "line_chart"
    | "bar_chart"
    | "pie_chart"
    | "scatter_plot"
    | "heatmap"
    | "treemap"
    | "network"
    | "custom";
  title: string;
  dataSource: string;
  configuration: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: string;
    colors?: string[];
    interactive?: boolean;
  };
  position: { x: number; y: number; width: number; height: number };
}

export interface ReportFilter {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "between"
    | "in"
    | "not_in";
  value: any;
  dynamic?: boolean; // if true, value is calculated at runtime
}

export interface ReportSchedule {
  id: string;
  templateId: string;
  name: string;
  frequency: "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  schedule: CronSchedule;
  recipients: ReportRecipient[];
  parameters: Record<string, any>;
  enabled: boolean;
  lastExecution?: ISODateString;
  nextExecution: ISODateString;
}

export interface ReportRecipient {
  type: "user" | "group" | "email" | "webhook";
  identifier: string;
  deliveryMethod: "email" | "portal" | "api" | "file_share";
  preferences: {
    format: string;
    compression?: boolean;
    encryption?: boolean;
  };
}

export interface ReportExecution {
  id: string;
  scheduleId?: string;
  templateId: string;
  startTime: ISODateString;
  endTime?: ISODateString;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  parameters: Record<string, any>;
  result?: {
    fileUrl: string;
    size: number;
    recordCount: number;
    executionTime: number;
  };
  error?: string;
  logs: ExecutionLog[];
}

export interface ReportSubscription {
  id: string;
  userId: string;
  templateId: string;
  frequency: string;
  filters: Record<string, any>;
  deliveryPreferences: {
    method: "email" | "portal" | "api";
    format: string;
    schedule: string;
  };
  enabled: boolean;
  lastDelivery?: ISODateString;
}

export interface ReportCustomization {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  modifications: {
    sections: string[]; // included sections
    parameters: Record<string, any>;
    visualizations: Record<string, any>;
    styling: Record<string, any>;
  };
  shared: boolean;
  sharedWith: string[];
}