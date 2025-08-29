'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  FileText,
  Users,
  Calendar,
  ExternalLink,
  RefreshCw,
  Download,
  Eye,
  Plus,
  Filter
} from 'lucide-react';
import {
  useComplianceDashboard,
  useComplianceViolations,
  useComplianceReports
} from '../hooks/useComplianceRules';
import type {
  ComplianceFramework,
  RuleSeverity,
  ComplianceStatus,
  ComplianceViolation
} from '@/types/compliance.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn, formatRelativeTime, formatNumber, formatPercentage } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function ComplianceDashboard() {
  const router = useRouter();
  const { checkPermission } = useAuth();
  
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | 'all'>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // API hooks
  const { data: dashboardData, isLoading, error, refetch } = useComplianceDashboard();
  const { data: violationsData } = useComplianceViolations({
    limit: 10,
    sort_by: 'detected_at',
    sort_order: 'desc'
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading compliance dashboard..." />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="card p-6">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Failed to load compliance dashboard</span>
        </div>
      </div>
    );
  }

  const overview = dashboardData.overview;
  const recentViolations = dashboardData.recent_violations || [];
  const complianceTrends = dashboardData.compliance_trends || [];
  const frameworkCompliance = dashboardData.framework_compliance || [];
  const riskAssessment = dashboardData.risk_assessment;

  const COLORS = ['#FF3621', '#00A972', '#FF8A00', '#1B3139', '#8B5CF6'];

  const getFrameworkColor = (framework: ComplianceFramework) => {
    switch (framework) {
      case 'gdpr': return '#3B82F6';
      case 'ccpa': return '#8B5CF6';
      case 'hipaa': return '#10B981';
      case 'sox': return '#EF4444';
      case 'pci_dss': return '#F59E0B';
      case 'iso_27001': return '#6366F1';
      case 'nist': return '#EC4899';
      default: return '#6B7280';
    }
  };

  const getSeverityColor = (severity: RuleSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your organization's compliance status and risk posture
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="form-input text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <button
            onClick={() => refetch()}
            className="btn-outline flex items-center space-x-2"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </button>
          
          {checkPermission('compliance:create') && (
            <button
              onClick={() => router.push('/compliance-rules/new')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Rule</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Compliance</p>
              <p className={cn(
                "text-3xl font-bold mt-1",
                getComplianceScoreColor(overview.overall_compliance_score)
              )}>
                {overview.overall_compliance_score}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {overview.active_rules} active rules
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Violations</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatNumber(overview.total_violations - overview.resolved_violations)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatNumber(overview.resolved_violations)} resolved
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Frameworks</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {overview.frameworks_count}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {overview.total_rules} total rules
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
              <p className={cn(
                "text-xl font-bold mt-1 px-2 py-1 rounded-md",
                getRiskLevelColor(riskAssessment.overall_risk_level)
              )}>
                {riskAssessment.overall_risk_level.toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {riskAssessment.risk_factors.length} factors
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trends */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Compliance Trends</h3>
                <p className="text-sm text-muted-foreground">
                  Compliance score and violation trends over time
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="card-content">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complianceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="compliance_score"
                    stroke="#00A972"
                    strokeWidth={2}
                    name="Compliance Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="violations"
                    stroke="#FF3621"
                    strokeWidth={2}
                    name="Violations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Framework Compliance */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Framework Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  Compliance scores by regulatory framework
                </p>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {frameworkCompliance.map((framework) => (
                <div key={framework.framework} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium uppercase">
                        {framework.framework}
                      </span>
                      {getTrendIcon(framework.trend)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "text-sm font-medium",
                        getComplianceScoreColor(framework.compliance_score)
                      )}>
                        {framework.compliance_score}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({framework.violations} violations)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${framework.compliance_score}%`,
                        backgroundColor: getFrameworkColor(framework.framework)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Violations */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Recent Violations</h3>
                <p className="text-sm text-muted-foreground">
                  Latest compliance violations requiring attention
                </p>
              </div>
              <button
                onClick={() => router.push('/compliance-rules/violations')}
                className="btn-outline btn-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="card-content">
            {recentViolations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Recent Violations
                </h3>
                <p className="text-muted-foreground">
                  Your compliance rules are working well!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentViolations.slice(0, 5).map((violation: ComplianceViolation) => (
                  <div key={violation.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0">
                      <AlertTriangle className={cn(
                        "h-5 w-5",
                        violation.severity === 'critical' ? 'text-red-500' :
                        violation.severity === 'high' ? 'text-orange-500' :
                        violation.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => router.push(`/compliance-rules/violations/${violation.id}`)}
                          className="text-sm font-medium text-foreground hover:text-primary truncate"
                        >
                          {violation.rule.name}
                        </button>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border ml-2",
                          getSeverityColor(violation.severity)
                        )}>
                          {violation.severity}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {violation.violation_details.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="uppercase">{violation.rule.framework}</span>
                          <span>{formatRelativeTime(violation.detected_at)}</span>
                          {violation.violation_details.impact_assessment && (
                            <span>
                              {formatNumber(violation.violation_details.impact_assessment.affected_records)} records
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => router.push(`/compliance-rules/violations/${violation.id}`)}
                          className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1"
                        >
                          <span>View</span>
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="text-lg font-semibold">Risk Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Key risk factors and recommendations
              </p>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-6">
              {/* Overall Risk */}
              <div className="text-center">
                <div className={cn(
                  "inline-flex items-center px-4 py-2 rounded-full text-lg font-bold",
                  getRiskLevelColor(riskAssessment.overall_risk_level)
                )}>
                  {riskAssessment.overall_risk_level.toUpperCase()} RISK
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Risk Factors</h4>
                <div className="space-y-3">
                  {riskAssessment.risk_factors.slice(0, 3).map((factor, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        factor.impact === 'critical' ? 'bg-red-500' :
                        factor.impact === 'high' ? 'bg-orange-500' :
                        factor.impact === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      )} />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {factor.factor}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {factor.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Top Recommendations</h4>
                <div className="space-y-3">
                  {riskAssessment.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {rec.title}
                        </span>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        )}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => router.push('/compliance-rules/risk-assessment')}
                className="w-full btn-outline btn-sm"
              >
                View Full Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}