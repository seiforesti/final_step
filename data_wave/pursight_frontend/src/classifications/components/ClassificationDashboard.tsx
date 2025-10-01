import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, Users, Target, 
  Clock, Database, Monitor, Cpu, AlertTriangle, 
  CheckCircle, XCircle, Info, ArrowRight, Workflow
} from 'lucide-react';
import {
  AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

interface ClassificationVersion {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  stats: {
    total: number;
    active: number;
    accuracy: number;
    performance: number;
  };
}

interface SystemMetrics {
  totalClassifications: number;
  activeFrameworks: number;
  averageAccuracy: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  processingSpeed: number;
  costEfficiency: number;
}

interface RecentActivity {
  id: string;
  type: 'classification' | 'training' | 'deployment' | 'analysis';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'pending';
}

interface ClassificationDashboardProps {
  versions: ClassificationVersion[];
  systemMetrics: SystemMetrics;
  recentActivities: RecentActivity[];
  performanceData: any[];
  onVersionSelect: (versionId: string) => void;
  onViewActivity: (activityId: string) => void;
  className?: string;
}

const ClassificationDashboard: React.FC<ClassificationDashboardProps> = ({
  versions,
  systemMetrics,
  recentActivities,
  performanceData,
  onVersionSelect,
  onViewActivity,
  className = ''
}) => {
  // Memoize performance data to prevent chart re-rendering loops
  const memoizedPerformanceData = useMemo(() => {
    return performanceData || [];
  }, [performanceData]);

  // Memoize recent activities to prevent unnecessary re-renders
  const memoizedRecentActivities = useMemo(() => {
    return recentActivities || [];
  }, [recentActivities]);

  // Chart colors can be used for future enhancements
  // const chartColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className={`space-y-6 relative z-30 pointer-events-auto ${className}`}>
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classifications</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(systemMetrics.totalClassifications)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Frameworks</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeFrameworks}</div>
            <p className="text-xs text-muted-foreground">
              Across all versions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.averageAccuracy}%</div>
            <Progress value={systemMetrics.averageAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getHealthColor(systemMetrics.systemHealth)}>
              {systemMetrics.systemHealth.toUpperCase()}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classification Versions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {versions.map((version) => (
          <Card 
            key={version.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onVersionSelect(version.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <version.icon className="h-8 w-8 text-primary" />
                <Badge variant="outline">{version.stats.active} Active</Badge>
              </div>
              <CardTitle className="text-lg">{version.name}</CardTitle>
              <CardDescription>{version.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Items</span>
                  <span className="font-medium">{formatNumber(version.stats.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span className="font-medium">{version.stats.accuracy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Performance</span>
                  <span className="font-medium">{version.stats.performance}%</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Details
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Classification accuracy and processing speed over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={memoizedPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="speed" 
                  stackId="2" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest classification and system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memoizedRecentActivities.slice(0, 6).map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => onViewActivity(activity.id)}
                >
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.processingSpeed}ms</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.costEfficiency}%</div>
            <p className="text-xs text-muted-foreground">
              Resource optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassificationDashboard;
