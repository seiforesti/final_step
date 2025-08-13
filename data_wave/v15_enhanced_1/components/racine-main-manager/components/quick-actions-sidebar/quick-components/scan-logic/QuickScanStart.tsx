'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert';
import {
  Play, Pause, StopCircle, Settings, Target, Zap, Brain, 
  Sparkles, Shield, Database, Table, FileText, Folder,
  Clock, Calendar, User, Users, Globe, Lock, Unlock,
  Eye, EyeOff, Search, Filter, RefreshCw, Download,
  Upload, Save, Copy, Edit, Trash, Plus, Minus, X,
  CheckCircle, AlertCircle, Info, HelpCircle, Star,
  Activity, TrendingUp, BarChart3, PieChart, Layers,
  Network, GitBranch, Route, Workflow, Component,
  Fingerprint, Radar, Crosshair, Focus, Scan, Bell
} from 'lucide-react';

import { useScanLogic } from '../../../hooks/useScanLogic';
import { useWorkspaceManagement } from '../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../hooks/useActivityTracking';
import { useDataSources } from '../../../hooks/useDataSources';
import { useScanRuleSets } from '../../../hooks/useScanRuleSets';

interface ScanConfiguration {
  name: string;
  description: string;
  targetType: 'workspace' | 'datasource' | 'table' | 'custom';
  targets: string[];
  ruleSetIds: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    datetime?: string;
    cron?: string;
  };
  options: {
    deepScan: boolean;
    includeMetadata: boolean;
    parallelProcessing: boolean;
    maxThreads: number;
    timeout: number;
    retryAttempts: number;
  };
  notifications: {
    onStart: boolean;
    onComplete: boolean;
    onError: boolean;
    recipients: string[];
  };
}

interface ScanTemplate {
  id: string;
  name: string;
  description: string;
  configuration: Partial<ScanConfiguration>;
  category: 'compliance' | 'security' | 'quality' | 'discovery';
  popularity: number;
}

