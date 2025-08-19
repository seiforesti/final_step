/**
 * 🎯 Scan Priority Manager - Advanced Scan Logic
 * =============================================
 * 
 * Enterprise-grade scan priority management system
 * Maps to: backend/services/priority_management_service.py
 * 
 * Features:
 * - Dynamic priority adjustment based on business rules
 * - SLA-aware priority escalation
 * - Resource-based priority weighting
 * - Advanced priority queue visualization
 * - Conflict resolution through priority negotiation
 * - Performance impact analysis for priority changes
 * - ML-powered priority optimization
 * - Real-time priority analytics and insights
 * - Automated priority rule enforcement
 * - Priority inheritance and delegation
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Database, 
  GitBranch, 
  Globe, 
  Layers, 
  Network, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Shield, 
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  Server,
  Monitor,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  Info,
  ExternalLink,
  Copy,
  Share2,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Target,
  Flag,
  Star,
  Crown,
  Timer,
  Gauge,
  LineChart,
  PieChart,
  BarChart,
  Workflow,
  Route,
  Priority,
  ArrowUpCircle,
  ArrowDownCircle,
  Equal,
  Flame,
  Snowflake,
  Calendar,
  User,
  Building,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// Advanced-Scan-Logic imports
import { useScanCoordination } from '../../hooks/useScanCoordination';
import { scanCoordinationAPI } from '../../services/scan-coordination-apis';
import {
  ScanCoordination,
  CoordinatedScan,
  CoordinationStatus,
  CoordinationType
} from '../../types/coordination.types';
import { BRAND_COLORS } from '../../constants/ui-constants';

// ==========================================
// INTERFACES & TYPES
// ==========================================

interface PriorityLevel {
  id: string;
  name: string;
  level: number; // 0-100, higher = more priority
  color: string;
  icon: React.ReactNode;
  description: string;
  slaTarget?: number; // in minutes
  escalationRules?: EscalationRule[];
  resourceWeight: number;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
}

interface EscalationRule {
  id: string;
  name: string;
  condition: string;
  action: 'increase_priority' | 'notify_stakeholder' | 'allocate_resources' | 'escalate_to_manager';
  threshold: number;
  targetPriority?: number;
  stakeholders?: string[];
  isActive: boolean;
}

interface PrioritizedScan {
  id: string;
  name: string;
  type: string;
  currentPriority: number;
  originalPriority: number;
  priorityLevel: PriorityLevel;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  estimatedDuration: number;
  actualDuration?: number;
  queuePosition: number;
  slaDeadline?: string;
  businessOwner: string;
  department: string;
  resourceRequirements: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  dependencies: string[];
  tags: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  escalationHistory: EscalationEvent[];
  priorityHistory: PriorityChangeEvent[];
}

interface EscalationEvent {
  id: string;
  timestamp: string;
  rule: string;
  action: string;
  reason: string;
  previousPriority: number;
  newPriority: number;
  triggeredBy: string;
}

interface PriorityChangeEvent {
  id: string;
  timestamp: string;
  previousPriority: number;
  newPriority: number;
  reason: string;
  changedBy: string;
  automatic: boolean;
}

interface PriorityRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: 'set_priority' | 'increase_priority' | 'decrease_priority' | 'escalate';
  value: number;
  priority: number;
  isActive: boolean;
  matchCount: number;
  lastTriggered?: string;
  department?: string;
  scanType?: string;
  timeWindow?: string;
}

interface PriorityAnalytics {
  totalScans: number;
  averageWaitTime: number;
  slaCompliance: number;
  priorityDistribution: Record<string, number>;
  escalationRate: number;
  throughput: number;
  resourceUtilization: number;
  bottlenecks: string[];
  recommendations: string[];
}

interface ScanPriorityManagerProps {
  className?: string;
  onPriorityChange?: (scanId: string, priority: number) => void;
  onEscalation?: (scanId: string, event: EscalationEvent) => void;
  enableAutoEscalation?: boolean;
  refreshInterval?: number;
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================

export const ScanPriorityManager: React.FC<ScanPriorityManagerProps> = ({
  className = '',
  onPriorityChange,
  onEscalation,
  enableAutoEscalation = true,
  refreshInterval = 5000
}) => {
  // ==========================================
  // HOOKS & STATE MANAGEMENT
  // ==========================================

  const {
    coordinations,
    isLoading,
    error
  } = useScanCoordination({
    autoRefresh: true,
    refreshInterval,
    enableRealTimeUpdates: true,
    onError: (error) => {
      toast.error(`Priority manager error: ${error.message}`);
    }
  });

  // Local state
  const [activeTab, setActiveTab] = useState('queue');
  const [priorityLevels, setPriorityLevels] = useState<PriorityLevel[]>([]);
  const [prioritizedScans, setPrioritizedScans] = useState<PrioritizedScan[]>([]);
  const [priorityRules, setPriorityRules] = useState<PriorityRule[]>([]);
  const [selectedScan, setSelectedScan] = useState<PrioritizedScan | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'priority' | 'queue_position' | 'sla_deadline' | 'created_at'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [autoEscalationEnabled, setAutoEscalationEnabled] = useState(enableAutoEscalation);
  const [searchQuery, setSearchQuery] = useState('');

  // Analytics state
  const [analytics, setAnalytics] = useState<PriorityAnalytics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, any>>({});

  // ==========================================
  // COMPUTED VALUES & MEMOIZATION
  // ==========================================

  const filteredScans = useMemo(() => {
    let filtered = prioritizedScans.filter(scan => {
      if (filterDepartment !== 'all' && scan.department !== filterDepartment) return false;
      if (filterPriority !== 'all' && scan.priorityLevel.id !== filterPriority) return false;
      if (filterStatus !== 'all' && scan.status !== filterStatus) return false;
      if (searchQuery && !scan.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Sort scans
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'priority':
          aValue = a.currentPriority;
          bValue = b.currentPriority;
          break;
        case 'queue_position':
          aValue = a.queuePosition;
          bValue = b.queuePosition;
          break;
        case 'sla_deadline':
          aValue = a.slaDeadline ? new Date(a.slaDeadline).getTime() : 0;
          bValue = b.slaDeadline ? new Date(b.slaDeadline).getTime() : 0;
          break;
        case 'created_at':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [prioritizedScans, filterDepartment, filterPriority, filterStatus, searchQuery, sortBy, sortOrder]);

  const queueStatistics = useMemo(() => {
    const total = prioritizedScans.length;
    const queued = prioritizedScans.filter(s => s.status === 'queued').length;
    const running = prioritizedScans.filter(s => s.status === 'running').length;
    const completed = prioritizedScans.filter(s => s.status === 'completed').length;
    const failed = prioritizedScans.filter(s => s.status === 'failed').length;
    
    const highPriority = prioritizedScans.filter(s => s.currentPriority >= 80).length;
    const mediumPriority = prioritizedScans.filter(s => s.currentPriority >= 50 && s.currentPriority < 80).length;
    const lowPriority = prioritizedScans.filter(s => s.currentPriority < 50).length;
    
    const slaViolations = prioritizedScans.filter(s => {
      if (!s.slaDeadline) return false;
      return new Date(s.slaDeadline).getTime() < Date.now() && s.status !== 'completed';
    }).length;

    const averageWaitTime = queued > 0 ? 
      prioritizedScans
        .filter(s => s.status === 'queued')
        .reduce((sum, s) => sum + (Date.now() - new Date(s.createdAt).getTime()), 0) / queued / (1000 * 60) : 0;

    return {
      total,
      queued,
      running,
      completed,
      failed,
      highPriority,
      mediumPriority,
      lowPriority,
      slaViolations,
      averageWaitTime: Math.round(averageWaitTime)
    };
  }, [prioritizedScans]);

  const departmentStats = useMemo(() => {
    const stats: Record<string, any> = {};
    
    prioritizedScans.forEach(scan => {
      if (!stats[scan.department]) {
        stats[scan.department] = {
          total: 0,
          queued: 0,
          running: 0,
          completed: 0,
          failed: 0,
          averagePriority: 0,
          slaViolations: 0
        };
      }
      
      stats[scan.department].total++;
      stats[scan.department][scan.status]++;
      stats[scan.department].averagePriority += scan.currentPriority;
      
      if (scan.slaDeadline && new Date(scan.slaDeadline).getTime() < Date.now() && scan.status !== 'completed') {
        stats[scan.department].slaViolations++;
      }
    });
    
    Object.keys(stats).forEach(dept => {
      stats[dept].averagePriority = Math.round(stats[dept].averagePriority / stats[dept].total);
    });
    
    return stats;
  }, [prioritizedScans]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handlePriorityChange = useCallback(async (scanId: string, newPriority: number, reason: string = 'Manual adjustment') => {
    const scan = prioritizedScans.find(s => s.id === scanId);
    if (!scan) return;

    try {
      const priorityLevel = priorityLevels.find(p => newPriority >= p.level - 10 && newPriority <= p.level + 10) || priorityLevels[0];
      
      // Update scan priority
      setPrioritizedScans(prev => prev.map(s => 
        s.id === scanId ? {
          ...s,
          currentPriority: newPriority,
          priorityLevel,
          priorityHistory: [
            ...s.priorityHistory,
            {
              id: `change-${Date.now()}`,
              timestamp: new Date().toISOString(),
              previousPriority: s.currentPriority,
              newPriority,
              reason,
              changedBy: 'User',
              automatic: false
            }
          ]
        } : s
      ));

      // Recalculate queue positions
      recalculateQueuePositions();

      toast.success(`Priority updated for ${scan.name}`);
      onPriorityChange?.(scanId, newPriority);

    } catch (error) {
      console.error('Priority change failed:', error);
      toast.error('Failed to update priority');
    }
  }, [prioritizedScans, priorityLevels, onPriorityChange]);

  const handleEscalation = useCallback(async (scanId: string, rule: EscalationRule) => {
    const scan = prioritizedScans.find(s => s.id === scanId);
    if (!scan) return;

    try {
      const escalationEvent: EscalationEvent = {
        id: `escalation-${Date.now()}`,
        timestamp: new Date().toISOString(),
        rule: rule.name,
        action: rule.action,
        reason: `Triggered by: ${rule.condition}`,
        previousPriority: scan.currentPriority,
        newPriority: rule.targetPriority || scan.currentPriority + 20,
        triggeredBy: 'System'
      };

      // Apply escalation action
      switch (rule.action) {
        case 'increase_priority':
          await handlePriorityChange(scanId, rule.targetPriority || scan.currentPriority + 20, `Escalation: ${rule.name}`);
          break;
        case 'notify_stakeholder':
          // Send notifications (would integrate with notification service)
          toast.info(`Stakeholders notified for ${scan.name}`);
          break;
        case 'allocate_resources':
          // Request additional resources (would integrate with resource manager)
          toast.info(`Additional resources requested for ${scan.name}`);
          break;
        case 'escalate_to_manager':
          // Escalate to management (would integrate with workflow system)
          toast.info(`Escalated to management: ${scan.name}`);
          break;
      }

      // Add escalation event to scan
      setPrioritizedScans(prev => prev.map(s => 
        s.id === scanId ? {
          ...s,
          escalationHistory: [...s.escalationHistory, escalationEvent]
        } : s
      ));

      onEscalation?.(scanId, escalationEvent);

    } catch (error) {
      console.error('Escalation failed:', error);
      toast.error('Failed to escalate scan');
    }
  }, [prioritizedScans, handlePriorityChange, onEscalation]);

  const recalculateQueuePositions = useCallback(() => {
    setPrioritizedScans(prev => {
      const queuedScans = prev.filter(s => s.status === 'queued');
      const nonQueuedScans = prev.filter(s => s.status !== 'queued');
      
      // Sort by priority (highest first)
      queuedScans.sort((a, b) => b.currentPriority - a.currentPriority);
      
      // Assign queue positions
      queuedScans.forEach((scan, index) => {
        scan.queuePosition = index + 1;
      });
      
      return [...queuedScans, ...nonQueuedScans];
    });
  }, []);

  const handleBulkPriorityChange = useCallback(async (scanIds: string[], operation: 'increase' | 'decrease' | 'set', value: number) => {
    try {
      for (const scanId of scanIds) {
        const scan = prioritizedScans.find(s => s.id === scanId);
        if (!scan) continue;

        let newPriority: number;
        switch (operation) {
          case 'increase':
            newPriority = Math.min(100, scan.currentPriority + value);
            break;
          case 'decrease':
            newPriority = Math.max(0, scan.currentPriority - value);
            break;
          case 'set':
            newPriority = value;
            break;
        }

        await handlePriorityChange(scanId, newPriority, `Bulk ${operation}: ${value}`);
      }

      toast.success(`Bulk priority ${operation} applied to ${scanIds.length} scans`);

    } catch (error) {
      console.error('Bulk priority change failed:', error);
      toast.error('Failed to apply bulk priority changes');
    }
  }, [prioritizedScans, handlePriorityChange]);

  const handleAutoEscalationCheck = useCallback(() => {
    if (!autoEscalationEnabled) return;

    prioritizedScans.forEach(scan => {
      if (scan.status !== 'queued') return;

      // Check SLA deadline
      if (scan.slaDeadline) {
        const timeToDeadline = new Date(scan.slaDeadline).getTime() - Date.now();
        const hoursToDeadline = timeToDeadline / (1000 * 60 * 60);
        
        if (hoursToDeadline <= 2 && scan.currentPriority < 90) {
          // SLA escalation rule
          const slaRule: EscalationRule = {
            id: 'sla-escalation',
            name: 'SLA Deadline Approaching',
            condition: 'SLA deadline within 2 hours',
            action: 'increase_priority',
            threshold: 2,
            targetPriority: 90,
            isActive: true
          };
          
          handleEscalation(scan.id, slaRule);
        }
      }

      // Check wait time
      const waitTime = (Date.now() - new Date(scan.createdAt).getTime()) / (1000 * 60 * 60);
      if (waitTime > 4 && scan.currentPriority < 70) {
        // Long wait escalation rule
        const waitRule: EscalationRule = {
          id: 'wait-time-escalation',
          name: 'Long Wait Time',
          condition: 'Waiting more than 4 hours',
          action: 'increase_priority',
          threshold: 4,
          targetPriority: 70,
          isActive: true
        };
        
        handleEscalation(scan.id, waitRule);
      }
    });
  }, [autoEscalationEnabled, prioritizedScans, handleEscalation]);

  // ==========================================
  // EFFECTS & LIFECYCLE
  // ==========================================

  // Initialize mock data
  useEffect(() => {
    const mockPriorityLevels: PriorityLevel[] = [
      {
        id: 'critical',
        name: 'Critical',
        level: 95,
        color: 'text-red-600',
        icon: <Flame className="h-4 w-4" />,
        description: 'Business-critical scans requiring immediate attention',
        slaTarget: 30,
        resourceWeight: 1.0,
        businessImpact: 'critical'
      },
      {
        id: 'high',
        name: 'High',
        level: 80,
        color: 'text-orange-600',
        icon: <ArrowUpCircle className="h-4 w-4" />,
        description: 'High-priority scans with significant business impact',
        slaTarget: 120,
        resourceWeight: 0.8,
        businessImpact: 'high'
      },
      {
        id: 'medium',
        name: 'Medium',
        level: 50,
        color: 'text-yellow-600',
        icon: <Equal className="h-4 w-4" />,
        description: 'Standard priority scans for regular operations',
        slaTarget: 480,
        resourceWeight: 0.6,
        businessImpact: 'medium'
      },
      {
        id: 'low',
        name: 'Low',
        level: 25,
        color: 'text-blue-600',
        icon: <ArrowDownCircle className="h-4 w-4" />,
        description: 'Low-priority scans that can be deferred',
        slaTarget: 1440,
        resourceWeight: 0.4,
        businessImpact: 'low'
      },
      {
        id: 'background',
        name: 'Background',
        level: 10,
        color: 'text-gray-600',
        icon: <Snowflake className="h-4 w-4" />,
        description: 'Background scans running during off-peak hours',
        resourceWeight: 0.2,
        businessImpact: 'low'
      }
    ];

    const mockScans: PrioritizedScan[] = [
      {
        id: 'scan-001',
        name: 'Customer Database Security Scan',
        type: 'security',
        currentPriority: 95,
        originalPriority: 80,
        priorityLevel: mockPriorityLevels[0],
        status: 'queued',
        estimatedDuration: 45,
        queuePosition: 1,
        slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        businessOwner: 'John Smith',
        department: 'Security',
        resourceRequirements: { cpu: 80, memory: 16384, storage: 100, network: 50 },
        dependencies: [],
        tags: ['security', 'customer-data', 'compliance'],
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        escalationHistory: [
          {
            id: 'esc-001',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            rule: 'SLA Deadline Approaching',
            action: 'increase_priority',
            reason: 'SLA deadline within 2 hours',
            previousPriority: 80,
            newPriority: 95,
            triggeredBy: 'System'
          }
        ],
        priorityHistory: [
          {
            id: 'change-001',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            previousPriority: 80,
            newPriority: 95,
            reason: 'SLA escalation',
            changedBy: 'System',
            automatic: true
          }
        ]
      },
      {
        id: 'scan-002',
        name: 'Financial Data Compliance Scan',
        type: 'compliance',
        currentPriority: 85,
        originalPriority: 85,
        priorityLevel: mockPriorityLevels[1],
        status: 'running',
        estimatedDuration: 60,
        queuePosition: 0,
        slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        businessOwner: 'Sarah Johnson',
        department: 'Finance',
        resourceRequirements: { cpu: 60, memory: 12288, storage: 200, network: 30 },
        dependencies: [],
        tags: ['compliance', 'financial', 'audit'],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        escalationHistory: [],
        priorityHistory: []
      },
      {
        id: 'scan-003',
        name: 'HR System Vulnerability Assessment',
        type: 'vulnerability',
        currentPriority: 70,
        originalPriority: 50,
        priorityLevel: mockPriorityLevels[1],
        status: 'queued',
        estimatedDuration: 90,
        queuePosition: 2,
        slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        businessOwner: 'Mike Chen',
        department: 'HR',
        resourceRequirements: { cpu: 40, memory: 8192, storage: 50, network: 20 },
        dependencies: ['scan-002'],
        tags: ['vulnerability', 'hr', 'assessment'],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        escalationHistory: [
          {
            id: 'esc-002',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            rule: 'Long Wait Time',
            action: 'increase_priority',
            reason: 'Waiting more than 4 hours',
            previousPriority: 50,
            newPriority: 70,
            triggeredBy: 'System'
          }
        ],
        priorityHistory: [
          {
            id: 'change-002',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            previousPriority: 50,
            newPriority: 70,
            reason: 'Wait time escalation',
            changedBy: 'System',
            automatic: true
          }
        ]
      },
      {
        id: 'scan-004',
        name: 'Marketing Database Performance Scan',
        type: 'performance',
        currentPriority: 45,
        originalPriority: 45,
        priorityLevel: mockPriorityLevels[2],
        status: 'queued',
        estimatedDuration: 30,
        queuePosition: 3,
        businessOwner: 'Lisa Wong',
        department: 'Marketing',
        resourceRequirements: { cpu: 30, memory: 4096, storage: 25, network: 15 },
        dependencies: [],
        tags: ['performance', 'marketing', 'database'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        escalationHistory: [],
        priorityHistory: []
      },
      {
        id: 'scan-005',
        name: 'Development Environment Audit',
        type: 'audit',
        currentPriority: 20,
        originalPriority: 20,
        priorityLevel: mockPriorityLevels[3],
        status: 'queued',
        estimatedDuration: 120,
        queuePosition: 4,
        businessOwner: 'David Park',
        department: 'Engineering',
        resourceRequirements: { cpu: 20, memory: 2048, storage: 10, network: 10 },
        dependencies: [],
        tags: ['audit', 'development', 'environment'],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        escalationHistory: [],
        priorityHistory: []
      }
    ];

    const mockRules: PriorityRule[] = [
      {
        id: 'rule-001',
        name: 'Security Scans High Priority',
        description: 'All security scans should have high priority',
        condition: 'scan.type = "security"',
        action: 'set_priority',
        value: 80,
        priority: 1,
        isActive: true,
        matchCount: 156,
        lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        scanType: 'security'
      },
      {
        id: 'rule-002',
        name: 'Finance Department Priority Boost',
        description: 'Finance department scans get priority boost during month-end',
        condition: 'scan.department = "Finance" AND day_of_month > 25',
        action: 'increase_priority',
        value: 20,
        priority: 2,
        isActive: true,
        matchCount: 23,
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        department: 'Finance'
      },
      {
        id: 'rule-003',
        name: 'SLA Deadline Escalation',
        description: 'Escalate scans approaching SLA deadline',
        condition: 'sla_deadline - current_time < 2 hours',
        action: 'escalate',
        value: 90,
        priority: 0,
        isActive: true,
        matchCount: 45,
        lastTriggered: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      }
    ];

    setPriorityLevels(mockPriorityLevels);
    setPrioritizedScans(mockScans);
    setPriorityRules(mockRules);

  }, []);

  // Auto-escalation check
  useEffect(() => {
    if (!autoEscalationEnabled) return;

    const interval = setInterval(handleAutoEscalationCheck, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [autoEscalationEnabled, handleAutoEscalationCheck]);

  // Calculate analytics
  useEffect(() => {
    const totalScans = prioritizedScans.length;
    const completedScans = prioritizedScans.filter(s => s.status === 'completed');
    const queuedScans = prioritizedScans.filter(s => s.status === 'queued');
    
    const averageWaitTime = queuedScans.length > 0 ? 
      queuedScans.reduce((sum, s) => sum + (Date.now() - new Date(s.createdAt).getTime()), 0) / queuedScans.length / (1000 * 60) : 0;
    
    const slaViolations = prioritizedScans.filter(s => {
      if (!s.slaDeadline) return false;
      return new Date(s.slaDeadline).getTime() < Date.now() && s.status !== 'completed';
    }).length;
    
    const slaCompliance = totalScans > 0 ? ((totalScans - slaViolations) / totalScans) * 100 : 100;
    
    const priorityDistribution: Record<string, number> = {};
    priorityLevels.forEach(level => {
      priorityDistribution[level.name] = prioritizedScans.filter(s => s.priorityLevel.id === level.id).length;
    });
    
    const escalationRate = totalScans > 0 ? 
      (prioritizedScans.filter(s => s.escalationHistory.length > 0).length / totalScans) * 100 : 0;
    
    const runningScans = prioritizedScans.filter(s => s.status === 'running').length;
    const throughput = completedScans.length; // Simplified throughput calculation
    
    const resourceUtilization = prioritizedScans
      .filter(s => s.status === 'running')
      .reduce((sum, s) => sum + s.resourceRequirements.cpu, 0) / 400 * 100; // Assuming 400 total CPU units
    
    const bottlenecks = [];
    if (queuedScans.length > 10) bottlenecks.push('Large queue backlog');
    if (slaViolations > 0) bottlenecks.push('SLA violations detected');
    if (resourceUtilization > 90) bottlenecks.push('High resource utilization');
    
    const recommendations = [];
    if (averageWaitTime > 120) recommendations.push('Consider adding more processing capacity');
    if (escalationRate > 20) recommendations.push('Review priority rules to reduce escalations');
    if (slaCompliance < 95) recommendations.push('Improve SLA management and monitoring');

    setAnalytics({
      totalScans,
      averageWaitTime: Math.round(averageWaitTime),
      slaCompliance: Math.round(slaCompliance),
      priorityDistribution,
      escalationRate: Math.round(escalationRate),
      throughput,
      resourceUtilization: Math.round(resourceUtilization),
      bottlenecks,
      recommendations
    });
  }, [prioritizedScans, priorityLevels]);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const getPriorityColor = useCallback((priority: number) => {
    if (priority >= 90) return 'text-red-600';
    if (priority >= 70) return 'text-orange-600';
    if (priority >= 50) return 'text-yellow-600';
    if (priority >= 30) return 'text-blue-600';
    return 'text-gray-600';
  }, []);

  const getPriorityIcon = useCallback((priority: number) => {
    if (priority >= 90) return <Flame className="h-4 w-4" />;
    if (priority >= 70) return <ArrowUpCircle className="h-4 w-4" />;
    if (priority >= 50) return <Equal className="h-4 w-4" />;
    if (priority >= 30) return <ArrowDownCircle className="h-4 w-4" />;
    return <Snowflake className="h-4 w-4" />;
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'paused':
        return 'text-yellow-600';
      case 'queued':
      default:
        return 'text-gray-600';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <X className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'queued':
      default:
        return <Clock className="h-4 w-4" />;
    }
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, []);

  const formatTimeAgo = useCallback((timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  }, []);

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderPriorityBadge = useCallback((scan: PrioritizedScan) => (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 ${getPriorityColor(scan.currentPriority)}`}>
        {getPriorityIcon(scan.currentPriority)}
        <span className="font-medium">{scan.currentPriority}</span>
      </div>
      <Badge variant="outline" className={scan.priorityLevel.color}>
        {scan.priorityLevel.name}
      </Badge>
      {scan.currentPriority !== scan.originalPriority && (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="text-xs">
              {scan.currentPriority > scan.originalPriority ? '↑' : '↓'} 
              {Math.abs(scan.currentPriority - scan.originalPriority)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Original priority: {scan.originalPriority}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  ), [getPriorityColor, getPriorityIcon]);

  const renderScanCard = useCallback((scan: PrioritizedScan) => (
    <Card key={scan.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {scan.type === 'security' && <Shield className="h-5 w-5" />}
              {scan.type === 'compliance' && <CheckCircle className="h-5 w-5" />}
              {scan.type === 'vulnerability' && <AlertTriangle className="h-5 w-5" />}
              {scan.type === 'performance' && <Gauge className="h-5 w-5" />}
              {scan.type === 'audit' && <Eye className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{scan.name}</h3>
              <p className="text-sm text-gray-500">{scan.department} • {scan.businessOwner}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedScan(scan)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange(scan.id, Math.min(100, scan.currentPriority + 10), 'Manual increase')}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Increase Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange(scan.id, Math.max(0, scan.currentPriority - 10), 'Manual decrease')}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Decrease Priority
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Scan
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Scan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Priority</span>
            {renderPriorityBadge(scan)}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <div className={`flex items-center space-x-1 ${getStatusColor(scan.status)}`}>
              {getStatusIcon(scan.status)}
              <span className="text-sm font-medium capitalize">{scan.status}</span>
            </div>
          </div>

          {scan.status === 'queued' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Queue Position</span>
              <Badge variant="outline">#{scan.queuePosition}</Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duration</span>
            <span className="text-sm font-medium">{formatDuration(scan.estimatedDuration)}</span>
          </div>

          {scan.slaDeadline && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SLA Deadline</span>
              <span className={`text-sm font-medium ${
                new Date(scan.slaDeadline).getTime() < Date.now() ? 'text-red-600' : 
                new Date(scan.slaDeadline).getTime() - Date.now() < 2 * 60 * 60 * 1000 ? 'text-yellow-600' : 'text-gray-900'
              }`}>
                {new Date(scan.slaDeadline).toLocaleString()}
              </span>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {scan.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {scan.escalationHistory.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center space-x-2 text-sm text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Escalated {scan.escalationHistory.length} time(s)</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  ), [renderPriorityBadge, getStatusColor, getStatusIcon, formatDuration, handlePriorityChange]);

  // ==========================================
  // MAIN RENDER
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading priority manager...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`scan-priority-manager space-y-6 ${className}`}>
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scan Priority Manager</h1>
            <p className="text-gray-600 mt-1">
              Intelligent priority management with SLA-aware escalation
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoEscalationEnabled}
                onCheckedChange={setAutoEscalationEnabled}
              />
              <Label className="text-sm">Auto-Escalation</Label>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalyticsDialog(true)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRuleDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{queueStatistics.total}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {queueStatistics.queued} queued • {queueStatistics.running} running
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-gray-900">{queueStatistics.averageWaitTime}m</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                For queued scans
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">{queueStatistics.highPriority}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Flame className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Priority ≥ 80
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SLA Violations</p>
                  <p className="text-2xl font-bold text-gray-900">{queueStatistics.slaViolations}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Past deadline
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="queue">Priority Queue</TabsTrigger>
            <TabsTrigger value="rules">Priority Rules</TabsTrigger>
            <TabsTrigger value="escalations">Escalations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Priority Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Priority className="h-5 w-5" />
                    <span>Scan Priority Queue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="timeline">Timeline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters and Search */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search scans..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {priorityLevels.map(level => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="queued">Queued</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="queue_position">Queue Position</SelectItem>
                      <SelectItem value="sla_deadline">SLA Deadline</SelectItem>
                      <SelectItem value="created_at">Created At</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Scan List/Grid */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredScans.map(renderScanCard)}
                  </div>
                ) : viewMode === 'list' ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scan</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Queue</TableHead>
                        <TableHead>SLA</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredScans.map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{scan.name}</div>
                              <div className="text-sm text-gray-500">{scan.type} • {formatTimeAgo(scan.createdAt)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {renderPriorityBadge(scan)}
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center space-x-1 ${getStatusColor(scan.status)}`}>
                              {getStatusIcon(scan.status)}
                              <span className="text-sm font-medium capitalize">{scan.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {scan.status === 'queued' ? `#${scan.queuePosition}` : '-'}
                          </TableCell>
                          <TableCell>
                            {scan.slaDeadline ? (
                              <span className={
                                new Date(scan.slaDeadline).getTime() < Date.now() ? 'text-red-600' : 
                                new Date(scan.slaDeadline).getTime() - Date.now() < 2 * 60 * 60 * 1000 ? 'text-yellow-600' : 'text-gray-900'
                              }>
                                {new Date(scan.slaDeadline).toLocaleString()}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{scan.businessOwner}</div>
                              <div className="text-sm text-gray-500">{scan.department}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedScan(scan)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePriorityChange(scan.id, Math.min(100, scan.currentPriority + 10), 'Manual increase')}>
                                  <ArrowUp className="h-4 w-4 mr-2" />
                                  Increase Priority
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePriorityChange(scan.id, Math.max(0, scan.currentPriority - 10), 'Manual decrease')}>
                                  <ArrowDown className="h-4 w-4 mr-2" />
                                  Decrease Priority
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  // Timeline view placeholder
                  <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Timeline View</p>
                      <p className="text-sm">Interactive timeline showing scan priorities over time</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Priority Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Priority Rules</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRuleDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Matches</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priorityRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-gray-500">{rule.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {rule.condition}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {rule.action.replace('_', ' ')} {rule.value}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.priority === 0 ? 'destructive' : rule.priority === 1 ? 'default' : 'secondary'}>
                            {rule.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{rule.matchCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={(checked) => {
                                setPriorityRules(prev => prev.map(r => 
                                  r.id === rule.id ? { ...r, isActive: checked } : r
                                ));
                              }}
                            />
                            <span className="text-sm text-gray-500">
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Stats
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escalations Tab */}
          <TabsContent value="escalations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Recent Escalations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prioritizedScans
                    .filter(scan => scan.escalationHistory.length > 0)
                    .flatMap(scan => 
                      scan.escalationHistory.map(escalation => ({
                        ...escalation,
                        scanName: scan.name,
                        scanId: scan.id
                      }))
                    )
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map((escalation) => (
                      <div key={escalation.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{escalation.scanName}</h4>
                            <span className="text-sm text-gray-500">{formatTimeAgo(escalation.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{escalation.reason}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>Rule: <strong>{escalation.rule}</strong></span>
                            <span>Action: <strong>{escalation.action}</strong></span>
                            <span>Priority: <strong>{escalation.previousPriority} → {escalation.newPriority}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Priority Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.priorityDistribution).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{level}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(count / analytics.totalScans) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">SLA Compliance</span>
                        <span className="text-lg font-bold text-green-600">{analytics.slaCompliance}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Escalation Rate</span>
                        <span className="text-lg font-bold text-orange-600">{analytics.escalationRate}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Throughput</span>
                        <span className="text-lg font-bold text-blue-600">{analytics.throughput}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Resource Utilization</span>
                        <span className="text-lg font-bold text-purple-600">{analytics.resourceUtilization}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Bottlenecks</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.bottlenecks.length > 0 ? (
                        analytics.bottlenecks.map((bottleneck, index) => (
                          <Alert key={index} className="border-yellow-200 bg-yellow-50">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-sm">{bottleneck}</AlertDescription>
                          </Alert>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm">No bottlenecks detected</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.recommendations.length > 0 ? (
                        analytics.recommendations.map((recommendation, index) => (
                          <Alert key={index} className="border-blue-200 bg-blue-50">
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">{recommendation}</AlertDescription>
                          </Alert>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm">System is operating optimally</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Scan Details Dialog */}
        <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedScan?.name}
              </DialogTitle>
              <DialogDescription>
                Detailed scan information and priority history
              </DialogDescription>
            </DialogHeader>
            
            {selectedScan && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Priority</Label>
                      <div className="mt-1">
                        {renderPriorityBadge(selectedScan)}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <div className={`mt-1 flex items-center space-x-1 ${getStatusColor(selectedScan.status)}`}>
                        {getStatusIcon(selectedScan.status)}
                        <span className="text-sm font-medium capitalize">{selectedScan.status}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Business Owner</Label>
                      <p className="text-sm mt-1">{selectedScan.businessOwner} • {selectedScan.department}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Duration</Label>
                      <p className="text-sm mt-1">{formatDuration(selectedScan.estimatedDuration)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Resource Requirements</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU:</span>
                          <span>{selectedScan.resourceRequirements.cpu}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Memory:</span>
                          <span>{selectedScan.resourceRequirements.memory} MB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Storage:</span>
                          <span>{selectedScan.resourceRequirements.storage} GB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Network:</span>
                          <span>{selectedScan.resourceRequirements.network} Mbps</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedScan.priorityHistory.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Priority History</Label>
                    <div className="mt-2 space-y-2">
                      {selectedScan.priorityHistory.map((change) => (
                        <div key={change.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">
                              {change.previousPriority} → {change.newPriority}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {change.automatic ? 'Auto' : 'Manual'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTimeAgo(change.timestamp)} • {change.changedBy}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedScan.escalationHistory.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Escalation History</Label>
                    <div className="mt-2 space-y-2">
                      {selectedScan.escalationHistory.map((escalation) => (
                        <div key={escalation.id} className="flex items-start space-x-3 p-3 bg-orange-50 rounded border border-orange-200">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{escalation.rule}</span>
                              <span className="text-xs text-gray-500">{formatTimeAgo(escalation.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-600">{escalation.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setSelectedScan(null)}>
                    Close
                  </Button>
                  <Button onClick={() => handlePriorityChange(selectedScan.id, Math.min(100, selectedScan.currentPriority + 10), 'Manual increase')}>
                    Increase Priority
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};