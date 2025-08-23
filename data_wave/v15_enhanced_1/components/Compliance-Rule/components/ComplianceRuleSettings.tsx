"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Settings, Shield, Bell, Database, Users, Lock, Globe, Save, RefreshCw, Download, Upload, AlertTriangle, CheckCircle, Server, Cloud, Boxes, Key, Monitor, Wifi, HardDrive } from 'lucide-react'

// Enterprise Integration
import { ComplianceHooks } from '../hooks/use-enterprise-features'
import { useEnterpriseCompliance } from '../enterprise-integration'

interface ComplianceRuleSettingsProps {
  dataSourceId?: number
}

const ComplianceRuleSettings: React.FC<ComplianceRuleSettingsProps> = ({ dataSourceId }) => {
  const enterprise = useEnterpriseCompliance()
  const enterpriseFeatures = ComplianceHooks.useEnterpriseFeatures({
    componentName: 'ComplianceRuleSettings',
    dataSourceId
  })

  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    organizationName: 'Acme Corporation',
    defaultFramework: 'SOC2',
    assessmentFrequency: 'quarterly',
    riskThreshold: 'medium',
    autoRemediation: true,
    realTimeMonitoring: true,
    notificationEmail: 'compliance@acme.com',
    retentionPeriod: 365,
    auditLogging: true,
    aiInsights: true
  })

  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90
    },
    sessionTimeout: 30,
    twoFactorAuth: true,
    encryption: true,
    accessLogging: true
  })

  const [integrationSettings, setIntegrationSettings] = useState([
    {
      id: 1,
      name: 'ServiceNow GRC',
      type: 'grc_tool',
      status: 'connected',
      lastSync: '2 hours ago',
      config: {
        url: 'https://company.service-now.com',
        syncFrequency: 'hourly'
      }
    },
    {
      id: 2,
      name: 'Qualys VMDR',
      type: 'security_scanner',
      status: 'connected',
      lastSync: '1 day ago',
      config: {
        apiEndpoint: 'https://qualysapi.qg2.apps.qualys.com',
        syncFrequency: 'daily'
      }
    },
    {
      id: 3,
      name: 'Microsoft Purview',
      type: 'data_governance',
      status: 'error',
      lastSync: '3 days ago',
      config: {
        tenantId: 'xxx-xxx-xxx',
        syncFrequency: 'real_time'
      }
    }
  ])

  const [notificationSettings, setNotificationSettings] = useState({
    assessmentDue: true,
    riskThresholdExceeded: true,
    complianceGapIdentified: true,
    workflowApprovalRequired: false,
    integrationErrors: true,
    weeklySummary: false,
    emailNotifications: true,
    slackNotifications: false,
    smsNotifications: false
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Save settings
  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      await enterpriseFeatures.executeAction('update_settings', {
        general: generalSettings,
        security: securitySettings,
        integrations: integrationSettings,
        notifications: notificationSettings
      })
      
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  // Reset settings to defaults
  const handleResetSettings = () => {
    setGeneralSettings({
      organizationName: 'Acme Corporation',
      defaultFramework: 'SOC2',
      assessmentFrequency: 'quarterly',
      riskThreshold: 'medium',
      autoRemediation: true,
      realTimeMonitoring: true,
      notificationEmail: 'compliance@acme.com',
      retentionPeriod: 365,
      auditLogging: true,
      aiInsights: true
    })
    toast.info('Settings reset to defaults')
  }

  // Test integration connection
  const handleTestIntegration = async (integrationId: number) => {
    try {
      await enterpriseFeatures.executeAction('test_integration', { integrationId })
      toast.success('Integration test successful')
    } catch (error) {
      toast.error('Integration test failed')
    }
  }

  // Export settings
  const handleExportSettings = async () => {
    try {
      const settings = {
        general: generalSettings,
        security: securitySettings,
        integrations: integrationSettings,
        notifications: notificationSettings
      }
      
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'compliance-settings.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Settings exported successfully')
    } catch (error) {
      toast.error('Failed to export settings')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance Settings</h2>
          <p className="text-muted-foreground">
            Configure system-wide compliance and security settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-1" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  <span>Organization Settings</span>
                </CardTitle>
                <CardDescription>Basic organization and compliance configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={generalSettings.organizationName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="default-framework">Default Framework</Label>
                  <Select 
                    value={generalSettings.defaultFramework} 
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, defaultFramework: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOC2">SOC 2</SelectItem>
                      <SelectItem value="GDPR">GDPR</SelectItem>
                      <SelectItem value="HIPAA">HIPAA</SelectItem>
                      <SelectItem value="PCI-DSS">PCI DSS</SelectItem>
                      <SelectItem value="ISO27001">ISO 27001</SelectItem>
                      <SelectItem value="NIST">NIST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assessment-frequency">Assessment Frequency</Label>
                  <Select 
                    value={generalSettings.assessmentFrequency}
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, assessmentFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="risk-threshold">Risk Threshold</Label>
                  <Select 
                    value={generalSettings.riskThreshold}
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, riskThreshold: value }))}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-green-500" />
                  <span>System Configuration</span>
                </CardTitle>
                <CardDescription>System behavior and automation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-remediation">Auto-Remediation</Label>
                    <p className="text-xs text-muted-foreground">Automatically fix simple compliance issues</p>
                  </div>
                  <Switch
                    id="auto-remediation"
                    checked={generalSettings.autoRemediation}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, autoRemediation: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="real-time-monitoring">Real-time Monitoring</Label>
                    <p className="text-xs text-muted-foreground">Enable continuous compliance monitoring</p>
                  </div>
                  <Switch
                    id="real-time-monitoring"
                    checked={generalSettings.realTimeMonitoring}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, realTimeMonitoring: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audit-logging">Audit Logging</Label>
                    <p className="text-xs text-muted-foreground">Log all compliance-related activities</p>
                  </div>
                  <Switch
                    id="audit-logging"
                    checked={generalSettings.auditLogging}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, auditLogging: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ai-insights">AI Insights</Label>
                    <p className="text-xs text-muted-foreground">Enable AI-powered compliance insights</p>
                  </div>
                  <Switch
                    id="ai-insights"
                    checked={generalSettings.aiInsights}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, aiInsights: checked }))}
                  />
                </div>

                <div>
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    value={generalSettings.notificationEmail}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="retention-period">Data Retention (days)</Label>
                  <Input
                    id="retention-period"
                    type="number"
                    value={generalSettings.retentionPeriod}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-red-500" />
                  <span>Password Policy</span>
                </CardTitle>
                <CardDescription>Configure password requirements and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="min-length">Minimum Length</Label>
                  <Input
                    id="min-length"
                    type="number"
                    value={securitySettings.passwordPolicy.minLength}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Require Uppercase</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireUppercase: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Require Lowercase</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireLowercase: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Require Numbers</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireNumbers: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Require Special Characters</Label>
                    <Switch
                      checked={securitySettings.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireSpecialChars: checked }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expiry-days">Password Expiry (days)</Label>
                  <Input
                    id="expiry-days"
                    type="number"
                    value={securitySettings.passwordPolicy.expiryDays}
                    onChange={(e) => setSecuritySettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, expiryDays: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Authentication & Access</span>
                </CardTitle>
                <CardDescription>Session management and access control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">Require 2FA for all users</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Encryption</Label>
                      <p className="text-xs text-muted-foreground">Encrypt data at rest and in transit</p>
                    </div>
                    <Switch
                      checked={securitySettings.encryption}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, encryption: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Access Logging</Label>
                      <p className="text-xs text-muted-foreground">Log all user access attempts</p>
                    </div>
                    <Switch
                      checked={securitySettings.accessLogging}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, accessLogging: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Boxes className="h-5 w-5 text-purple-500" />
                <span>External Integrations</span>
              </CardTitle>
              <CardDescription>Manage connections to external systems and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationSettings.map((integration) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded">
                          {integration.type === 'grc_tool' && <Server className="h-4 w-4" />}
                          {integration.type === 'security_scanner' && <Shield className="h-4 w-4" />}
                          {integration.type === 'data_governance' && <Cloud className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">Last sync: {integration.lastSync}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          integration.status === 'connected' ? 'default' :
                          integration.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {integration.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTestIntegration(integration.id)}
                        >
                          Test
                        </Button>
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(integration.config).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-muted-foreground">{key.replace('_', ' ')}: </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Event Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'assessmentDue', label: 'Assessment Due', description: 'When compliance assessments are due' },
                      { key: 'riskThresholdExceeded', label: 'Risk Threshold Exceeded', description: 'When risk levels exceed defined thresholds' },
                      { key: 'complianceGapIdentified', label: 'Compliance Gap Identified', description: 'When new compliance gaps are discovered' },
                      { key: 'workflowApprovalRequired', label: 'Workflow Approval Required', description: 'When workflow steps need approval' },
                      { key: 'integrationErrors', label: 'Integration Errors', description: 'When external integrations fail' },
                      { key: 'weeklySummary', label: 'Weekly Summary', description: 'Weekly compliance status summary' }
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between">
                        <div>
                          <Label>{notification.label}</Label>
                          <p className="text-xs text-muted-foreground">{notification.description}</p>
                        </div>
                        <Switch
                          checked={notificationSettings[notification.key]}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [notification.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Delivery Methods</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                      { key: 'slackNotifications', label: 'Slack Notifications', description: 'Receive notifications in Slack' },
                      { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive critical notifications via SMS' }
                    ].map((method) => (
                      <div key={method.key} className="flex items-center justify-between">
                        <div>
                          <Label>{method.label}</Label>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                        <Switch
                          checked={notificationSettings[method.key]}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [method.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-indigo-500" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>Advanced data handling and storage options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reset All Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-green-500" />
                  <span>System Information</span>
                </CardTitle>
                <CardDescription>Current system status and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Version</span>
                    <span className="text-sm font-medium">2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Database</span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">API Status</span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-sm font-medium">Operational</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Backup</span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Storage Used</span>
                    <span className="text-sm font-medium">2.4 GB / 10 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ComplianceRuleSettings