'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  User, 
  Database, 
  Shield, 
  Tags, 
  ScanLine, 
  BookOpen, 
  Workflow,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatRelativeTime, cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'scan' | 'classification' | 'compliance' | 'user_action' | 'system_event' | 'data_source' | 'workflow';
  title: string;
  description: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  metadata?: {
    resource_type?: string;
    resource_id?: string;
    resource_name?: string;
    status?: string;
    duration_ms?: number;
  };
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface ActivityFeedData {
  activities: ActivityItem[];
  total_count: number;
}

export function ActivityFeed() {
  const { data: activityData, isLoading, error } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      const response = await apiClient.get<ActivityFeedData>('/api/v1/activity/recent?limit=20');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="card-content">
          <LoadingSpinner size="md" text="Loading activities..." />
        </div>
      </div>
    );
  }

  if (error || !activityData) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="card-content">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Failed to load activity feed</span>
          </div>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'scan':
        return <ScanLine className="h-4 w-4 text-blue-600" />;
      case 'classification':
        return <Tags className="h-4 w-4 text-purple-600" />;
      case 'compliance':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'user_action':
        return <User className="h-4 w-4 text-indigo-600" />;
      case 'data_source':
        return <Database className="h-4 w-4 text-teal-600" />;
      case 'workflow':
        return <Workflow className="h-4 w-4 text-orange-600" />;
      case 'system_event':
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'info':
      default:
        return <Clock className="h-3 w-3 text-blue-600" />;
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              {activityData.total_count} total activities
            </p>
          </div>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="card-content">
        {activityData.activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activityData.activities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border-l-4 bg-muted/30 hover:bg-muted/50 transition-colors",
                  getStatusColor(activity.status)
                )}
              >
                {/* Activity icon */}
                <div className="flex-shrink-0 p-1">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </h4>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusIcon(activity.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {activity.description}
                  </p>

                  {/* Activity metadata */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {activity.user && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{activity.user.name}</span>
                        </div>
                      )}
                      
                      {activity.metadata?.resource_name && (
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-3 w-3" />
                          <span className="truncate max-w-20">
                            {activity.metadata.resource_name}
                          </span>
                        </div>
                      )}
                      
                      {activity.metadata?.duration_ms && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(activity.metadata.duration_ms)}</span>
                        </div>
                      )}
                    </div>

                    {activity.metadata?.resource_id && (
                      <button className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1">
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View all activities link */}
        {activityData.activities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <button className="w-full text-sm text-primary hover:text-primary/80 font-medium">
              View all activities →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}