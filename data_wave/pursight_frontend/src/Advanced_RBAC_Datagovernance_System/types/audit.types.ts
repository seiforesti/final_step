// Audit Logging Types - Maps to backend auth_models.py RbacAuditLog model

export interface RbacAuditLog {
  id: number;
  action: string;
  performed_by: string;
  target_user?: string;
  resource_type?: string;
  resource_id?: string;
  role?: string;
  status?: string;
  note?: string;
  timestamp: string;
  
  // Advanced audit fields
  entity_type?: string;
  entity_id?: string;
  before_state?: string;
  after_state?: string;
  correlation_id?: string;
  actor_ip?: string;
  actor_device?: string;
  api_client?: string;
  extra_metadata?: string;
}

export interface AuditLogFilters {
  user?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  role?: string;
  status?: string;
  entity_type?: string;
  entity_id?: string;
  start_date?: string;
  end_date?: string;
  correlation_id?: string;
  skip?: number;
  limit?: number;
}

export interface AuditLogStats {
  total_logs: number;
  logs_by_action: Record<string, number>;
  logs_by_user: Record<string, number>;
  logs_by_status: Record<string, number>;
  recent_activity: RbacAuditLog[];
}

export interface EntityAuditQuery {
  entity_type: string;
  entity_id: string;
  limit?: number;
}

export interface AuditExportOptions {
  format: 'csv' | 'json' | 'pdf';
  filters: AuditLogFilters;
  include_metadata: boolean;
  date_range: {
    start: string;
    end: string;
  };
}