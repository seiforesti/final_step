"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

import {
  DataSourceCreateParams,
  DataSourceType,
  DataSourceLocation,
  Environment,
  Criticality,
  DataClassification,
} from "./types";
import { DataDiscoveryWorkspace } from "./data-discovery/data-discovery-workspace";
import { DataSourceConnectionTestModal } from "./data-source-connection-test-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Eye,
  RefreshCw,
  Database,
  Search,
  Layers,
} from "lucide-react";

interface DataSourceCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (
    dataSource: DataSourceCreateParams
  ) => Promise<any> | Promise<void>;
}

export function DataSourceCreateModal({
  open,
  onClose,
  onSuccess,
}: DataSourceCreateModalProps) {
  const [formData, setFormData] = useState<DataSourceCreateParams>({
    name: "",
    source_type: "postgresql" as DataSourceType,
    location: "cloud" as DataSourceLocation,
    host: "",
    port: 5432,
    username: "",
    password: "",
    database_name: "",
    description: "",
    connection_properties: {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [preflightDiagnostics, setPreflightDiagnostics] = useState<any | null>(null);
  const [preflightToken, setPreflightToken] = useState<string | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [createdDataSource, setCreatedDataSource] = useState<any>(null);
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'preflight_ok' | 'created'>('details');
  const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || "/proxy";
  const [enumOptions, setEnumOptions] = useState<{ source_types: string[]; locations: string[]; environments: string[]; criticalities: string[]; data_classifications: string[]; scan_frequencies: string[]; } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/scan/data-sources/enums`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` }
        });
        const json = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && json) {
          setEnumOptions({
            source_types: json.source_types || [],
            locations: json.locations || [],
            environments: json.environments || [],
            criticalities: json.criticalities || [],
            data_classifications: json.data_classifications || [],
            scan_frequencies: json.scan_frequencies || []
          });
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [API_BASE_URL]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setSubmitError("Name is required");
      return false;
    }
    if (!formData.host.trim()) {
      setSubmitError("Host is required");
      return false;
    }
    if (!formData.username.trim()) {
      setSubmitError("Username is required");
      return false;
    }
    if (!formData.password.trim()) {
      setSubmitError("Password is required");
      return false;
    }
    if (formData.port <= 0 || formData.port > 65535) {
      setSubmitError("Port must be between 1 and 65535");
      return false;
    }
    return true;
  };

  const isFormValid = (
    formData.name.trim().length > 0 &&
    formData.host.trim().length > 0 &&
    formData.username.trim().length > 0 &&
    formData.password.trim().length > 0 &&
    formData.port > 0 && formData.port <= 65535
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setPreflightDiagnostics(null);

    try {
      // Require successful preflight before creating
      if (!preflightToken) {
        throw new Error("Please run Preflight and ensure it succeeds before creating.");
      }
      // Create with preflight token enforcement
      const createRes = await fetch(`${API_BASE_URL}/scan/data-sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` },
        body: JSON.stringify({
          ...formData,
          preflight_token: preflightToken
        })
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err?.detail || err?.message || "Failed to create data source");
      }
      const created = await createRes.json();
      setCreatedDataSource(created);
      setCurrentStep('created');

      // 3) Post-create validate connection & baseline (non-blocking)
      try {
        await fetch(`${API_BASE_URL}/scan/data-sources/${created.id}/validate`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` }
        });
      } catch {}

      // Reset form
      setFormData({
        name: "",
        source_type: "postgresql",
        location: "cloud",
        host: "",
        port: 5432,
        username: "",
        password: "",
        database_name: "",
        description: "",
        connection_properties: {},
      });
      setPreflightToken(null);
      setPreflightDiagnostics(null);

      // Show option to start discovery
      setIsSubmitting(false);
      // Don't close immediately, show discovery option
    } catch (error: any) {
      setSubmitError(error?.message || "Failed to create data source");
      setIsSubmitting(false);
    }
  };

  const handlePreflight = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setPreflightDiagnostics(null);
    setPreflightToken(null);
    try {
      const preflightRes = await fetch(`${API_BASE_URL}/scan/validate-connection-preflight`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('authToken') || ''}` },
        body: JSON.stringify({
          name: formData.name,
          source_type: formData.source_type,
          location: formData.location,
          host: formData.host,
          port: formData.port,
          username: formData.username,
          password: formData.password,
          database_name: formData.database_name,
          connection_properties: formData.connection_properties,
          environment: formData.environment,
          criticality: formData.criticality,
          data_classification: formData.data_classification,
          scan_frequency: formData.scan_frequency
        })
      });
      const preflightJson = await preflightRes.json().catch(() => ({}));
      if (!preflightRes.ok || !preflightJson?.success) {
        setPreflightDiagnostics(preflightJson?.diagnostics || null);
        throw new Error(preflightJson?.detail || preflightJson?.message || "Preflight validation failed");
      }
      setPreflightDiagnostics(preflightJson?.diagnostics || null);
      setPreflightToken(preflightJson?.preflight_token || null);
      setCurrentStep('preflight_ok');
    } catch (e: any) {
      setSubmitError(e?.message || 'Preflight failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSubmitError(null);
    }
  };

  const handleSourceTypeChange = (value: string) => {
    let defaultPort = 5432;
    switch (value) {
      case "mysql":
        defaultPort = 3306;
        break;
      case "mongodb":
        defaultPort = 27017;
        break;
      case "redis":
        defaultPort = 6379;
        break;
      case "snowflake":
        defaultPort = 443;
        break;
      case "s3":
        defaultPort = 443;
        break;
      default:
        defaultPort = 5432;
    }

    setFormData(
      (prev): DataSourceCreateParams => ({
        ...prev,
        source_type: value as DataSourceType,
        port: defaultPort,
      })
    );
  };

  const handleStartDiscovery = () => {
    setShowDiscovery(true);
    onClose(); // Close the create modal
  };

  const handleCloseAndFinish = () => {
    // Reset form and close
    setFormData({
      name: "",
      source_type: "postgresql",
      location: "cloud",
      host: "",
      port: 5432,
      username: "",
      password: "",
      database_name: "",
      description: "",
      connection_properties: {},
    });
    setCreatedDataSource(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add New Data Source</DialogTitle>
            <DialogDescription>
              Configure a new data source connection for scanning and
              monitoring.
            </DialogDescription>
          </DialogHeader>

          {!createdDataSource ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              {preflightDiagnostics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Preflight Diagnostics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Success:</span> <span className="font-medium">{String(preflightDiagnostics?.success ?? true)}</span></div>
                      <div><span className="text-muted-foreground">Latency:</span> <span className="font-medium">{preflightDiagnostics?.latency_ms ?? 'n/a'} ms</span></div>
                      <div><span className="text-muted-foreground">Version:</span> <span className="font-medium">{preflightDiagnostics?.version || 'n/a'}</span></div>
                      <div><span className="text-muted-foreground">SSL Enabled:</span> <span className="font-medium">{String(preflightDiagnostics?.ssl_enabled ?? 'n/a')}</span></div>
                      {preflightDiagnostics?.warnings?.length ? (
                        <div className="col-span-2"><span className="text-muted-foreground">Warnings:</span> <span className="font-medium">{preflightDiagnostics.warnings.join(', ')}</span></div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Production Database"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source_type">Source Type *</Label>
                  <Select
                    value={formData.source_type}
                    onValueChange={handleSourceTypeChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source type" />
                    </SelectTrigger>
                    <SelectContent>
                      {enumOptions?.source_types?.length ? (
                        enumOptions.source_types.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="postgresql">PostgreSQL</SelectItem>
                          <SelectItem value="mysql">MySQL</SelectItem>
                          <SelectItem value="mongodb">MongoDB</SelectItem>
                          <SelectItem value="snowflake">Snowflake</SelectItem>
                          <SelectItem value="s3">Amazon S3</SelectItem>
                          <SelectItem value="redis">Redis</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="host">Host *</Label>
                  <Input
                    id="host"
                    placeholder="e.g., db.example.com"
                    value={formData.host}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, host: e.target.value }))
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    min="1"
                    max="65535"
                    value={formData.port}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        port: parseInt(e.target.value) || 0,
                      }))
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Database username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Database password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="database_name">Database Name</Label>
                  <Input
                    id="database_name"
                    placeholder="Database/schema name (optional)"
                    value={formData.database_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        database_name: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      setFormData(
                        (prev): DataSourceCreateParams => ({
                          ...prev,
                          location: value as DataSourceLocation,
                        })
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {enumOptions?.locations?.length ? (
                        enumOptions.locations.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="cloud">Cloud</SelectItem>
                          <SelectItem value="on_prem">On-Premise</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this data source (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              {/* Advanced Configuration Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={formData.environment}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        environment: value as Environment,
                      }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {enumOptions?.environments?.length ? (
                        enumOptions.environments.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="test">Test</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="criticality">Criticality</Label>
                  <Select
                    value={formData.criticality}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        criticality: value as Criticality,
                      }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select criticality" />
                    </SelectTrigger>
                    <SelectContent>
                      {enumOptions?.criticalities?.length ? (
                        enumOptions.criticalities.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_classification">Data Classification</Label>
                  <Select
                    value={formData.data_classification}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        data_classification: value as DataClassification,
                      }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      {enumOptions?.data_classifications?.length ? (
                        enumOptions.data_classifications.map((dc) => (
                          <SelectItem key={dc} value={dc}>{dc}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="confidential">Confidential</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Operational Settings */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monitoring_enabled">Monitoring</Label>
                  <Select
                    value={formData.monitoring_enabled ? "enabled" : "disabled"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        monitoring_enabled: value === "enabled",
                      }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup_enabled">Backup</Label>
                  <Select
                    value={formData.backup_enabled ? "enabled" : "disabled"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        backup_enabled: value === "enabled",
                      }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encryption_enabled">Encryption</Label>
                  <Select
                    value={formData.encryption_enabled ? "enabled" : "disabled"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        encryption_enabled: value === "enabled",
                      }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreflight}
                  disabled={isSubmitting || !isFormValid}
                >
                  {isSubmitting && !preflightToken ? 'Checking...' : 'Run Preflight'}
                </Button>
                <Button type="submit" disabled={isSubmitting || !isFormValid || !preflightToken}>
                  {isSubmitting && preflightToken ? "Creating..." : "Create Data Source"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Data Source Created Successfully!
                </h3>
                <p className="text-muted-foreground">
                  {createdDataSource.name} has been added to your data catalog.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Start Data Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Would you like to start discovering and exploring the data
                    structure of your new data source? This will help you
                    understand what data is available and set up your workspace.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 border rounded">
                      <Database className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <div className="text-sm font-medium">Connect & Test</div>
                      <div className="text-xs text-muted-foreground">
                        Verify connectivity
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <Search className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <div className="text-sm font-medium">Discover Schema</div>
                      <div className="text-xs text-muted-foreground">
                        Explore data structure
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <Layers className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <div className="text-sm font-medium">
                        Create Workspace
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Select and organize data
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowConnectionTest(true)}
                      className="flex-1"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button onClick={handleStartDiscovery} className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Start Discovery
                    </Button>
                    <Button variant="outline" onClick={handleCloseAndFinish}>
                      Skip for Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Data Discovery Workspace */}
      <DataDiscoveryWorkspace
        dataSource={createdDataSource}
        isOpen={showDiscovery}
        onClose={() => {
          setShowDiscovery(false);
          handleCloseAndFinish();
        }}
      />

      {/* Connection Test Modal */}
      {createdDataSource?.id && (
        <DataSourceConnectionTestModal
          open={showConnectionTest}
          onOpenChange={setShowConnectionTest}
          dataSourceId={createdDataSource.id}
          dataSourceName={createdDataSource.name}
        />
      )}
    </>
  );
}
