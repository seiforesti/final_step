export interface HistoryEntry {
  id: string;
  user: string;
  userEmail?: string;
  avatarUrl?: string;
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'access' | 'schema_change' | 'permission_change' | 'other';
  timestamp: string;
  details?: {
    before?: any;
    after?: any;
    changes?: string[];
    description?: string;
  };
  affectedColumns?: string[];
  systemGenerated: boolean;
}

export interface TableHistoryData {
  entries: HistoryEntry[];
  lastUpdated: string;
}