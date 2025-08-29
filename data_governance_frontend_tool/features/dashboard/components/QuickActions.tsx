'use client';

import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Play, 
  Search, 
  FileText, 
  Settings, 
  Download,
  Upload,
  Zap,
  Database,
  Shield,
  ScanLine,
  Tags,
  BookOpen,
  Workflow,
  Users
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  color: string;
  permission?: string;
  badge?: string;
}

export function QuickActions() {
  const router = useRouter();
  const { checkPermission } = useAuth();

  const quickActions: QuickAction[] = [
    {
      id: 'new-scan',
      title: 'Start New Scan',
      description: 'Launch a data discovery scan',
      icon: Play,
      href: '/scan-logic/new',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      permission: 'scan:create',
    },
    {
      id: 'add-data-source',
      title: 'Add Data Source',
      description: 'Connect a new data source',
      icon: Database,
      href: '/data-sources/new',
      color: 'bg-green-50 text-green-700 hover:bg-green-100',
      permission: 'datasource:create',
    },
    {
      id: 'create-compliance-rule',
      title: 'Create Rule',
      description: 'Define a new compliance rule',
      icon: Shield,
      href: '/compliance-rules/new',
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      permission: 'compliance:create',
    },
    {
      id: 'search-catalog',
      title: 'Search Catalog',
      description: 'Find data assets quickly',
      icon: Search,
      href: '/data-catalog/search',
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    },
    {
      id: 'racine-orchestration',
      title: 'Racine Manager',
      description: 'Access the main orchestrator',
      icon: Zap,
      href: '/racine-manager',
      color: 'bg-red-50 text-red-700 hover:bg-red-100',
      badge: 'New',
      permission: 'racine:access',
    },
    {
      id: 'classification-rules',
      title: 'Classification',
      description: 'Manage data classification',
      icon: Tags,
      href: '/classifications',
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      permission: 'classification:view',
    },
    {
      id: 'scan-rule-sets',
      title: 'Scan Rules',
      description: 'Configure scan rule sets',
      icon: ScanLine,
      href: '/scan-rule-sets',
      color: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
      permission: 'scanrules:view',
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      href: '/rbac/users',
      color: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
      permission: 'user:manage',
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create compliance reports',
      icon: FileText,
      href: '/reports/new',
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
      permission: 'report:create',
    },
    {
      id: 'workflow-builder',
      title: 'Build Workflow',
      description: 'Create automated workflows',
      icon: Workflow,
      href: '/scan-logic/workflows/new',
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      permission: 'workflow:create',
    },
    {
      id: 'data-export',
      title: 'Export Data',
      description: 'Export governance data',
      icon: Download,
      action: () => handleDataExport(),
      color: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      permission: 'data:export',
    },
    {
      id: 'system-settings',
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      href: '/settings',
      color: 'bg-slate-50 text-slate-700 hover:bg-slate-100',
      permission: 'system:configure',
    },
  ];

  const handleAction = (action: QuickAction) => {
    if (action.permission && !checkPermission(action.permission)) {
      // Could show a toast or modal about insufficient permissions
      console.warn(`Insufficient permissions for action: ${action.id}`);
      return;
    }

    if (action.action) {
      action.action();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  const handleDataExport = () => {
    // This would trigger a data export process
    console.log('Initiating data export...');
    // Could open a modal or start a background job
  };

  // Filter actions based on permissions
  const availableActions = quickActions.filter(action => 
    !action.permission || checkPermission(action.permission)
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">
              Common tasks and shortcuts
            </p>
          </div>
          <Zap className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="card-content">
        {availableActions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No actions available</p>
            <p className="text-xs">Contact your administrator for access</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {availableActions.slice(0, 8).map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-sm",
                  action.color
                )}
              >
                <div className="flex-shrink-0">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">
                      {action.title}
                    </h4>
                    {action.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-white/80 rounded-full font-medium">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-75 truncate">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Show more actions link if there are more */}
        {availableActions.length > 8 && (
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => router.push('/actions')}
              className="w-full text-sm text-primary hover:text-primary/80 font-medium"
            >
              View all actions ({availableActions.length}) →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}