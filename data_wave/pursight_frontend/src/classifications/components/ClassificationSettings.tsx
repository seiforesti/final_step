import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, Monitor, Bell, Shield, Palette, Database, 
  Cpu, Network, Save, RotateCcw, AlertTriangle, CheckCircle
} from 'lucide-react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  dashboard: {
    refreshInterval: number;
    defaultView: string;
    showMetrics: boolean;
    compactMode: boolean;
  };
  performance: {
    animationsEnabled: boolean;
    autoRefresh: boolean;
    cacheEnabled: boolean;
    maxConcurrentRequests: number;
  };
  security: {
    sessionTimeout: number;
    requireMFA: boolean;
    auditLogging: boolean;
  };
}

interface ClassificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
  onReset: () => void;
  isDirty: boolean;
}

const ClassificationSettings: React.FC<ClassificationSettingsProps> = ({
  isOpen,
  onClose,
  preferences,
  onSave,
  onReset,
  isDirty
}) => {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    onSave(localPreferences);
    onClose();
  };

  const handleReset = () => {
    onReset();
    setLocalPreferences(preferences);
  };

  const updatePreference = (path: string, value: any) => {
    const keys = path.split('.');
    const newPreferences = { ...localPreferences };
    let current: any = newPreferences;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setLocalPreferences(newPreferences);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[700px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
            {isDirty && (
              <Badge variant="outline" className="text-orange-600">
                Unsaved Changes
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Customize your Classifications experience and system preferences
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize the look and feel of your interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={localPreferences.theme} 
                      onValueChange={(value) => updatePreference('theme', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={localPreferences.language} 
                      onValueChange={(value) => updatePreference('language', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={localPreferences.timezone} 
                      onValueChange={(value) => updatePreference('timezone', value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Dashboard
                  </CardTitle>
                  <CardDescription>
                    Configure your dashboard layout and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="defaultView">Default View</Label>
                    <Select 
                      value={localPreferences.dashboard.defaultView} 
                      onValueChange={(value) => updatePreference('dashboard.defaultView', value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="v1-manual">Manual</SelectItem>
                        <SelectItem value="v2-ml">ML-Driven</SelectItem>
                        <SelectItem value="v3-ai">AI-Intelligent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="refreshInterval">Refresh Interval</Label>
                      <p className="text-xs text-muted-foreground">
                        {localPreferences.dashboard.refreshInterval}s
                      </p>
                    </div>
                    <Slider
                      value={[localPreferences.dashboard.refreshInterval]}
                      onValueChange={([value]) => updatePreference('dashboard.refreshInterval', value)}
                      max={300}
                      min={10}
                      step={10}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showMetrics">Show Metrics</Label>
                    <Switch
                      checked={localPreferences.dashboard.showMetrics}
                      onCheckedChange={(checked) => updatePreference('dashboard.showMetrics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="compactMode">Compact Mode</Label>
                    <Switch
                      checked={localPreferences.dashboard.compactMode}
                      onCheckedChange={(checked) => updatePreference('dashboard.compactMode', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about system events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch
                      checked={localPreferences.notifications.email}
                      onCheckedChange={(checked) => updatePreference('notifications.email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <Switch
                      checked={localPreferences.notifications.push}
                      onCheckedChange={(checked) => updatePreference('notifications.push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="desktopNotifications">Desktop Notifications</Label>
                    <Switch
                      checked={localPreferences.notifications.desktop}
                      onCheckedChange={(checked) => updatePreference('notifications.desktop', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="soundNotifications">Sound Alerts</Label>
                    <Switch
                      checked={localPreferences.notifications.sound}
                      onCheckedChange={(checked) => updatePreference('notifications.sound', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Settings */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Performance Optimization
                  </CardTitle>
                  <CardDescription>
                    Adjust settings to optimize system performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations">Enable Animations</Label>
                    <Switch
                      checked={localPreferences.performance.animationsEnabled}
                      onCheckedChange={(checked) => updatePreference('performance.animationsEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoRefresh">Auto Refresh</Label>
                    <Switch
                      checked={localPreferences.performance.autoRefresh}
                      onCheckedChange={(checked) => updatePreference('performance.autoRefresh', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="caching">Enable Caching</Label>
                    <Switch
                      checked={localPreferences.performance.cacheEnabled}
                      onCheckedChange={(checked) => updatePreference('performance.cacheEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maxRequests">Max Concurrent Requests</Label>
                      <p className="text-xs text-muted-foreground">
                        {localPreferences.performance.maxConcurrentRequests}
                      </p>
                    </div>
                    <Slider
                      value={[localPreferences.performance.maxConcurrentRequests]}
                      onValueChange={([value]) => updatePreference('performance.maxConcurrentRequests', value)}
                      max={20}
                      min={1}
                      step={1}
                      className="w-32"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security & Privacy
                  </CardTitle>
                  <CardDescription>
                    Manage your security preferences and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sessionTimeout">Session Timeout</Label>
                      <p className="text-xs text-muted-foreground">
                        {localPreferences.security.sessionTimeout} minutes
                      </p>
                    </div>
                    <Slider
                      value={[localPreferences.security.sessionTimeout]}
                      onValueChange={([value]) => updatePreference('security.sessionTimeout', value)}
                      max={480}
                      min={15}
                      step={15}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireMFA">Require Multi-Factor Authentication</Label>
                    <Switch
                      checked={localPreferences.security.requireMFA}
                      onCheckedChange={(checked) => updatePreference('security.requireMFA', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auditLogging">Enable Audit Logging</Label>
                    <Switch
                      checked={localPreferences.security.auditLogging}
                      onCheckedChange={(checked) => updatePreference('security.auditLogging', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!isDirty}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ClassificationSettings;
