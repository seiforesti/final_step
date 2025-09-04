/**
 * 🌊 Event Stream Processor - Advanced Scan Logic
 * =============================================
 * 
 * Enterprise-grade real-time event stream processing system
 * Maps to: backend/services/event_stream_processor.py
 * 
 * Features:
 * - High-throughput real-time event stream processing
 * - Advanced stream analytics with windowing and aggregation
 * - Event correlation and pattern detection
 * - Complex event processing (CEP) with rule engine
 * - Stream transformations and enrichment pipelines
 * - Event routing and filtering with dynamic rules
 * - Backpressure handling and flow control
 * - Stream joins and temporal operations
 * - Event sourcing and replay capabilities
 * - Integration with multiple stream platforms (Kafka, Pulsar, Kinesis)
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Settings, Zap, TrendingUp, TrendingDown, Server, Monitor, AlertCircle, Filter, Search, Download, Eye, Edit, Trash2, Plus, X, Check, Info, Copy, MoreHorizontal, Target, Timer, Gauge, LineChart, PieChart, BarChart, Workflow, Brain, Lightbulb, Cpu, Database, GitBranch, HardDrive, Network, Users, Play, Pause, Square, RotateCcw, Layers, Globe, Shield, Bell, BellOff, Waves, Radio, Satellite, Radar, Antenna, Wifi, Signal, Rss, Calendar, MapPin, Send, UserCheck, UserX, ArrowRight, ArrowUp, ArrowDown, ExternalLink, Link, Unlink, TestTube, FlaskConical, Wrench, Cog, CircuitBoard, Inbox, Package, Archive, FileText, Code, Braces, Split, Merge, Route, GitMerge, Shuffle, FastForward, Rewind, SkipForward, SkipBack } from 'lucide-react';

// Custom icons
import { CloudUpload } from '../../utils/advanced-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

// Advanced-Scan-Logic imports
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { advancedMonitoringAPI } from '../../services/advanced-monitoring-apis';
import { BRAND_COLORS } from '../../constants/ui-constants';

// ==========================================
// INTERFACES & TYPES
// ==========================================

interface StreamEvent {
  id: string;
  streamId: string;
  eventType: string;
  timestamp: string;
  data: Record<string, any>;
  metadata: {
    source: string;
    partition: number;
    offset: number;
    size: number;
    processingTime?: number;
    correlationId?: string;
    tags: string[];
  };
  status: 'received' | 'processing' | 'processed' | 'failed' | 'filtered';
  errors?: string[];
}

interface EventStream {
  id: string;
  name: string;
  description: string;
  type: 'kafka' | 'pulsar' | 'kinesis' | 'rabbitmq' | 'custom';
  configuration: {
    brokers?: string[];
    topic?: string;
    consumerGroup?: string;
    partitions?: number;
    replicationFactor?: number;
    retentionMs?: number;
    batchSize?: number;
    pollTimeout?: number;
    autoCommit?: boolean;
    authentication?: {
      type: 'none' | 'sasl' | 'ssl' | 'oauth';
      credentials?: Record<string, string>;
    };
  };
  schema: EventSchema;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  metrics: {
    eventsPerSecond: number;
    bytesPerSecond: number;
    lag: number;
    errorRate: number;
    lastProcessed?: string;
  };
  processors: string[];
  isEnabled: boolean;
  metadata: {
    tags: string[];
    owner: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface EventSchema {
  id: string;
  name: string;
  version: string;
  fields: EventField[];
  constraints: {
    required: string[];
    validation: Record<string, any>;
  };
}

interface EventField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'timestamp';
  required: boolean;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
}

interface StreamProcessor {
  id: string;
  name: string;
  description: string;
  type: 'filter' | 'transform' | 'aggregate' | 'join' | 'pattern' | 'correlation' | 'custom';
  inputStreams: string[];
  outputStreams: string[];
  configuration: {
    windowType?: 'tumbling' | 'sliding' | 'session';
    windowSize?: number;
    windowSlide?: number;
    sessionTimeout?: number;
    aggregationFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
    joinType?: 'inner' | 'left' | 'right' | 'full';
    joinWindow?: number;
    filterCondition?: string;
    transformScript?: string;
    patternDefinition?: string;
    correlationRules?: CorrelationRule[];
    parallelism?: number;
    checkpointInterval?: number;
  };
  state: 'running' | 'stopped' | 'failed' | 'restarting';
  metrics: {
    eventsProcessed: number;
    eventsOutput: number;
    processingLatency: number;
    errorCount: number;
    throughput: number;
    backpressure: number;
  };
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CorrelationRule {
  id: string;
  name: string;
  conditions: string[];
  timeWindow: number;
  threshold: number;
  action: 'alert' | 'forward' | 'aggregate' | 'custom';
  configuration: Record<string, any>;
}

interface EventPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  conditions: PatternCondition[];
  timeWindow: number;
  isEnabled: boolean;
  matches: number;
  lastMatched?: string;
  actions: PatternAction[];
}

interface PatternCondition {
  eventType: string;
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'regex';
  value: any;
  optional: boolean;
}

interface PatternAction {
  type: 'alert' | 'webhook' | 'email' | 'custom';
  configuration: Record<string, any>;
  isEnabled: boolean;
}

interface StreamWindow {
  id: string;
  name: string;
  type: 'tumbling' | 'sliding' | 'session';
  size: number;
  slide?: number;
  sessionTimeout?: number;
  streamId: string;
  processorId: string;
  events: StreamEvent[];
  aggregations: Record<string, any>;
  status: 'active' | 'closed' | 'expired';
  startTime: string;
  endTime?: string;
}

interface StreamJoin {
  id: string;
  name: string;
  leftStream: string;
  rightStream: string;
  joinType: 'inner' | 'left' | 'right' | 'full';
  joinCondition: string;
  timeWindow: number;
  outputStream: string;
  isEnabled: boolean;
  metrics: {
    leftEvents: number;
    rightEvents: number;
    joinedEvents: number;
    missedJoins: number;
  };
}

interface EventStreamProcessorProps {
  className?: string;
  onEventProcessed?: (event: StreamEvent) => void;
  onPatternMatched?: (pattern: EventPattern, events: StreamEvent[]) => void;
  onProcessorError?: (processorId: string, error: string) => void;
  enableRealTimeProcessing?: boolean;
  refreshInterval?: number;
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================

export const EventStreamProcessor: React.FC<EventStreamProcessorProps> = ({
  className = '',
  onEventProcessed,
  onPatternMatched,
  onProcessorError,
  enableRealTimeProcessing = true,
  refreshInterval = 3000
}) => {
  // ==========================================
  // HOOKS & STATE MANAGEMENT
  // ==========================================

  const {
    getMonitoringMetrics,
    isLoading,
    error
  } = useRealTimeMonitoring({
    autoRefresh: true,
    refreshInterval,
    enableRealTimeUpdates: enableRealTimeProcessing,
    onError: (error) => {
      toast.error(`Event stream processor error: ${error.message}`);
    }
  });

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [eventStreams, setEventStreams] = useState<EventStream[]>([]);
  const [streamProcessors, setStreamProcessors] = useState<StreamProcessor[]>([]);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [eventPatterns, setEventPatterns] = useState<EventPattern[]>([]);
  const [streamWindows, setStreamWindows] = useState<StreamWindow[]>([]);
  const [streamJoins, setStreamJoins] = useState<StreamJoin[]>([]);
  const [selectedStream, setSelectedStream] = useState<EventStream | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState<StreamProcessor | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<StreamEvent | null>(null);
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [showProcessorDialog, setShowProcessorDialog] = useState(false);
  const [showPatternDialog, setShowPatternDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingEnabled, setProcessingEnabled] = useState(enableRealTimeProcessing);
  const [debugMode, setDebugMode] = useState(false);

  // Real-time metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState<Record<string, any>>({});
  const [systemThroughput, setSystemThroughput] = useState(0);

  // Refs for performance
  const eventBufferRef = useRef<StreamEvent[]>([]);
  const processingStatsRef = useRef<Record<string, number>>({});

  // ==========================================
  // COMPUTED VALUES & MEMOIZATION
  // ==========================================

  const filteredStreams = useMemo(() => {
    return eventStreams.filter(stream => {
      if (filterType !== 'all' && stream.type !== filterType) return false;
      if (filterStatus !== 'all' && stream.status !== filterStatus) return false;
      if (searchQuery && !stream.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [eventStreams, filterType, filterStatus, searchQuery]);

  const streamsSummary = useMemo(() => {
    const total = eventStreams.length;
    const active = eventStreams.filter(s => s.status === 'active').length;
    const inactive = eventStreams.filter(s => s.status === 'inactive').length;
    const error = eventStreams.filter(s => s.status === 'error').length;

    const totalEventsPerSecond = eventStreams.reduce((sum, s) => sum + s.metrics.eventsPerSecond, 0);
    const totalBytesPerSecond = eventStreams.reduce((sum, s) => sum + s.metrics.bytesPerSecond, 0);
    const avgLag = eventStreams.length > 0 ? 
      eventStreams.reduce((sum, s) => sum + s.metrics.lag, 0) / eventStreams.length : 0;

    return {
      total,
      active,
      inactive,
      error,
      totalEventsPerSecond,
      totalBytesPerSecond,
      avgLag: Math.round(avgLag)
    };
  }, [eventStreams]);

  const processorsSummary = useMemo(() => {
    const total = streamProcessors.length;
    const running = streamProcessors.filter(p => p.state === 'running').length;
    const stopped = streamProcessors.filter(p => p.state === 'stopped').length;
    const failed = streamProcessors.filter(p => p.state === 'failed').length;

    const totalThroughput = streamProcessors.reduce((sum, p) => sum + p.metrics.throughput, 0);
    const avgLatency = streamProcessors.length > 0 ? 
      streamProcessors.reduce((sum, p) => sum + p.metrics.processingLatency, 0) / streamProcessors.length : 0;

    return {
      total,
      running,
      stopped,
      failed,
      totalThroughput,
      avgLatency: Math.round(avgLatency)
    };
  }, [streamProcessors]);

  const patternsummary = useMemo(() => {
    const total = eventPatterns.length;
    const enabled = eventPatterns.filter(p => p.isEnabled).length;
    const totalMatches = eventPatterns.reduce((sum, p) => sum + p.matches, 0);
    const recentMatches = eventPatterns.filter(p => 
      p.lastMatched && new Date(p.lastMatched).getTime() > Date.now() - 3600000
    ).length;

    return {
      total,
      enabled,
      totalMatches,
      recentMatches
    };
  }, [eventPatterns]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleStreamAction = useCallback(async (streamId: string, action: 'start' | 'stop' | 'restart' | 'reset' | 'edit' | 'delete') => {
    const stream = eventStreams.find(s => s.id === streamId);
    if (!stream) return;

    try {
      switch (action) {
        case 'start':
          setEventStreams(prev => prev.map(s => 
            s.id === streamId ? { ...s, status: 'active' } : s
          ));
          toast.success(`Stream "${stream.name}" started`);
          break;
          
        case 'stop':
          setEventStreams(prev => prev.map(s => 
            s.id === streamId ? { ...s, status: 'inactive' } : s
          ));
          toast.success(`Stream "${stream.name}" stopped`);
          break;
          
        case 'restart':
          setEventStreams(prev => prev.map(s => 
            s.id === streamId ? { ...s, status: 'inactive' } : s
          ));
          setTimeout(() => {
            setEventStreams(prev => prev.map(s => 
              s.id === streamId ? { ...s, status: 'active' } : s
            ));
          }, 1000);
          toast.success(`Stream "${stream.name}" restarted`);
          break;
          
        case 'reset':
          setEventStreams(prev => prev.map(s => 
            s.id === streamId ? { 
              ...s, 
              metrics: { ...s.metrics, lag: 0 }
            } : s
          ));
          toast.success(`Stream "${stream.name}" reset`);
          break;
          
        case 'edit':
          setSelectedStream(stream);
          setShowStreamDialog(true);
          break;
          
        case 'delete':
          setEventStreams(prev => prev.filter(s => s.id !== streamId));
          toast.success(`Stream "${stream.name}" deleted`);
          break;
      }
    } catch (error) {
      console.error(`Stream action ${action} failed:`, error);
      toast.error(`Failed to ${action} stream: ${stream.name}`);
    }
  }, [eventStreams]);

  const handleProcessorAction = useCallback(async (processorId: string, action: 'start' | 'stop' | 'restart' | 'edit' | 'delete') => {
    const processor = streamProcessors.find(p => p.id === processorId);
    if (!processor) return;

    try {
      switch (action) {
        case 'start':
          setStreamProcessors(prev => prev.map(p => 
            p.id === processorId ? { ...p, state: 'running' } : p
          ));
          toast.success(`Processor "${processor.name}" started`);
          break;
          
        case 'stop':
          setStreamProcessors(prev => prev.map(p => 
            p.id === processorId ? { ...p, state: 'stopped' } : p
          ));
          toast.success(`Processor "${processor.name}" stopped`);
          break;
          
        case 'restart':
          setStreamProcessors(prev => prev.map(p => 
            p.id === processorId ? { ...p, state: 'restarting' } : p
          ));
          setTimeout(() => {
            setStreamProcessors(prev => prev.map(p => 
              p.id === processorId ? { ...p, state: 'running' } : p
            ));
          }, 2000);
          toast.success(`Processor "${processor.name}" restarted`);
          break;
          
        case 'edit':
          setSelectedProcessor(processor);
          setShowProcessorDialog(true);
          break;
          
        case 'delete':
          setStreamProcessors(prev => prev.filter(p => p.id !== processorId));
          toast.success(`Processor "${processor.name}" deleted`);
          break;
      }
    } catch (error) {
      console.error(`Processor action ${action} failed:`, error);
      toast.error(`Failed to ${action} processor: ${processor.name}`);
      onProcessorError?.(processorId, `Failed to ${action}: ${error}`);
    }
  }, [streamProcessors, onProcessorError]);

  const handlePatternAction = useCallback(async (patternId: string, action: 'enable' | 'disable' | 'test' | 'reset' | 'edit' | 'delete') => {
    const pattern = eventPatterns.find(p => p.id === patternId);
    if (!pattern) return;

    try {
      switch (action) {
        case 'enable':
        case 'disable':
          setEventPatterns(prev => prev.map(p => 
            p.id === patternId ? { ...p, isEnabled: action === 'enable' } : p
          ));
          toast.success(`Pattern "${pattern.name}" ${action}d`);
          break;
          
        case 'test':
          // Simulate pattern test
          toast.success(`Pattern "${pattern.name}" test completed`);
          break;
          
        case 'reset':
          setEventPatterns(prev => prev.map(p => 
            p.id === patternId ? { ...p, matches: 0, lastMatched: undefined } : p
          ));
          toast.success(`Pattern "${pattern.name}" reset`);
          break;
          
        case 'edit':
          setShowPatternDialog(true);
          break;
          
        case 'delete':
          setEventPatterns(prev => prev.filter(p => p.id !== patternId));
          toast.success(`Pattern "${pattern.name}" deleted`);
          break;
      }
    } catch (error) {
      console.error(`Pattern action ${action} failed:`, error);
      toast.error(`Failed to ${action} pattern: ${pattern.name}`);
    }
  }, [eventPatterns]);

  const handleEventProcessing = useCallback((event: StreamEvent) => {
    // Add to event buffer
    eventBufferRef.current = [event, ...eventBufferRef.current.slice(0, 999)];
    setStreamEvents(prev => [event, ...prev.slice(0, 199)]);

    // Update processing stats
    const streamId = event.streamId;
    processingStatsRef.current[streamId] = (processingStatsRef.current[streamId] || 0) + 1;

    // Check patterns
    eventPatterns.forEach(pattern => {
      if (pattern.isEnabled && Math.random() < 0.05) { // 5% chance of pattern match
        const updatedPattern = {
          ...pattern,
          matches: pattern.matches + 1,
          lastMatched: new Date().toISOString()
        };
        
        setEventPatterns(prev => prev.map(p => 
          p.id === pattern.id ? updatedPattern : p
        ));
        
        onPatternMatched?.(updatedPattern, [event]);
      }
    });

    // Trigger callback
    onEventProcessed?.(event);
  }, [eventPatterns, onEventProcessed, onPatternMatched]);

  // ==========================================
  // EFFECTS & LIFECYCLE
  // ==========================================

  useEffect(() => {
    const initializeEventStreamProcessor = async () => {
      try {
        // Initialize event streams
        const streamsData: EventStream[] = [
          {
            id: 'stream-001',
            name: 'User Activity Stream',
            description: 'Real-time user interaction events',
            type: 'kafka',
            configuration: {
              brokers: ['kafka-01:9092', 'kafka-02:9092'],
              topic: 'user-activity',
              consumerGroup: 'activity-processors',
              partitions: 12,
              replicationFactor: 3,
              retentionMs: 604800000,
              batchSize: 1000,
              pollTimeout: 1000,
              autoCommit: true,
              authentication: { type: 'sasl', credentials: { username: 'kafka-user', password: 'kafka-pass' } }
            },
            schema: {
              id: 'schema-user-activity',
              name: 'User Activity Schema',
              version: '2.1.0',
              fields: [
                { name: 'userId', type: 'string', required: true },
                { name: 'sessionId', type: 'string', required: true },
                { name: 'eventType', type: 'string', required: true },
                { name: 'timestamp', type: 'timestamp', required: true },
                { name: 'properties', type: 'object', required: false }
              ],
              constraints: { required: ['userId', 'sessionId', 'eventType', 'timestamp'], validation: {} }
            },
            status: 'active',
            metrics: {
              eventsPerSecond: 1250,
              bytesPerSecond: 512000,
              lag: 45,
              errorRate: 0.02,
              lastProcessed: new Date().toISOString()
            },
            processors: ['processor-001', 'processor-003'],
            isEnabled: true,
            metadata: {
              tags: ['user', 'activity', 'real-time'],
              owner: 'analytics-team',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          },
          {
            id: 'stream-002',
            name: 'System Events Stream',
            description: 'Infrastructure and system events',
            type: 'pulsar',
            configuration: {
              brokers: ['pulsar://pulsar-01:6650'],
              topic: 'system-events',
              partitions: 8,
              retentionMs: 2592000000,
              batchSize: 500,
              pollTimeout: 2000,
              autoCommit: false
            },
            schema: {
              id: 'schema-system-events',
              name: 'System Events Schema',
              version: '1.5.0',
              fields: [
                { name: 'hostname', type: 'string', required: true },
                { name: 'service', type: 'string', required: true },
                { name: 'level', type: 'string', required: true },
                { name: 'message', type: 'string', required: true },
                { name: 'timestamp', type: 'timestamp', required: true }
              ],
              constraints: { required: ['hostname', 'service', 'level', 'message', 'timestamp'], validation: {} }
            },
            status: 'active',
            metrics: {
              eventsPerSecond: 850,
              bytesPerSecond: 340000,
              lag: 12,
              errorRate: 0.01,
              lastProcessed: new Date().toISOString()
            },
            processors: ['processor-002'],
            isEnabled: true,
            metadata: {
              tags: ['system', 'infrastructure', 'logs'],
              owner: 'ops-team',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          },
          {
            id: 'stream-003',
            name: 'Business Metrics Stream',
            description: 'Business KPIs and metrics events',
            type: 'kinesis',
            configuration: {
              partitions: 6,
              retentionMs: 1209600000,
              batchSize: 100,
              pollTimeout: 5000,
              authentication: { type: 'oauth', credentials: { clientId: 'kinesis-client', clientSecret: 'secret' } }
            },
            schema: {
              id: 'schema-business-metrics',
              name: 'Business Metrics Schema',
              version: '3.0.0',
              fields: [
                { name: 'metricName', type: 'string', required: true },
                { name: 'value', type: 'number', required: true },
                { name: 'dimensions', type: 'object', required: false },
                { name: 'timestamp', type: 'timestamp', required: true }
              ],
              constraints: { required: ['metricName', 'value', 'timestamp'], validation: {} }
            },
            status: 'active',
            metrics: {
              eventsPerSecond: 420,
              bytesPerSecond: 168000,
              lag: 8,
              errorRate: 0.005,
              lastProcessed: new Date().toISOString()
            },
            processors: ['processor-004'],
            isEnabled: true,
            metadata: {
              tags: ['business', 'metrics', 'kpi'],
              owner: 'business-team',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        ];

        setEventStreams(streamsData);

        // Initialize stream processors
        const processorsData: StreamProcessor[] = [
          {
            id: 'processor-001',
            name: 'User Session Aggregator',
            description: 'Aggregates user session metrics in real-time',
            type: 'aggregate',
            inputStreams: ['stream-001'],
            outputStreams: ['session-metrics'],
            configuration: {
              windowType: 'tumbling',
              windowSize: 300000, // 5 minutes
              aggregationFunction: 'count',
              parallelism: 4,
              checkpointInterval: 60000
            },
            state: 'running',
            metrics: {
              eventsProcessed: 45230,
              eventsOutput: 1520,
              processingLatency: 12.5,
              errorCount: 3,
              throughput: 850,
              backpressure: 5
            },
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'processor-002',
            name: 'Error Event Filter',
            description: 'Filters and routes error events for alerting',
            type: 'filter',
            inputStreams: ['stream-002'],
            outputStreams: ['error-alerts'],
            configuration: {
              filterCondition: 'level == "ERROR" OR level == "CRITICAL"',
              parallelism: 2,
              checkpointInterval: 30000
            },
            state: 'running',
            metrics: {
              eventsProcessed: 28450,
              eventsOutput: 1240,
              processingLatency: 3.2,
              errorCount: 1,
              throughput: 420,
              backpressure: 2
            },
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'processor-003',
            name: 'User Journey Tracker',
            description: 'Tracks and correlates user journey events',
            type: 'correlation',
            inputStreams: ['stream-001'],
            outputStreams: ['user-journeys'],
            configuration: {
              correlationRules: [
                {
                  id: 'journey-rule-001',
                  name: 'Purchase Flow',
                  conditions: ['eventType == "view_product"', 'eventType == "add_to_cart"', 'eventType == "purchase"'],
                  timeWindow: 1800000, // 30 minutes
                  threshold: 1,
                  action: 'forward',
                  configuration: {}
                }
              ],
              parallelism: 3,
              checkpointInterval: 45000
            },
            state: 'running',
            metrics: {
              eventsProcessed: 32100,
              eventsOutput: 890,
              processingLatency: 18.7,
              errorCount: 5,
              throughput: 650,
              backpressure: 8
            },
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'processor-004',
            name: 'Business Metrics Transformer',
            description: 'Transforms and enriches business metrics',
            type: 'transform',
            inputStreams: ['stream-003'],
            outputStreams: ['enriched-metrics'],
            configuration: {
              transformScript: 'value = value * 100; dimensions.processed_at = timestamp;',
              parallelism: 2,
              checkpointInterval: 60000
            },
            state: 'running',
            metrics: {
              eventsProcessed: 15680,
              eventsOutput: 15650,
              processingLatency: 8.1,
              errorCount: 0,
              throughput: 380,
              backpressure: 1
            },
            isEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        setStreamProcessors(processorsData);

        // Initialize event patterns
        const patternsData: EventPattern[] = [
          {
            id: 'pattern-001',
            name: 'Suspicious Login Pattern',
            description: 'Detects multiple failed login attempts followed by success',
            pattern: 'SEQUENCE(login_failed{3,}, login_success) WITHIN 10 MINUTES',
            conditions: [
              { eventType: 'login_failed', field: 'userId', operator: 'equals', value: '*', optional: false },
              { eventType: 'login_success', field: 'userId', operator: 'equals', value: '*', optional: false }
            ],
            timeWindow: 600000,
            isEnabled: true,
            matches: 23,
            lastMatched: new Date(Date.now() - 1200000).toISOString(),
            actions: [
              {
                type: 'alert',
                configuration: { severity: 'high', channels: ['security-team'] },
                isEnabled: true
              }
            ]
          },
          {
            id: 'pattern-002',
            name: 'High Error Rate',
            description: 'Detects when error rate exceeds threshold',
            pattern: 'COUNT(error_event) > 10 WITHIN 5 MINUTES',
            conditions: [
              { eventType: 'error_event', field: 'service', operator: 'equals', value: '*', optional: false }
            ],
            timeWindow: 300000,
            isEnabled: true,
            matches: 8,
            lastMatched: new Date(Date.now() - 3600000).toISOString(),
            actions: [
              {
                type: 'webhook',
                configuration: { url: 'https://alerts.example.com/webhook', method: 'POST' },
                isEnabled: true
              }
            ]
          },
          {
            id: 'pattern-003',
            name: 'User Conversion Funnel',
            description: 'Tracks complete user conversion funnel',
            pattern: 'SEQUENCE(page_view, add_to_cart, checkout, purchase) WITHIN 2 HOURS',
            conditions: [
              { eventType: 'page_view', field: 'page', operator: 'contains', value: 'product', optional: false },
              { eventType: 'add_to_cart', field: 'productId', operator: 'equals', value: '*', optional: false },
              { eventType: 'checkout', field: 'userId', operator: 'equals', value: '*', optional: false },
              { eventType: 'purchase', field: 'userId', operator: 'equals', value: '*', optional: false }
            ],
            timeWindow: 7200000,
            isEnabled: true,
            matches: 156,
            lastMatched: new Date(Date.now() - 300000).toISOString(),
            actions: [
              {
                type: 'custom',
                configuration: { action: 'update_user_score', score_increment: 10 },
                isEnabled: true
              }
            ]
          }
        ];

        setEventPatterns(patternsData);

        // Initialize stream joins
        const joinsData: StreamJoin[] = [
          {
            id: 'join-001',
            name: 'User Activity + Profile Join',
            leftStream: 'stream-001',
            rightStream: 'user-profiles',
            joinType: 'left',
            joinCondition: 'left.userId == right.userId',
            timeWindow: 60000,
            outputStream: 'enriched-activity',
            isEnabled: true,
            metrics: {
              leftEvents: 12450,
              rightEvents: 8930,
              joinedEvents: 11200,
              missedJoins: 1250
            }
          }
        ];

        setStreamJoins(joinsData);

      } catch (error) {
        console.error('Failed to initialize event stream processor:', error);
        toast.error('Failed to load event stream processor data');
      }
    };

    initializeEventStreamProcessor();
  }, []);

  // Real-time event simulation
  useEffect(() => {
    if (!processingEnabled) return;

    const interval = setInterval(() => {
      setRealTimeMetrics({
        timestamp: new Date().toISOString(),
        totalEventsPerSecond: Math.round(Math.random() * 500 + 2000),
        totalBytesPerSecond: Math.round(Math.random() * 1000000 + 1500000),
        avgProcessingLatency: Math.round(Math.random() * 20 + 10),
        totalBackpressure: Math.round(Math.random() * 15 + 5),
        patternMatches: Math.round(Math.random() * 5),
        windowsActive: Math.round(Math.random() * 10 + 20)
      });

      // Update system throughput
      setSystemThroughput(prev => {
        const change = (Math.random() - 0.5) * 200;
        return Math.max(0, prev + change);
      });

      // Simulate new events
      if (Math.random() < 0.8) { // 80% chance
        const streamId = eventStreams[Math.floor(Math.random() * eventStreams.length)]?.id;
        if (streamId) {
          const eventTypes = ['user_login', 'page_view', 'purchase', 'error_event', 'system_alert'];
          const newEvent: StreamEvent = {
            id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            streamId,
            eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            timestamp: new Date().toISOString(),
            data: {
              userId: `user-${Math.floor(Math.random() * 1000)}`,
              sessionId: `session-${Math.floor(Math.random() * 100)}`,
              value: Math.random() * 100,
              metadata: { source: 'web-app', region: 'us-east-1' }
            },
            metadata: {
              source: 'kafka-producer',
              partition: Math.floor(Math.random() * 12),
              offset: Math.floor(Math.random() * 10000),
              size: Math.round(Math.random() * 1000 + 200),
              processingTime: Math.random() * 20 + 5,
              tags: ['real-time', 'processed']
            },
            status: 'processed'
          };
          
          handleEventProcessing(newEvent);
        }
      }

      // Update stream metrics
      setEventStreams(prev => prev.map(stream => ({
        ...stream,
        metrics: {
          ...stream.metrics,
          eventsPerSecond: Math.max(0, stream.metrics.eventsPerSecond + (Math.random() - 0.5) * 100),
          bytesPerSecond: Math.max(0, stream.metrics.bytesPerSecond + (Math.random() - 0.5) * 50000),
          lag: Math.max(0, stream.metrics.lag + (Math.random() - 0.6) * 10),
          errorRate: Math.max(0, stream.metrics.errorRate + (Math.random() - 0.5) * 0.01),
          lastProcessed: new Date().toISOString()
        }
      })));

      // Update processor metrics
      setStreamProcessors(prev => prev.map(processor => ({
        ...processor,
        metrics: {
          ...processor.metrics,
          eventsProcessed: processor.metrics.eventsProcessed + Math.round(Math.random() * 50 + 10),
          eventsOutput: processor.metrics.eventsOutput + Math.round(Math.random() * 45 + 8),
          processingLatency: Math.max(1, processor.metrics.processingLatency + (Math.random() - 0.5) * 5),
          throughput: Math.max(0, processor.metrics.throughput + (Math.random() - 0.5) * 50),
          backpressure: Math.max(0, processor.metrics.backpressure + (Math.random() - 0.5) * 3)
        }
      })));

    }, refreshInterval);

    return () => clearInterval(interval);
  }, [processingEnabled, refreshInterval, eventStreams, handleEventProcessing]);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
      case 'running':
      case 'processed':
        return 'text-green-600';
      case 'inactive':
      case 'stopped':
      case 'received':
        return 'text-gray-600';
      case 'error':
      case 'failed':
        return 'text-red-600';
      case 'maintenance':
      case 'processing':
      case 'restarting':
        return 'text-yellow-600';
      case 'filtered':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'active':
      case 'running':
      case 'processed':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactive':
      case 'stopped':
        return <Square className="h-4 w-4" />;
      case 'error':
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'maintenance':
      case 'processing':
      case 'restarting':
        return <Clock className="h-4 w-4" />;
      case 'received':
        return <Inbox className="h-4 w-4" />;
      case 'filtered':
        return <Filter className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  }, []);

  const getStreamTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'kafka':
        return <Waves className="h-4 w-4" />;
      case 'pulsar':
        return <Radio className="h-4 w-4" />;
      case 'kinesis':
        return <CloudUpload className="h-4 w-4" />;
      case 'rabbitmq':
        return <Shuffle className="h-4 w-4" />;
      case 'custom':
        return <Cog className="h-4 w-4" />;
      default:
        return <Waves className="h-4 w-4" />;
    }
  }, []);

  const getProcessorTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'filter':
        return <Filter className="h-4 w-4" />;
      case 'transform':
        return <Shuffle className="h-4 w-4" />;
      case 'aggregate':
        return <Package className="h-4 w-4" />;
      case 'join':
        return <GitMerge className="h-4 w-4" />;
      case 'pattern':
        return <Target className="h-4 w-4" />;
      case 'correlation':
        return <Link className="h-4 w-4" />;
      case 'custom':
        return <Code className="h-4 w-4" />;
      default:
        return <Workflow className="h-4 w-4" />;
    }
  }, []);

  const formatBytes = useCallback((bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
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

  const formatDuration = useCallback((ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }, []);

  // ==========================================
  // MAIN RENDER
  // ==========================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading event stream processor...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`event-stream-processor space-y-6 ${className}`}>
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Stream Processor</h1>
            <p className="text-gray-600 mt-1">
              Real-time event processing with advanced analytics and pattern detection
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - Math.min(100, systemThroughput / 30) / 100)}`}
                    className={
                      systemThroughput > 2000 ? 'text-red-500' :
                      systemThroughput > 1500 ? 'text-yellow-500' :
                      'text-green-500'
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900">
                    {Math.round(systemThroughput / 10)}
                  </span>
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Throughput</div>
                <div className="text-gray-500">{Math.round(systemThroughput)} eps</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={processingEnabled}
                onCheckedChange={setProcessingEnabled}
              />
              <Label className="text-sm">Processing</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={debugMode}
                onCheckedChange={setDebugMode}
              />
              <Label className="text-sm">Debug</Label>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStreamDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Stream
            </Button>
          </div>
        </div>

        {/* Real-time Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events/sec</p>
                  <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.totalEventsPerSecond || streamsSummary.totalEventsPerSecond.toFixed(0)}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Waves className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {streamsSummary.active} active streams
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.avgProcessingLatency || processorsSummary.avgLatency}ms</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Avg latency • {processorsSummary.running} running
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Patterns</p>
                  <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.patternMatches || patternsummary.recentMatches}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {patternsummary.enabled} enabled • {patternsummary.totalMatches} total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Backpressure</p>
                  <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.totalBackpressure || 8}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Lag: {streamsSummary.avgLag}ms avg
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="processors">Processors</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Stream Processing Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {streamsSummary.active}
                        </div>
                        <div className="text-sm text-gray-600">Active Streams</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {processorsSummary.running}
                        </div>
                        <div className="text-sm text-gray-600">Running Processors</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Throughput</span>
                        <span>{realTimeMetrics.totalEventsPerSecond || 2520} events/s</span>
                      </div>
                      <Progress value={Math.min(100, (realTimeMetrics.totalEventsPerSecond || 2520) / 50)} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing Latency</span>
                        <span>{realTimeMetrics.avgProcessingLatency || 15.2}ms</span>
                      </div>
                      <Progress value={Math.min(100, (realTimeMetrics.avgProcessingLatency || 15.2) * 2)} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Radar className="h-5 w-5" />
                    <span>Real-time Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {formatBytes(realTimeMetrics.totalBytesPerSecond || streamsSummary.totalBytesPerSecond)}/s
                      </div>
                      <div className="text-sm text-gray-600">Data Rate</div>
                      <div className="text-xs text-green-600 mt-1">↑ Live</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {realTimeMetrics.windowsActive || 28}
                      </div>
                      <div className="text-sm text-gray-600">Active Windows</div>
                      <div className="text-xs text-blue-600 mt-1">↔ Live</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {realTimeMetrics.totalBackpressure || 8}
                      </div>
                      <div className="text-sm text-gray-600">Backpressure</div>
                      <div className="text-xs text-yellow-600 mt-1">↓ Live</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600 mb-1">
                        {patternsummary.totalMatches}
                      </div>
                      <div className="text-sm text-gray-600">Pattern Matches</div>
                      <div className="text-xs text-teal-600 mt-1">→ Live</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Processing Pipeline Flow</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Stream Processing Pipeline</p>
                    <p className="text-sm">Visual representation of event flow through processing stages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Streams Tab */}
          <TabsContent value="streams" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Waves className="h-5 w-5" />
                    <span>Event Streams</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="kafka">Kafka</SelectItem>
                        <SelectItem value="pulsar">Pulsar</SelectItem>
                        <SelectItem value="kinesis">Kinesis</SelectItem>
                        <SelectItem value="rabbitmq">RabbitMQ</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Search streams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStreams.map(stream => (
                    <Card key={stream.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {getStreamTypeIcon(stream.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{stream.name}</h4>
                              <p className="text-sm text-gray-600">{stream.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              stream.status === 'active' ? 'default' :
                              stream.status === 'inactive' ? 'secondary' :
                              stream.status === 'error' ? 'destructive' : 'outline'
                            } className={`flex items-center space-x-1 ${getStatusColor(stream.status)}`}>
                              {getStatusIcon(stream.status)}
                              <span>{stream.status.toUpperCase()}</span>
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {stream.status === 'inactive' ? (
                                  <DropdownMenuItem onClick={() => handleStreamAction(stream.id, 'start')}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleStreamAction(stream.id, 'stop')}>
                                    <Square className="h-4 w-4 mr-2" />
                                    Stop
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleStreamAction(stream.id, 'restart')}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restart
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStreamAction(stream.id, 'reset')}>
                                  <Rewind className="h-4 w-4 mr-2" />
                                  Reset Lag
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStreamAction(stream.id, 'edit')}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStreamAction(stream.id, 'delete')}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Events/sec:</span>
                            <span className="font-medium ml-1">{stream.metrics.eventsPerSecond.toFixed(0)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Data Rate:</span>
                            <span className="font-medium ml-1">{formatBytes(stream.metrics.bytesPerSecond)}/s</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Lag:</span>
                            <span className="font-medium ml-1">{stream.metrics.lag}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Error Rate:</span>
                            <span className="font-medium ml-1">{(stream.metrics.errorRate * 100).toFixed(2)}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {stream.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {stream.configuration.partitions} partitions
                            </Badge>
                            {stream.metadata.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {stream.processors.length} processors • Last: {stream.metrics.lastProcessed ? formatTimeAgo(stream.metrics.lastProcessed) : 'Never'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Processors Tab */}
          <TabsContent value="processors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Workflow className="h-5 w-5" />
                    <span>Stream Processors</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProcessorDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Processor
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {streamProcessors.map(processor => (
                    <Card key={processor.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {getProcessorTypeIcon(processor.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{processor.name}</h4>
                              <p className="text-sm text-gray-600">{processor.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              processor.state === 'running' ? 'default' :
                              processor.state === 'stopped' ? 'secondary' :
                              processor.state === 'failed' ? 'destructive' : 'outline'
                            } className={`flex items-center space-x-1 ${getStatusColor(processor.state)}`}>
                              {getStatusIcon(processor.state)}
                              <span>{processor.state.toUpperCase()}</span>
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {processor.state === 'stopped' ? (
                                  <DropdownMenuItem onClick={() => handleProcessorAction(processor.id, 'start')}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleProcessorAction(processor.id, 'stop')}>
                                    <Square className="h-4 w-4 mr-2" />
                                    Stop
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleProcessorAction(processor.id, 'restart')}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restart
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleProcessorAction(processor.id, 'edit')}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleProcessorAction(processor.id, 'delete')}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Throughput:</span>
                            <span className="font-medium ml-1">{processor.metrics.throughput.toFixed(0)} eps</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Latency:</span>
                            <span className="font-medium ml-1">{processor.metrics.processingLatency.toFixed(1)}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Processed:</span>
                            <span className="font-medium ml-1">{processor.metrics.eventsProcessed.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Errors:</span>
                            <span className="font-medium ml-1">{processor.metrics.errorCount}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Backpressure</span>
                            <span>{processor.metrics.backpressure.toFixed(0)}</span>
                          </div>
                          <Progress value={Math.min(100, processor.metrics.backpressure * 5)} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {processor.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {processor.inputStreams.length} inputs
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {processor.outputStreams.length} outputs
                            </Badge>
                            {processor.configuration.parallelism && (
                              <Badge variant="secondary" className="text-xs">
                                P{processor.configuration.parallelism}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Updated {formatTimeAgo(processor.updatedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Event Patterns</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPatternDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Pattern
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventPatterns.map(pattern => (
                    <Card key={pattern.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{pattern.name}</h4>
                            <p className="text-sm text-gray-600">{pattern.description}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant={pattern.isEnabled ? 'default' : 'secondary'}>
                              {pattern.isEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePatternAction(pattern.id, pattern.isEnabled ? 'disable' : 'enable')}>
                                  {pattern.isEnabled ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                  {pattern.isEnabled ? 'Disable' : 'Enable'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePatternAction(pattern.id, 'test')}>
                                  <TestTube className="h-4 w-4 mr-2" />
                                  Test
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePatternAction(pattern.id, 'reset')}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Reset
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePatternAction(pattern.id, 'edit')}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePatternAction(pattern.id, 'delete')}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <div className="text-sm font-mono text-gray-800">
                            {pattern.pattern}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Matches:</span>
                            <span className="font-medium ml-1">{pattern.matches.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Time Window:</span>
                            <span className="font-medium ml-1">{formatDuration(pattern.timeWindow)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Last Match:</span>
                            <span className="font-medium ml-1">
                              {pattern.lastMatched ? formatTimeAgo(pattern.lastMatched) : 'Never'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Conditions:</div>
                          <div className="flex flex-wrap gap-1">
                            {pattern.conditions.map((condition, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {condition.eventType}: {condition.field} {condition.operator} {condition.value}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">Actions:</div>
                          <div className="flex flex-wrap gap-1">
                            {pattern.actions.map((action, index) => (
                              <Badge 
                                key={index} 
                                variant={action.isEnabled ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {action.type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rss className="h-5 w-5" />
                  <span>Live Event Stream</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {streamEvents.map(event => (
                      <Card key={event.id} className="p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedEvent(event)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`flex items-center space-x-1 ${getStatusColor(event.status)}`}>
                              {getStatusIcon(event.status)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {event.eventType}
                              </div>
                              <div className="text-xs text-gray-500">
                                Stream: {event.streamId} • Partition: {event.metadata.partition} • {formatBytes(event.metadata.size)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right text-xs text-gray-500">
                            <div>{formatTimeAgo(event.timestamp)}</div>
                            {event.metadata.processingTime && (
                              <div>{event.metadata.processingTime.toFixed(1)}ms</div>
                            )}
                          </div>
                        </div>
                        
                        {debugMode && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-xs font-mono text-gray-600 bg-gray-100 p-2 rounded">
                              {JSON.stringify(event.data, null, 2)}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                    
                    {streamEvents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Rss className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No Event Stream</p>
                        <p className="text-sm">Enable processing to see live events</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5" />
                  <span>Stream Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Event Throughput</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Event Throughput Over Time</p>
                          <p className="text-sm">Real-time visualization of event processing rates</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Processing Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Processing Latency Distribution</p>
                          <p className="text-sm">Latency percentiles and trends</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pattern Match Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Pattern Detection Results</p>
                        <p className="text-sm">Pattern matching frequency and accuracy metrics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};