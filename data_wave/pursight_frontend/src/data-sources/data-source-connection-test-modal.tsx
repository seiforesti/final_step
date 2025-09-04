"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  X,
  Database,
  Shield,
  Zap,
  Clock,
  Activity,
  Network,
  Key,
  Server,
  HardDrive,
  Cpu,
  Gauge,
  RefreshCw,
  ExternalLink,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// Import RBAC integration
import { useRBAC, DATA_SOURCE_PERMISSIONS } from "./hooks/use-rbac-integration";

interface ConnectionTestResult {
  success: boolean;
  message: string;
  duration?: number;
  details?: {
    connectivity?: {
      host_reachable: boolean;
      port_open: boolean;
      ssl_valid?: boolean;
      latency_ms?: number;
    };
    authentication?: {
      credentials_valid: boolean;
      permissions_verified: boolean;
      user_info?: any;
    };
    database?: {
      accessible: boolean;
      version?: string;
      schema_count?: number;
      table_count?: number;
      size_mb?: number;
    };
    performance?: {
      query_latency_ms?: number;
      connection_pool_size?: number;
      active_connections?: number;
      max_connections?: number;
    };
    security?: {
      ssl_enabled: boolean;
      encryption_type?: string;
      certificate_valid?: boolean;
      certificate_expiry?: string;
    };
    compliance?: {
      gdpr_compliant?: boolean;
      hipaa_compliant?: boolean;
      sox_compliant?: boolean;
      encryption_at_rest?: boolean;
    };
  };
  recommendations?: string[];
  warnings?: string[];
  errors?: string[];
  metadata?: Record<string, any>;
}

interface DataSourceConnectionTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataSourceId: number;
  dataSourceName?: string;
  onTestConnection?: (id: number) => Promise<ConnectionTestResult>;
}

// API Configuration
// Always go through Next.js proxy to inherit rate-limiting and mapping
const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || "/proxy";

