'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Button,
  ButtonProps,
} from '@/components/ui/button';
import {
  Input,
} from '@/components/ui/input';
import {
  Label,
} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Textarea,
} from '@/components/ui/textarea';
import {
  Switch,
} from '@/components/ui/switch';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Progress,
} from '@/components/ui/progress';
import {
  ScrollArea,
} from '@/components/ui/scroll-area';
import {
  Separator,
} from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, CheckCircle, XCircle, AlertTriangle, Search, Filter, BarChart3, Calendar, Clock, FileText, Download, Upload, Settings, Zap, TrendingUp, TrendingDown, Eye, EyeOff, ChevronDown, ChevronRight, RefreshCw, Play, Pause, Square, Target, Database, GitBranch, Users, Lock, Unlock, BookOpen, Lightbulb, Brain, Sparkles, Gauge, Activity, PieChart, LineChart, BarChart2, TrendingUp as TrendUp, ArrowUpRight, ArrowDownRight, Circle, CheckCircle2, AlertCircle, Info, Star, Flag, MapPin, Layers, Grid, List, Table as TableIcon, Globe, Network, Link, Copy, Share, ExternalLink, Maximize, Minimize, RotateCw, Save, SendHorizontal,  } from 'lucide-react';

// Import hooks and services
import { useComplianceRules as useComplianceRule } from '../../../../hooks/useComplianceRules';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';

// Import types
import {
  ComplianceRule,
  ComplianceCheck,
  ComplianceCheckRequest,
  ComplianceResult,
  ComplianceMetric,
  ComplianceStandard,
  ComplianceLevel,
  ComplianceStatus,
  ComplianceViolation,
  ComplianceRecommendation,
} from '../../../../types/racine-core.types';

interface QuickComplianceCheckProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface ComplianceCheckConfig {
  scope: 'full' | 'partial' | 'targeted';
  standards: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  includeHistorical: boolean;
  autoRemediation: boolean;
  realTimeMode: boolean;
  generateReport: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

const QuickComplianceCheck: React.FC<QuickComplianceCheckProps> = ({
  isVisible,
  onClose,
  className = '',
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('quick-check');
  const [checkConfig, setCheckConfig] = useState<ComplianceCheckConfig>({
    scope: 'full',
    standards: [],
    severity: 'medium',
    includeHistorical: false,
    autoRemediation: false,
    realTimeMode: true,
    generateReport: true,
  });
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ComplianceResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | 'all'>('all');
  const [selectedStandard, setSelectedStandard] = useState<string>('');

  // Hooks
  const {
    complianceRules,
    complianceStandards,
    runComplianceCheck,
    getComplianceMetrics,
    validateComplianceConfig,
    loading: complianceLoading,
    error: complianceError,
  } = useComplianceRule();

  const { currentWorkspace, getWorkspaceAssets } = useWorkspaceManagement();
  const { currentUser, hasPermission } = useUserManagement();
  const { getSuggestions, analyzeCompliance } = useAIAssistant();
  const { getDataAssets, getCatalogData } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Computed values
  const availableAssets = useMemo(() => {
    if (!currentWorkspace) return [];
    return getDataAssets(currentWorkspace.id) || [];
  }, [currentWorkspace, getDataAssets]);

  const filteredRules = useMemo(() => {
    if (!complianceRules) return [];
    return complianceRules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rule.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
      const matchesStandard = !selectedStandard || 
                            rule.standards.some(std => std.id === selectedStandard);
      return matchesSearch && matchesStatus && matchesStandard;
    });
  }, [complianceRules, searchTerm, filterStatus, selectedStandard]);

  const complianceScore = useMemo(() => {
    if (!results) return 0;
    const total = results.totalChecks;
    const passed = results.passedChecks;
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  }, [results]);

  // Effects
  useEffect(() => {
    if (isVisible && currentUser) {
      trackActivity({
        action: 'quick_compliance_check_opened',
        component: 'QuickComplianceCheck',
        metadata: { workspace: currentWorkspace?.id },
      });
    }
  }, [isVisible, currentUser, trackActivity, currentWorkspace]);

  useEffect(() => {
    if (checkConfig) {
      validateConfiguration();
    }
  }, [checkConfig]);

