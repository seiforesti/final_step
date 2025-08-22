// Racine Analytics Utilities - aligned with backend analytics endpoints
// Provides activity tracking, reporting, and behavior analysis helpers

type UUID = string;

interface TrackActivityRequest {
  userId?: UUID;
  action: string;
  details?: Record<string, any>;
  timestamp?: string;
}

interface ActivityReportRequest {
  userId?: UUID;
  timeRange?: string; // e.g., '7d', '30d'
  metrics?: string[];
}

interface BehaviorAnalysisRequest {
  userId?: UUID;
  period?: string; // e.g., '30d'
  includeInsights?: boolean;
}

export async function trackUserActivity(req: TrackActivityRequest): Promise<{ success: boolean }>{
  const body = {
    ...req,
    timestamp: req.timestamp || new Date().toISOString(),
  };
  const res = await fetch('/api/v1/analytics/user/activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to track activity: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function generateActivityReport(req: ActivityReportRequest): Promise<{ items: any[]; summary?: any }>{
  const params = new URLSearchParams();
  if (req.userId) params.append('user_id', req.userId);
  if (req.timeRange) params.append('time_range', req.timeRange);
  (req.metrics || []).forEach(m => params.append('metric', m));
  const res = await fetch(`/api/v1/analytics/user/report?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to generate activity report: ${res.statusText}`);
  return res.json();
}

export async function analyzeUserBehavior(req: BehaviorAnalysisRequest): Promise<{ insights: any[]; anomalies?: any[] }>{
  const res = await fetch('/api/v1/analytics/user/behavior/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Failed to analyze user behavior: ${res.statusText}`);
  return res.json();
}

export default {
  trackUserActivity,
  generateActivityReport,
  analyzeUserBehavior,
};



