import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  BarChart3, Plus, Upload, Download, Play, Calendar,
  Settings, Brain, Zap, Workflow, Building, Package,
  Search, CheckCircle, Network, GitBranch, TrendingUp,
  Target, AlertTriangle, Boxes, MessageSquare, Eye,
  Tag, Cpu, Activity, Lightbulb, PieChart, ChevronLeft,
  ChevronRight, Menu
} from 'lucide-react';

interface ClassificationVersion {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  components: {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
  }[];
}

interface QuickAction {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  shortcut: string;
}

interface SystemService {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
}

interface ClassificationSidebarProps {
  isOpen: boolean;
  isExpanded: boolean;
  currentVersion: string;
  onVersionChange: (version: string) => void;
  onComponentSelect: (componentId: string) => void;
  onQuickAction: (actionId: string) => void;
  onToggleExpanded: () => void;
  versions: ClassificationVersion[];
  quickActions: QuickAction[];
  systemServices: SystemService[];
  className?: string;
}

const ClassificationSidebar: React.FC<ClassificationSidebarProps> = ({
  isOpen,
  isExpanded,
  currentVersion,
  onVersionChange,
  onComponentSelect,
  onQuickAction,
  onToggleExpanded,
  versions,
  quickActions,
  systemServices,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <TooltipProvider>
      <div className={`relative bg-background border-r transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isExpanded ? 'w-64' : 'w-16'} ${className} flex flex-col h-full`}>
        
        {/* Header with Toggle */}
        <div className={`border-b transition-all duration-300 ${isExpanded ? 'p-4' : 'p-2'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              {isExpanded && (
                <div className="transition-opacity duration-300">
                  <h1 className="font-semibold text-sm">Classifications</h1>
                  <p className="text-xs text-muted-foreground">Enterprise AI</p>
                </div>
              )}
            </div>
            
            {/* Toggle Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpanded}
                  className="h-8 w-8 p-0"
                >
                  {isExpanded ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className={`flex-1 transition-all duration-300 ${isExpanded ? 'p-4' : 'p-2'}`}>
          <div className="space-y-4">
            {/* Quick Actions */}
            <div>
              {isExpanded && (
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
              )}
              <div className="space-y-1">
                {quickActions.slice(0, 4).map((action) => (
                  <Tooltip key={action.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full ${isExpanded ? 'justify-start' : 'justify-center'} ${!isExpanded ? 'px-2' : ''}`}
                        onClick={() => onQuickAction(action.id)}
                      >
                        <action.icon className={`h-4 w-4 ${isExpanded ? 'mr-2' : ''}`} />
                        {isExpanded && (
                          <>
                            {action.name}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {action.shortcut}
                            </span>
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {!isExpanded && (
                      <TooltipContent side="right">
                        <div className="text-center">
                          <div className="font-medium">{action.name}</div>
                          <div className="text-xs text-muted-foreground">{action.shortcut}</div>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Classification Versions */}
            <div>
              {isExpanded && (
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Classification Versions</h3>
              )}
              <div className="space-y-2">
                {versions.map((version) => (
                  <div key={version.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={currentVersion === version.id ? "default" : "ghost"}
                          size="sm"
                          className={`w-full ${isExpanded ? 'justify-start' : 'justify-center'} ${!isExpanded ? 'px-2' : ''}`}
                          onClick={() => onVersionChange(version.id)}
                        >
                          <version.icon className={`h-4 w-4 ${isExpanded ? 'mr-2' : ''}`} />
                          {isExpanded && version.name}
                        </Button>
                      </TooltipTrigger>
                      {!isExpanded && (
                        <TooltipContent side="right">
                          <div className="text-center">
                            <div className="font-medium">{version.name}</div>
                            <div className="text-xs text-muted-foreground">{version.description}</div>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    
                    {currentVersion === version.id && isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {version.components.map((component) => (
                          <Button
                            key={component.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => onComponentSelect(component.id)}
                          >
                            <component.icon className="h-3 w-3 mr-2" />
                            {component.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div>
              {isExpanded && (
                <h3 className="text-sm font-medium text-muted-foreground mb-2">System Status</h3>
              )}
              <div className="space-y-2">
                {isExpanded ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall</span>
                      <Badge variant="outline" className="text-green-600">
                        Healthy
                      </Badge>
                    </div>
                    {systemServices.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{service.name}</span>
                        <span className={`text-${getStatusColor(service.status)}-600`}>
                          {formatUptime(service.uptime)}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div>
                        <div className="font-medium">System Status: Healthy</div>
                        <div className="text-xs text-muted-foreground">
                          {systemServices.length} services running
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        {isExpanded && (
          <div className="p-4 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                DataWave Classifications v3.0
              </p>
              <p className="text-xs text-muted-foreground">
                Enterprise Edition
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ClassificationSidebar;