  // Handlers
  const validateConfiguration = useCallback(async () => {
    try {
      const validation = await validateComplianceConfig({
        scope: checkConfig.scope,
        standards: checkConfig.standards,
        assets: selectedAssets,
        rules: selectedRules,
      });
      setValidationResult(validation);
    } catch (error) {
      console.error('Configuration validation failed:', error);
    }
  }, [checkConfig, selectedAssets, selectedRules, validateComplianceConfig]);

  const handleRunComplianceCheck = useCallback(async () => {
    if (!currentWorkspace || !validationResult?.isValid) return;

    setIsRunning(true);
    setProgress(0);

    try {
      const checkRequest: ComplianceCheckRequest = {
        workspaceId: currentWorkspace.id,
        scope: checkConfig.scope,
        assetIds: selectedAssets,
        ruleIds: selectedRules,
        standards: checkConfig.standards,
        configuration: {
          severity: checkConfig.severity,
          includeHistorical: checkConfig.includeHistorical,
          autoRemediation: checkConfig.autoRemediation,
          realTimeMode: checkConfig.realTimeMode,
          generateReport: checkConfig.generateReport,
        },
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const result = await runComplianceCheck(checkRequest);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(result);

      // Track successful check
      trackActivity({
        action: 'compliance_check_completed',
        component: 'QuickComplianceCheck',
        metadata: {
          workspace: currentWorkspace.id,
          scope: checkConfig.scope,
          rulesChecked: selectedRules.length,
          assetsChecked: selectedAssets.length,
          complianceScore: complianceScore,
        },
      });

    } catch (error) {
      console.error('Compliance check failed:', error);
      // Handle error appropriately
    } finally {
      setIsRunning(false);
    }
  }, [
    currentWorkspace,
    validationResult,
    checkConfig,
    selectedAssets,
    selectedRules,
    runComplianceCheck,
    trackActivity,
    complianceScore,
  ]);

  const handleAssetSelection = useCallback((assetId: string, selected: boolean) => {
    setSelectedAssets(prev => 
      selected 
        ? [...prev, assetId]
        : prev.filter(id => id !== assetId)
    );
  }, []);

  const handleRuleSelection = useCallback((ruleId: string, selected: boolean) => {
    setSelectedRules(prev => 
      selected 
        ? [...prev, ruleId]
        : prev.filter(id => id !== ruleId)
    );
  }, []);

  const handleConfigChange = useCallback((key: keyof ComplianceCheckConfig, value: any) => {
    setCheckConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleStandardToggle = useCallback((standardId: string, selected: boolean) => {
    setCheckConfig(prev => ({
      ...prev,
      standards: selected
        ? [...prev.standards, standardId]
        : prev.standards.filter(id => id !== standardId),
    }));
  }, []);

  const renderComplianceScore = () => (
    <motion.div
      variants={itemVariants}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Compliance Score</h3>
            <p className="text-sm text-blue-600">Overall compliance status</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-900">{complianceScore}%</div>
          <div className="flex items-center space-x-1 text-sm text-blue-600">
            {complianceScore >= 90 ? (
              <TrendingUp className="h-4 w-4" />
            ) : complianceScore >= 70 ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span>Excellent</span>
          </div>
        </div>
      </div>
      <Progress value={complianceScore} className="h-3" />
    </motion.div>
  );

  const renderQuickActions = () => (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-2 gap-3"
    >
      <Button
        onClick={handleRunComplianceCheck}
        disabled={isRunning || !validationResult?.isValid}
        className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
      >
        <Play className="h-4 w-4 mr-2" />
        {isRunning ? 'Running...' : 'Start Check'}
      </Button>
      
      <Button
        variant="outline"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="h-12"
      >
        <Settings className="h-4 w-4 mr-2" />
        Advanced
      </Button>
    </motion.div>
  );

  const renderValidationStatus = () => {
    if (!validationResult) return null;

    return (
      <motion.div variants={itemVariants}>
        {validationResult.isValid ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Configuration Valid</AlertTitle>
            <AlertDescription className="text-green-700">
              Ready to run compliance check
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Configuration Issues</AlertTitle>
            <AlertDescription className="text-red-700">
              <ul className="list-disc list-inside mt-2 space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </motion.div>
    );
  };

  const renderProgressIndicator = () => {
    if (!isRunning) return null;

    return (
      <motion.div
        variants={itemVariants}
        className="bg-blue-50 p-4 rounded-lg border border-blue-200"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">
            Running Compliance Check...
          </span>
          <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-2 text-xs text-blue-600">
          Analyzing {selectedAssets.length} assets with {selectedRules.length} rules
        </div>
      </motion.div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {results.passedChecks}
                  </div>
                  <div className="text-sm text-green-600">Passed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-700">
                    {results.failedChecks}
                  </div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {results.violations && results.violations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Compliance Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {results.violations.map((violation, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive" className="text-xs">
                            {violation.severity}
                          </Badge>
                          <span className="font-medium text-red-900">
                            {violation.ruleName}
                          </span>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        {violation.description}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  };

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-white rounded-xl shadow-xl border border-gray-200 ${className}`}
        style={{ width: '420px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Compliance Check
              </h2>
              <p className="text-sm text-gray-500">
                Validate compliance across assets
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick-check">Quick Check</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="quick-check" className="space-y-4">
              <motion.div
                variants={itemVariants}
                className="space-y-4"
              >
                {/* Compliance Score */}
                {results && renderComplianceScore()}

                {/* Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Check Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scope">Scope</Label>
                        <Select
                          value={checkConfig.scope}
                          onValueChange={(value: 'full' | 'partial' | 'targeted') =>
                            handleConfigChange('scope', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Workspace</SelectItem>
                            <SelectItem value="partial">Selected Assets</SelectItem>
                            <SelectItem value="targeted">Targeted Rules</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="severity">Min Severity</Label>
                        <Select
                          value={checkConfig.severity}
                          onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') =>
                            handleConfigChange('severity', value)
                          }
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

                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="realtime"
                            checked={checkConfig.realTimeMode}
                            onCheckedChange={(checked) =>
                              handleConfigChange('realTimeMode', checked)
                            }
                          />
                          <Label htmlFor="realtime" className="text-sm">
                            Real-time monitoring
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="report"
                            checked={checkConfig.generateReport}
                            onCheckedChange={(checked) =>
                              handleConfigChange('generateReport', checked)
                            }
                          />
                          <Label htmlFor="report" className="text-sm">
                            Generate report
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Validation Status */}
                {renderValidationStatus()}

                {/* Progress */}
                {renderProgressIndicator()}

                {/* Quick Actions */}
                {renderQuickActions()}
              </motion.div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-4">
                {/* Standards Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Compliance Standards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {complianceStandards?.map((standard) => (
                        <div key={standard.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={standard.id}
                            checked={checkConfig.standards.includes(standard.id)}
                            onCheckedChange={(checked) =>
                              handleStandardToggle(standard.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={standard.id} className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {standard.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {standard.version}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {standard.description}
                            </p>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Selection */}
                {checkConfig.scope === 'partial' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Select Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {availableAssets.map((asset) => (
                            <div key={asset.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={asset.id}
                                checked={selectedAssets.includes(asset.id)}
                                onCheckedChange={(checked) =>
                                  handleAssetSelection(asset.id, checked as boolean)
                                }
                              />
                              <Label htmlFor={asset.id} className="text-sm">
                                {asset.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Rule Selection */}
                {checkConfig.scope === 'targeted' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Select Rules</CardTitle>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Search rules..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {filteredRules.map((rule) => (
                            <div key={rule.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={rule.id}
                                checked={selectedRules.includes(rule.id)}
                                onCheckedChange={(checked) =>
                                  handleRuleSelection(rule.id, checked as boolean)
                                }
                              />
                              <Label htmlFor={rule.id} className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {rule.name}
                                  </span>
                                  <Badge
                                    variant={rule.status === 'active' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {rule.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {rule.description}
                                </p>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {results ? (
                renderResults()
              ) : (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-8 text-gray-500"
                >
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No compliance check results yet.</p>
                  <p className="text-sm mt-1">Run a check to see results here.</p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickComplianceCheck;

// Named export for backward compatibility
export { QuickComplianceCheck };