interface QuickScanStartProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const QuickScanStart: React.FC<QuickScanStartProps> = ({
  isVisible, onClose, className = '',
}) => {
  // Core State Management
  const [activeTab, setActiveTab] = useState<string>('configure');
  const [scanConfig, setScanConfig] = useState<ScanConfiguration>({
    name: '',
    description: '',
    targetType: 'workspace',
    targets: [],
    ruleSetIds: [],
    priority: 'medium',
    schedule: { type: 'immediate' },
    options: {
      deepScan: false,
      includeMetadata: true,
      parallelProcessing: true,
      maxThreads: 4,
      timeout: 3600,
      retryAttempts: 3,
    },
    notifications: {
      onStart: true,
      onComplete: true,
      onError: true,
      recipients: [],
    },
  });

  // Advanced State
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [availableTemplates, setAvailableTemplates] = useState<ScanTemplate[]>([]);
  const [availableDataSources, setAvailableDataSources] = useState<any[]>([]);
  const [availableRuleSets, setAvailableRuleSets] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  // AI State
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // UI State
  const [isStarting, setIsStarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Hooks
  const { 
    startScan,
    validateScanConfig,
    getScanTemplates,
    getScanEstimate,
    saveScanTemplate,
    loading,
    error 
  } = useScanLogic();
  const { currentWorkspace, getWorkspaceDataSources } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { getScanConfigSuggestions, optimizeScanRules } = useAIAssistant();
  const { getCrossGroupScanTargets } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();
  const { getDataSources } = useDataSources();
  const { getRuleSets } = useScanRuleSets();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Core Logic Functions
  const loadInitialData = useCallback(async () => {
    try {
      const [templates, dataSources, ruleSets] = await Promise.all([
        getScanTemplates(),
        getDataSources(currentWorkspace?.id),
        getRuleSets(currentWorkspace?.id)
      ]);

      setAvailableTemplates(templates || []);
      setAvailableDataSources(dataSources || []);
      setAvailableRuleSets(ruleSets || []);

      // Set default recipients
      if (currentUser?.email) {
        setScanConfig(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            recipients: [currentUser.email]
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, [currentWorkspace, currentUser, getScanTemplates, getDataSources, getRuleSets]);

  const validateConfiguration = useCallback(async () => {
    setIsValidating(true);
    try {
      const validation = await validateScanConfig(scanConfig);
      setValidationErrors(validation.errors || []);
      
      if (validation.isValid) {
        const estimate = await getScanEstimate(scanConfig);
        setEstimatedDuration(estimate.duration || 0);
        setEstimatedCost(estimate.cost || 0);
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationErrors(['Configuration validation failed']);
    } finally {
      setIsValidating(false);
    }
  }, [scanConfig, validateScanConfig, getScanEstimate]);

  const getAISuggestionsHandler = useCallback(async () => {
    if (!scanConfig.targets.length) return;

    setIsAnalyzing(true);
    try {
      const suggestions = await getScanConfigSuggestions({
        targets: scanConfig.targets,
        targetType: scanConfig.targetType,
        workspaceId: currentWorkspace?.id
      });

      setAISuggestions(suggestions?.recommendations || []);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [scanConfig, currentWorkspace, getScanConfigSuggestions]);

  const handleStartScan = useCallback(async () => {
    setIsStarting(true);
    try {
      const result = await startScan(scanConfig);
      
      trackActivity({
        action: 'scan_started',
        component: 'QuickScanStart',
        metadata: {
          scanId: result.scanId,
          targets: scanConfig.targets.length,
          priority: scanConfig.priority
        },
      });

      // Show success and close
      onClose();
    } catch (error) {
      console.error('Failed to start scan:', error);
    } finally {
      setIsStarting(false);
    }
  }, [scanConfig, startScan, trackActivity, onClose]);

  const handleSaveTemplate = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveScanTemplate({
        name: `${scanConfig.name} Template`,
        description: scanConfig.description,
        configuration: scanConfig,
        category: 'custom'
      });

      trackActivity({
        action: 'scan_template_saved',
        component: 'QuickScanStart',
        metadata: { templateName: scanConfig.name },
      });
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSaving(false);
    }
  }, [scanConfig, saveScanTemplate, trackActivity]);

  const applyTemplate = useCallback((template: ScanTemplate) => {
    setScanConfig(prev => ({
      ...prev,
      ...template.configuration,
      name: template.name,
      description: template.description
    }));
    setSelectedTemplate(template.id);
  }, []);

  // Effects
  useEffect(() => {
    if (isVisible) {
      loadInitialData();
      trackActivity({
        action: 'quick_scan_start_opened',
        component: 'QuickScanStart',
        metadata: { workspace: currentWorkspace?.id },
      });
    }
  }, [isVisible, loadInitialData, trackActivity, currentWorkspace]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (scanConfig.targets.length > 0 && scanConfig.ruleSetIds.length > 0) {
        validateConfiguration();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [scanConfig, validateConfiguration]);

  // Render Functions
  const renderConfigureTab = () => (
    <div className="space-y-6">
      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Basic Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scan-name">Scan Name</Label>
              <Input
                id="scan-name"
                placeholder="Enter scan name"
                value={scanConfig.name}
                onChange={(e) => setScanConfig(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scan-description">Description</Label>
              <Textarea
                id="scan-description"
                placeholder="Describe the purpose of this scan"
                value={scanConfig.description}
                onChange={(e) => setScanConfig(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Type</Label>
                <Select 
                  value={scanConfig.targetType} 
                  onValueChange={(value: any) => setScanConfig(prev => ({ ...prev, targetType: value, targets: [] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workspace">Entire Workspace</SelectItem>
                    <SelectItem value="datasource">Data Sources</SelectItem>
                    <SelectItem value="table">Specific Tables</SelectItem>
                    <SelectItem value="custom">Custom Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={scanConfig.priority} 
                  onValueChange={(value: any) => setScanConfig(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Scan Targets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scanConfig.targetType === 'workspace' ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <p className="text-sm font-medium text-gray-900">Full Workspace Scan</p>
              <p className="text-xs text-gray-500 mt-1">All data sources and tables will be scanned</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Select Targets</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getAISuggestionsHandler}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4 mr-1" />
                  )}
                  AI Suggestions
                </Button>
              </div>

              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {scanConfig.targetType === 'datasource' && availableDataSources.map((ds) => (
                  <div key={ds.id} className="flex items-center space-x-2 p-3 border-b last:border-b-0">
                    <Checkbox
                      id={ds.id}
                      checked={scanConfig.targets.includes(ds.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setScanConfig(prev => ({
                            ...prev,
                            targets: [...prev.targets, ds.id]
                          }));
                        } else {
                          setScanConfig(prev => ({
                            ...prev,
                            targets: prev.targets.filter(t => t !== ds.id)
                          }));
                        }
                      }}
                    />
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <div>
                        <Label htmlFor={ds.id} className="text-sm font-medium">{ds.name}</Label>
                        <p className="text-xs text-gray-500">{ds.type} • {ds.tableCount} tables</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Set Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Scan Rules</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Select Rule Sets</Label>
              <Badge variant="outline">
                {scanConfig.ruleSetIds.length} selected
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {availableRuleSets.slice(0, 6).map((ruleSet) => (
                <div key={ruleSet.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={ruleSet.id}
                    checked={scanConfig.ruleSetIds.includes(ruleSet.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setScanConfig(prev => ({
                          ...prev,
                          ruleSetIds: [...prev.ruleSetIds, ruleSet.id]
                        }));
                      } else {
                        setScanConfig(prev => ({
                          ...prev,
                          ruleSetIds: prev.ruleSetIds.filter(id => id !== ruleSet.id)
                        }));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={ruleSet.id} className="text-sm font-medium">{ruleSet.name}</Label>
                      <Badge variant="outline" className="text-xs">
                        {ruleSet.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{ruleSet.description}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {ruleSet.ruleCount} rules
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'immediate', label: 'Run Now', icon: Play },
                { value: 'scheduled', label: 'Schedule', icon: Calendar },
                { value: 'recurring', label: 'Recurring', icon: RefreshCw },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={scanConfig.schedule.type === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScanConfig(prev => ({
                    ...prev,
                    schedule: { type: option.value as any }
                  }))}
                  className="justify-start"
                >
                  <option.icon className="h-4 w-4 mr-2" />
                  {option.label}
                </Button>
              ))}
            </div>

            {scanConfig.schedule.type === 'scheduled' && (
              <div className="space-y-2">
                <Label>Schedule Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={scanConfig.schedule.datetime || ''}
                  onChange={(e) => setScanConfig(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, datetime: e.target.value }
                  }))}
                />
              </div>
            )}

            {scanConfig.schedule.type === 'recurring' && (
              <div className="space-y-2">
                <Label>Cron Expression</Label>
                <Input
                  placeholder="0 0 * * * (daily at midnight)"
                  value={scanConfig.schedule.cron || ''}
                  onChange={(e) => setScanConfig(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, cron: e.target.value }
                  }))}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      {/* Performance Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Performance Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Deep Scan</Label>
              <p className="text-xs text-gray-500">Comprehensive analysis with detailed inspection</p>
            </div>
            <Switch
              checked={scanConfig.options.deepScan}
              onCheckedChange={(checked) => setScanConfig(prev => ({
                ...prev,
                options: { ...prev.options, deepScan: checked }
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Include Metadata</Label>
              <p className="text-xs text-gray-500">Scan table schemas and column metadata</p>
            </div>
            <Switch
              checked={scanConfig.options.includeMetadata}
              onCheckedChange={(checked) => setScanConfig(prev => ({
                ...prev,
                options: { ...prev.options, includeMetadata: checked }
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Parallel Processing</Label>
              <p className="text-xs text-gray-500">Use multiple threads for faster scanning</p>
            </div>
            <Switch
              checked={scanConfig.options.parallelProcessing}
              onCheckedChange={(checked) => setScanConfig(prev => ({
                ...prev,
                options: { ...prev.options, parallelProcessing: checked }
              }))}
            />
          </div>

          {scanConfig.options.parallelProcessing && (
            <div className="space-y-2">
              <Label className="text-sm">Max Threads: {scanConfig.options.maxThreads}</Label>
              <Slider
                value={[scanConfig.options.maxThreads]}
                onValueChange={(value) => setScanConfig(prev => ({
                  ...prev,
                  options: { ...prev.options, maxThreads: value[0] }
                }))}
                max={16}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Timeout (seconds)</Label>
              <Input
                type="number"
                value={scanConfig.options.timeout}
                onChange={(e) => setScanConfig(prev => ({
                  ...prev,
                  options: { ...prev.options, timeout: parseInt(e.target.value) || 3600 }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Retry Attempts</Label>
              <Input
                type="number"
                value={scanConfig.options.retryAttempts}
                onChange={(e) => setScanConfig(prev => ({
                  ...prev,
                  options: { ...prev.options, retryAttempts: parseInt(e.target.value) || 3 }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { key: 'onStart', label: 'Scan Started', desc: 'Notify when scan begins' },
              { key: 'onComplete', label: 'Scan Completed', desc: 'Notify when scan finishes' },
              { key: 'onError', label: 'Scan Failed', desc: 'Notify on scan errors' },
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{notification.label}</Label>
                  <p className="text-xs text-gray-500">{notification.desc}</p>
                </div>
                <Switch
                  checked={scanConfig.notifications[notification.key as keyof typeof scanConfig.notifications] as boolean}
                  onCheckedChange={(checked) => setScanConfig(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, [notification.key]: checked }
                  }))}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Recipients</Label>
            <Textarea
              placeholder="Enter email addresses (one per line)"
              value={scanConfig.notifications.recipients.join('\n')}
              onChange={(e) => setScanConfig(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  recipients: e.target.value.split('\n').filter(email => email.trim())
                }
              }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-6">
      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Scan Configuration Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-500">Name</Label>
              <p className="font-medium">{scanConfig.name || 'Untitled Scan'}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Priority</Label>
              <Badge variant="outline" className="capitalize">{scanConfig.priority}</Badge>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Target Type</Label>
              <p className="font-medium capitalize">{scanConfig.targetType}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Schedule</Label>
              <p className="font-medium capitalize">{scanConfig.schedule.type}</p>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-xs text-gray-500">Description</Label>
            <p className="text-sm mt-1">{scanConfig.description || 'No description provided'}</p>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Selected Targets</Label>
            <p className="text-sm mt-1">
              {scanConfig.targetType === 'workspace' 
                ? 'Full workspace scan' 
                : `${scanConfig.targets.length} targets selected`}
            </p>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Rule Sets</Label>
            <p className="text-sm mt-1">{scanConfig.ruleSetIds.length} rule sets selected</p>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Configuration Issues</AlertTitle>
          <AlertDescription className="text-red-700">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Estimates */}
      {estimatedDuration > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Scan Estimates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-900">{Math.ceil(estimatedDuration / 60)}m</div>
                <div className="text-xs text-blue-600">Estimated Duration</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-900">${estimatedCost.toFixed(2)}</div>
                <div className="text-xs text-green-600">Estimated Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          onClick={handleStartScan}
          disabled={isStarting || validationErrors.length > 0 || !scanConfig.name}
          className="flex-1"
        >
          {isStarting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isStarting ? 'Starting...' : 'Start Scan'}
        </Button>

        <Button
          variant="outline"
          onClick={handleSaveTemplate}
          disabled={isSaving || !scanConfig.name}
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Template
        </Button>
      </div>
    </div>
  );

  // AI Suggestions Dialog
  const renderAISuggestionsDialog = () => (
    <Dialog open={showAISuggestions} onOpenChange={setShowAISuggestions}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Scan Recommendations</span>
          </DialogTitle>
          <DialogDescription>
            Intelligent suggestions to optimize your scan configuration
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <Card key={index} className="border border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-purple-900 mb-1">
                        {suggestion.title || 'Optimization Suggestion'}
                      </h4>
                      <p className="text-sm text-purple-700 mb-2">
                        {suggestion.description || 'AI-powered recommendation for your scan'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          Impact: {suggestion.impact || 'Medium'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Apply Suggestion
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Start New Scan</h3>
              <p className="text-xs text-gray-500">
                {currentWorkspace?.name || 'All Workspaces'} • Advanced Configuration
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-200px)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="configure">{renderConfigureTab()}</TabsContent>
                  <TabsContent value="advanced">{renderAdvancedTab()}</TabsContent>
                  <TabsContent value="preview">{renderPreviewTab()}</TabsContent>
                </motion.div>
              </AnimatePresence>
            </ScrollArea>
          </Tabs>
        </div>

        {renderAISuggestionsDialog()}
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickScanStart;