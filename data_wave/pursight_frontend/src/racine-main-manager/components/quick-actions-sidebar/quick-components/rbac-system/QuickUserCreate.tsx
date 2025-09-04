'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserPlus, Users, Shield, Mail, Phone, Calendar, Globe, Building, Department, Key, Lock, Unlock, Eye, EyeOff, Check, X, AlertTriangle, Info, RefreshCw, Save, Zap, Brain, Sparkles, Target, Activity, Settings, Star } from 'lucide-react';

import { useRBACSystem as useRBAC } from '../../../../hooks/useRBACSystem';
import { useWorkspaceManagement } from '../../../../hooks/useWorkspaceManagement';
import { useUserManagement } from '../../../../hooks/useUserManagement';
import { useAIAssistant } from '../../../../hooks/useAIAssistant';
import { useCrossGroupIntegration } from '../../../../hooks/useCrossGroupIntegration';
import { useActivityTracking } from '../../../../hooks/useActivityTracking';

interface QuickUserCreateProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface UserConfiguration {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    title: string;
    manager: string;
    startDate: string;
  };
  access: {
    roles: string[];
    workspaces: string[];
    permissions: string[];
    temporaryAccess: boolean;
    accessDuration: string;
  };
  security: {
    requireMFA: boolean;
    passwordPolicy: string;
    sessionTimeout: number;
    allowMultipleSessions: boolean;
    restrictIPs: boolean;
    allowedIPs: string[];
  };
  preferences: {
    timezone: string;
    language: string;
    theme: string;
    notifications: string[];
  };
  compliance: {
    dataProcessingConsent: boolean;
    privacyPolicyAccepted: boolean;
    termsOfServiceAccepted: boolean;
    gdprCompliant: boolean;
    retentionPeriod: string;
    backgroundCheckRequired: boolean;
    complianceTraining: string[];
  };
  integration: {
    ldapSync: boolean;
    ssoProvider: string;
    externalId: string;
    syncAttributes: string[];
    identityProvider: string;
  };
}

const QuickUserCreate: React.FC<QuickUserCreateProps> = ({
  isVisible, onClose, className = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [userConfig, setUserConfig] = useState<UserConfiguration>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      title: '',
      manager: '',
      startDate: new Date().toISOString().split('T')[0],
    },
    access: {
      roles: [],
      workspaces: [],
      permissions: [],
      temporaryAccess: false,
      accessDuration: '90',
    },
    security: {
      requireMFA: true,
      passwordPolicy: 'strong',
      sessionTimeout: 480,
      allowMultipleSessions: false,
      restrictIPs: false,
      allowedIPs: [],
    },
    preferences: {
      timezone: 'UTC',
      language: 'en',
      theme: 'light',
      notifications: ['email'],
    },
    compliance: {
      dataProcessingConsent: false,
      privacyPolicyAccepted: false,
      termsOfServiceAccepted: false,
      gdprCompliant: true,
      retentionPeriod: '7years',
      backgroundCheckRequired: false,
      complianceTraining: [],
    },
    integration: {
      ldapSync: false,
      ssoProvider: '',
      externalId: '',
      syncAttributes: [],
      identityProvider: 'local',
    },
  });
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validation, setValidation] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const { createUser, getRoles, getPermissions, loading } = useRBAC();
  const { currentWorkspace, workspaces, workspaceUsers } = useWorkspaceManagement();
  const { currentUser } = useUserManagement();
  const { analyzeUserCreation, getUserRecommendations } = useAIAssistant();
  const { getCrossGroupRoles, syncWithIdentityProvider } = useCrossGroupIntegration();
  const { trackActivity } = useActivityTracking();

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const formCompleteness = useMemo(() => {
    const required = ['firstName', 'lastName', 'email', 'department'];
    const completed = required.filter(field => {
      if (field === 'firstName') return userConfig.personalInfo.firstName.length > 0;
      if (field === 'lastName') return userConfig.personalInfo.lastName.length > 0;
      if (field === 'email') return userConfig.personalInfo.email.length > 0;
      if (field === 'department') return userConfig.personalInfo.department.length > 0;
      return false;
    });
    return Math.round((completed.length / required.length) * 100);
  }, [userConfig.personalInfo]);

  const handleCreateUser = useCallback(async () => {
    if (!currentWorkspace || formCompleteness < 100) return;

    setIsCreating(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => prev < 90 ? prev + Math.random() * 15 : prev);
      }, 400);

      await createUser({
        workspaceId: currentWorkspace.id,
        ...userConfig,
      });

      clearInterval(progressInterval);
      setProgress(100);

      trackActivity({
        action: 'user_created',
        component: 'QuickUserCreate',
        metadata: {
          workspace: currentWorkspace.id,
          userEmail: userConfig.personalInfo.email,
          rolesAssigned: userConfig.access.roles.length,
        },
      });

      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('User creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  }, [currentWorkspace, userConfig, formCompleteness, createUser, trackActivity, onClose]);

  const handleConfigChange = useCallback((section: keyof UserConfiguration, field: string, value: any) => {
    setUserConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }, []);

  const renderPersonalTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input
                value={userConfig.personalInfo.firstName}
                onChange={(e) => handleConfigChange('personalInfo', 'firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={userConfig.personalInfo.lastName}
                onChange={(e) => handleConfigChange('personalInfo', 'lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <Label>Email Address *</Label>
            <Input
              type="email"
              value={userConfig.personalInfo.email}
              onChange={(e) => handleConfigChange('personalInfo', 'email', e.target.value)}
              placeholder="john.doe@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                value={userConfig.personalInfo.phone}
                onChange={(e) => handleConfigChange('personalInfo', 'phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={userConfig.personalInfo.startDate}
                onChange={(e) => handleConfigChange('personalInfo', 'startDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Department *</Label>
              <Select
                value={userConfig.personalInfo.department}
                onValueChange={(value) => handleConfigChange('personalInfo', 'department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job Title</Label>
              <Input
                value={userConfig.personalInfo.title}
                onChange={(e) => handleConfigChange('personalInfo', 'title', e.target.value)}
                placeholder="Data Analyst"
              />
            </div>
          </div>

          <div>
            <Label>Manager</Label>
            <Select
              value={userConfig.personalInfo.manager}
              onValueChange={(value) => handleConfigChange('personalInfo', 'manager', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {workspaceUsers?.filter(u => u.id !== currentUser?.id).map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Form Completion</span>
            <span className="text-sm text-gray-500">{formCompleteness}%</span>
          </div>
          <Progress value={formCompleteness} className="h-2" />
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAccessTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Role Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {['Admin', 'Data Steward', 'Analyst', 'Viewer', 'Compliance Officer'].map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    checked={userConfig.access.roles.includes(role)}
                    onCheckedChange={(checked) => {
                      const roles = checked
                        ? [...userConfig.access.roles, role]
                        : userConfig.access.roles.filter(r => r !== role);
                      handleConfigChange('access', 'roles', roles);
                    }}
                  />
                  <Label className="text-sm">{role}</Label>
                  <Badge variant="outline" className="text-xs">
                    {role === 'Admin' ? 'Full Access' : 'Limited Access'}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Workspace Access</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-24">
            <div className="space-y-2">
              {workspaces?.map((workspace) => (
                <div key={workspace.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={userConfig.access.workspaces.includes(workspace.id)}
                    onCheckedChange={(checked) => {
                      const workspaceIds = checked
                        ? [...userConfig.access.workspaces, workspace.id]
                        : userConfig.access.workspaces.filter(w => w !== workspace.id);
                      handleConfigChange('access', 'workspaces', workspaceIds);
                    }}
                  />
                  <Label className="text-sm">{workspace.name}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Access Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="temporary">Temporary Access</Label>
            <Switch
              id="temporary"
              checked={userConfig.access.temporaryAccess}
              onCheckedChange={(checked) => handleConfigChange('access', 'temporaryAccess', checked)}
            />
          </div>
          {userConfig.access.temporaryAccess && (
            <div>
              <Label>Access Duration (days)</Label>
              <Select
                value={userConfig.access.accessDuration}
                onValueChange={(value) => handleConfigChange('access', 'accessDuration', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSecurityTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="mfa">Require Multi-Factor Auth</Label>
              <p className="text-xs text-gray-500">Enhanced security with 2FA</p>
            </div>
            <Switch
              id="mfa"
              checked={userConfig.security.requireMFA}
              onCheckedChange={(checked) => handleConfigChange('security', 'requireMFA', checked)}
            />
          </div>

          <div>
            <Label>Password Policy</Label>
            <Select
              value={userConfig.security.passwordPolicy}
              onValueChange={(value) => handleConfigChange('security', 'passwordPolicy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                <SelectItem value="strong">Strong (12+ chars, mixed)</SelectItem>
                <SelectItem value="enterprise">Enterprise (16+ chars, complex)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Session Timeout (minutes)</Label>
            <Select
              value={userConfig.security.sessionTimeout.toString()}
              onValueChange={(value) => handleConfigChange('security', 'sessionTimeout', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="multiple-sessions">Allow Multiple Sessions</Label>
            <Switch
              id="multiple-sessions"
              checked={userConfig.security.allowMultipleSessions}
              onCheckedChange={(checked) => handleConfigChange('security', 'allowMultipleSessions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {isCreating && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Creating User...</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="mt-2 text-xs text-gray-500">
              {progress < 30 ? 'Validating information...' :
               progress < 60 ? 'Setting up access...' :
               progress < 90 ? 'Configuring security...' :
               'Finalizing...'}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderComplianceTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Privacy & Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-consent">Data Processing Consent</Label>
              <p className="text-xs text-gray-500">User consents to data processing</p>
            </div>
            <Switch
              id="data-consent"
              checked={userConfig.compliance.dataProcessingConsent}
              onCheckedChange={(checked) => handleConfigChange('compliance', 'dataProcessingConsent', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="privacy-policy">Privacy Policy Accepted</Label>
              <p className="text-xs text-gray-500">User has accepted privacy policy</p>
            </div>
            <Switch
              id="privacy-policy"
              checked={userConfig.compliance.privacyPolicyAccepted}
              onCheckedChange={(checked) => handleConfigChange('compliance', 'privacyPolicyAccepted', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="terms-service">Terms of Service Accepted</Label>
              <p className="text-xs text-gray-500">User has accepted terms of service</p>
            </div>
            <Switch
              id="terms-service"
              checked={userConfig.compliance.termsOfServiceAccepted}
              onCheckedChange={(checked) => handleConfigChange('compliance', 'termsOfServiceAccepted', checked)}
            />
          </div>

          <div>
            <Label>Data Retention Period</Label>
            <Select
              value={userConfig.compliance.retentionPeriod}
              onValueChange={(value) => handleConfigChange('compliance', 'retentionPeriod', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1year">1 Year</SelectItem>
                <SelectItem value="3years">3 Years</SelectItem>
                <SelectItem value="5years">5 Years</SelectItem>
                <SelectItem value="7years">7 Years</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="background-check">Background Check Required</Label>
              <p className="text-xs text-gray-500">Requires background verification</p>
            </div>
            <Switch
              id="background-check"
              checked={userConfig.compliance.backgroundCheckRequired}
              onCheckedChange={(checked) => handleConfigChange('compliance', 'backgroundCheckRequired', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderIntegrationTab = () => (
    <motion.div variants={itemVariants} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Identity Provider Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Identity Provider</Label>
            <Select
              value={userConfig.integration.identityProvider}
              onValueChange={(value) => handleConfigChange('integration', 'identityProvider', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Database</SelectItem>
                <SelectItem value="ldap">LDAP/Active Directory</SelectItem>
                <SelectItem value="saml">SAML SSO</SelectItem>
                <SelectItem value="oauth">OAuth 2.0</SelectItem>
                <SelectItem value="azure">Azure AD</SelectItem>
                <SelectItem value="okta">Okta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ldap-sync">Enable LDAP Sync</Label>
              <p className="text-xs text-gray-500">Sync user data with LDAP</p>
            </div>
            <Switch
              id="ldap-sync"
              checked={userConfig.integration.ldapSync}
              onCheckedChange={(checked) => handleConfigChange('integration', 'ldapSync', checked)}
            />
          </div>

          <div>
            <Label>SSO Provider</Label>
            <Input
              value={userConfig.integration.ssoProvider}
              onChange={(e) => handleConfigChange('integration', 'ssoProvider', e.target.value)}
              placeholder="e.g., company.okta.com"
            />
          </div>

          <div>
            <Label>External User ID</Label>
            <Input
              value={userConfig.integration.externalId}
              onChange={(e) => handleConfigChange('integration', 'externalId', e.target.value)}
              placeholder="External system user identifier"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sync Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Sync Attributes</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['firstName', 'lastName', 'email', 'department', 'title', 'manager'].map((attr) => (
                <div key={attr} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sync-${attr}`}
                    checked={userConfig.integration.syncAttributes.includes(attr)}
                    onCheckedChange={(checked) => {
                      const current = userConfig.integration.syncAttributes;
                      const updated = checked 
                        ? [...current, attr]
                        : current.filter(a => a !== attr);
                      handleConfigChange('integration', 'syncAttributes', updated);
                    }}
                  />
                  <Label htmlFor={`sync-${attr}`} className="text-xs capitalize">
                    {attr.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
        style={{ width: '420px', maxHeight: '85vh' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create User</h2>
              <p className="text-sm text-gray-500">Add new team member</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
              <TabsTrigger value="access" className="text-xs">Access</TabsTrigger>
              <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
              <TabsTrigger value="integration" className="text-xs">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">{renderPersonalTab()}</TabsContent>
            <TabsContent value="access">{renderAccessTab()}</TabsContent>
            <TabsContent value="security">{renderSecurityTab()}</TabsContent>
            <TabsContent value="compliance">{renderComplianceTab()}</TabsContent>
            <TabsContent value="integration">{renderIntegrationTab()}</TabsContent>
          </Tabs>

          <div className="flex space-x-2 mt-6">
            <Button
              onClick={handleCreateUser}
              disabled={isCreating || formCompleteness < 100}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default QuickUserCreate;