// Backend API function for connection testing
const connectionTestApi = {
  testConnection: async (
    dataSourceId: number
  ): Promise<ConnectionTestResult> => {
    const response = await fetch(
      `${API_BASE_URL}/data-discovery/data-sources/${dataSourceId}/test-connection`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json?.message || `Connection test failed: ${response.status}`);
    }

    // Unwrap StandardResponse if present
    const data = json?.data || json;
    return data as ConnectionTestResult;
  },

  getConnectionHealth: async (dataSourceId: number): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/scan/data-sources/${dataSourceId}/health`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch connection health");
    }

    return response.json();
  },
};

export function DataSourceConnectionTestModal({
  open,
  onOpenChange,
  dataSourceId,
  dataSourceName,
  onTestConnection,
}: DataSourceConnectionTestModalProps) {
  const { hasPermission, logUserAction } = useRBAC();

  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["connectivity"])
  );
  const [testPhase, setTestPhase] = useState<string>("");

  // Check permissions
  const canTestConnection = hasPermission(
    DATA_SOURCE_PERMISSIONS.TEST_CONNECTION
  );

  // Connection test mutation
  const connectionTestMutation = useMutation({
    mutationFn: async () => {
      // Use provided function or fallback to API
      if (onTestConnection) {
        return await onTestConnection(dataSourceId);
      }
      return await connectionTestApi.testConnection(dataSourceId);
    },
    onSuccess: (data) => {
      setResult(data);
      setProgress(100);
      setTestPhase("completed");

      // Log user action
      logUserAction("connection_test_completed", "datasource", dataSourceId, {
        success: data.success,
        duration: data.duration,
        dataSourceName,
      });

      if (data.success) {
        toast.success("Connection test completed successfully");
      } else {
        toast.error("Connection test failed");
      }
    },
    onError: (error) => {
      const errorResult: ConnectionTestResult = {
        success: false,
        message:
          error instanceof Error ? error.message : "Connection test failed",
        errors: [
          error instanceof Error ? error.message : "Unknown error occurred",
        ],
      };
      setResult(errorResult);
      setProgress(0);
      setTestPhase("error");

      // Log error
      logUserAction("connection_test_failed", "datasource", dataSourceId, {
        error: error instanceof Error ? error.message : "Unknown error",
        dataSourceName,
      });

      toast.error("Connection test failed");
    },
  });

  // Start connection test with progress simulation
  const startTest = async () => {
    if (!canTestConnection) {
      toast.error("You do not have permission to test connections");
      return;
    }

    setResult(null);
    setProgress(0);
    setTestPhase("initializing");

    // Simulate test phases with progress
    const phases = [
      { name: "Initializing connection...", progress: 10 },
      { name: "Testing connectivity...", progress: 25 },
      { name: "Validating authentication...", progress: 50 },
      { name: "Checking database access...", progress: 75 },
      { name: "Running performance tests...", progress: 90 },
      { name: "Finalizing results...", progress: 95 },
    ];

    let currentPhase = 0;
    const progressInterval = setInterval(() => {
      if (currentPhase < phases.length) {
        const phase = phases[currentPhase];
        setTestPhase(phase.name);
        setProgress(phase.progress);
        currentPhase++;
      }
    }, 800);

    try {
      await logUserAction(
        "connection_test_started",
        "datasource",
        dataSourceId,
        {
          dataSourceName,
        }
      );

      await connectionTestMutation.mutateAsync();
    } finally {
      clearInterval(progressInterval);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "Success" : "Failed"}
      </Badge>
    );
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Show access denied
  if (!canTestConnection) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to test data source connections.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connection Test {dataSourceName && `- ${dataSourceName}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Test Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={startTest}
                  disabled={connectionTestMutation.isPending}
                  className="min-w-32"
                >
                  {connectionTestMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Test
                    </>
                  )}
                </Button>

                {result && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.success)}
                    {getStatusBadge(result.success)}
                    {result.duration && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(result.duration)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {connectionTestMutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{testPhase}</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Results */}
            {result && (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {/* Main Result */}
                  <Alert
                    className={
                      result.success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }
                  >
                    {getStatusIcon(result.success)}
                    <AlertDescription className="ml-2">
                      {result.message}
                    </AlertDescription>
                  </Alert>

                  {/* Detailed Results Tabs */}
                  <Tabs defaultValue="connectivity" className="w-full">
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="connectivity">
                        <Network className="h-4 w-4 mr-2" />
                        Connectivity
                      </TabsTrigger>
                      <TabsTrigger value="authentication">
                        <Key className="h-4 w-4 mr-2" />
                        Auth
                      </TabsTrigger>
                      <TabsTrigger value="database">
                        <Database className="h-4 w-4 mr-2" />
                        Database
                      </TabsTrigger>
                      <TabsTrigger value="performance">
                        <Gauge className="h-4 w-4 mr-2" />
                        Performance
                      </TabsTrigger>
                      <TabsTrigger value="security">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                      </TabsTrigger>
                    </TabsList>

                    {/* Connectivity Tab */}
                    <TabsContent value="connectivity" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Network className="h-4 w-4" />
                            Network Connectivity
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {result.details?.connectivity && (
                            <>
                              <div className="flex items-center justify-between">
                                <span>Host Reachable</span>
                                {getStatusIcon(
                                  result.details.connectivity.host_reachable
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Port Open</span>
                                {getStatusIcon(
                                  result.details.connectivity.port_open
                                )}
                              </div>
                              {result.details.connectivity.ssl_valid !==
                                undefined && (
                                <div className="flex items-center justify-between">
                                  <span>SSL Valid</span>
                                  {getStatusIcon(
                                    result.details.connectivity.ssl_valid
                                  )}
                                </div>
                              )}
                              {result.details.connectivity.latency_ms && (
                                <div className="flex items-center justify-between">
                                  <span>Latency</span>
                                  <Badge variant="outline">
                                    {formatDuration(
                                      result.details.connectivity.latency_ms
                                    )}
                                  </Badge>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Authentication Tab */}
                    <TabsContent value="authentication" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Authentication & Authorization
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {result.details?.authentication && (
                            <>
                              <div className="flex items-center justify-between">
                                <span>Credentials Valid</span>
                                {getStatusIcon(
                                  result.details.authentication
                                    .credentials_valid
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Permissions Verified</span>
                                {getStatusIcon(
                                  result.details.authentication
                                    .permissions_verified
                                )}
                              </div>
                              {result.details.authentication.user_info && (
                                <div className="mt-3 p-3 bg-muted rounded-lg">
                                  <h4 className="font-medium mb-2">
                                    User Information
                                  </h4>
                                  <pre className="text-xs text-muted-foreground">
                                    {JSON.stringify(
                                      result.details.authentication.user_info,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Database Tab */}
                    <TabsContent value="database" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Database Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {result.details?.database && (
                            <>
                              <div className="flex items-center justify-between">
                                <span>Database Accessible</span>
                                {getStatusIcon(
                                  result.details.database.accessible
                                )}
                              </div>
                              {result.details.database.version && (
                                <div className="flex items-center justify-between">
                                  <span>Version</span>
                                  <Badge variant="outline">
                                    {result.details.database.version}
                                  </Badge>
                                </div>
                              )}
                              {result.details.database.schema_count !==
                                undefined && (
                                <div className="flex items-center justify-between">
                                  <span>Schemas</span>
                                  <Badge variant="outline">
                                    {result.details.database.schema_count}
                                  </Badge>
                                </div>
                              )}
                              {result.details.database.table_count !==
                                undefined && (
                                <div className="flex items-center justify-between">
                                  <span>Tables</span>
                                  <Badge variant="outline">
                                    {result.details.database.table_count}
                                  </Badge>
                                </div>
                              )}
                              {result.details.database.size_mb !==
                                undefined && (
                                <div className="flex items-center justify-between">
                                  <span>Size</span>
                                  <Badge variant="outline">
                                    {result.details.database.size_mb} MB
                                  </Badge>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Gauge className="h-4 w-4" />
                            Performance Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {result.details?.performance && (
                            <>
                              {result.details.performance.query_latency_ms && (
                                <div className="flex items-center justify-between">
                                  <span>Query Latency</span>
                                  <Badge variant="outline">
                                    {formatDuration(
                                      result.details.performance
                                        .query_latency_ms
                                    )}
                                  </Badge>
                                </div>
                              )}
                              {result.details.performance
                                .connection_pool_size && (
                                <div className="flex items-center justify-between">
                                  <span>Connection Pool Size</span>
                                  <Badge variant="outline">
                                    {
                                      result.details.performance
                                        .connection_pool_size
                                    }
                                  </Badge>
                                </div>
                              )}
                              {result.details.performance.active_connections !==
                                undefined && (
                                <div className="flex items-center justify-between">
                                  <span>Active Connections</span>
                                  <Badge variant="outline">
                                    {
                                      result.details.performance
                                        .active_connections
                                    }
                                  </Badge>
                                </div>
                              )}
                              {result.details.performance.max_connections && (
                                <div className="flex items-center justify-between">
                                  <span>Max Connections</span>
                                  <Badge variant="outline">
                                    {result.details.performance.max_connections}
                                  </Badge>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security & Compliance
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {result.details?.security && (
                            <>
                              <div className="flex items-center justify-between">
                                <span>SSL Enabled</span>
                                {getStatusIcon(
                                  result.details.security.ssl_enabled
                                )}
                              </div>
                              {result.details.security.encryption_type && (
                                <div className="flex items-center justify-between">
                                  <span>Encryption Type</span>
                                  <Badge variant="outline">
                                    {result.details.security.encryption_type}
                                  </Badge>
                                </div>
                              )}
                              {result.details.security.certificate_valid !==
                                undefined && (
                                <div className="flex items-center justify-between">
                                  <span>Certificate Valid</span>
                                  {getStatusIcon(
                                    result.details.security.certificate_valid
                                  )}
                                </div>
                              )}
                              {result.details.security.certificate_expiry && (
                                <div className="flex items-center justify-between">
                                  <span>Certificate Expiry</span>
                                  <Badge variant="outline">
                                    {result.details.security.certificate_expiry}
                                  </Badge>
                                </div>
                              )}
                            </>
                          )}

                          {result.details?.compliance && (
                            <>
                              <Separator />
                              <h4 className="font-medium">Compliance Status</h4>
                              {Object.entries(result.details.compliance).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between"
                                  >
                                    <span>
                                      {key.replace(/_/g, " ").toUpperCase()}
                                    </span>
                                    {typeof value === "boolean" ? (
                                      getStatusIcon(value)
                                    ) : (
                                      <Badge variant="outline">
                                        {String(value)}
                                      </Badge>
                                    )}
                                  </div>
                                )
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Recommendations and Warnings */}
                  {(result.recommendations?.length ||
                    result.warnings?.length ||
                    result.errors?.length) && (
                    <div className="space-y-4">
                      {result.errors?.length && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <p className="font-medium">Errors:</p>
                              {result.errors.map((error, i) => (
                                <p key={i} className="text-sm">
                                  • {error}
                                </p>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {result.warnings?.length && (
                        <Alert className="border-yellow-200 bg-yellow-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <p className="font-medium">Warnings:</p>
                              {result.warnings.map((warning, i) => (
                                <p key={i} className="text-sm">
                                  • {warning}
                                </p>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {result.recommendations?.length && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <p className="font-medium">Recommendations:</p>
                              {result.recommendations.map((rec, i) => (
                                <p key={i} className="text-sm">
                                  • {rec}
                                </p>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
