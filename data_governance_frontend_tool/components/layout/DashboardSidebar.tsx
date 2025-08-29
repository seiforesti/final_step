'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Database, 
  Shield, 
  Tags, 
  ScanLine, 
  BookOpen, 
  Workflow, 
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Activity,
  BarChart3,
  FileText,
  Zap,
  Layers,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Data Sources',
    href: '/data-sources',
    icon: Database,
    children: [
      { name: 'All Sources', href: '/data-sources', icon: Database },
      { name: 'Connections', href: '/data-sources/connections', icon: GitBranch },
      { name: 'Discovery', href: '/data-sources/discovery', icon: ScanLine },
      { name: 'Monitoring', href: '/data-sources/monitoring', icon: Activity },
    ],
  },
  {
    name: 'Compliance Rules',
    href: '/compliance-rules',
    icon: Shield,
    children: [
      { name: 'Rules', href: '/compliance-rules', icon: Shield },
      { name: 'Frameworks', href: '/compliance-rules/frameworks', icon: Layers },
      { name: 'Workflows', href: '/compliance-rules/workflows', icon: Workflow },
      { name: 'Reports', href: '/compliance-rules/reports', icon: FileText },
      { name: 'Audit', href: '/compliance-rules/audit', icon: Activity },
    ],
  },
  {
    name: 'Classifications',
    href: '/classifications',
    icon: Tags,
    children: [
      { name: 'Rules', href: '/classifications', icon: Tags },
      { name: 'Results', href: '/classifications/results', icon: BarChart3 },
      { name: 'ML Models', href: '/classifications/ml-models', icon: Zap },
      { name: 'Labeling', href: '/classifications/labeling', icon: Tags },
    ],
  },
  {
    name: 'Scan Rule Sets',
    href: '/scan-rule-sets',
    icon: ScanLine,
    children: [
      { name: 'Rule Sets', href: '/scan-rule-sets', icon: ScanLine },
      { name: 'Templates', href: '/scan-rule-sets/templates', icon: FileText },
      { name: 'Validation', href: '/scan-rule-sets/validation', icon: Shield },
      { name: 'Marketplace', href: '/scan-rule-sets/marketplace', icon: Database },
    ],
  },
  {
    name: 'Data Catalog',
    href: '/data-catalog',
    icon: BookOpen,
    children: [
      { name: 'Catalog', href: '/data-catalog', icon: BookOpen },
      { name: 'Lineage', href: '/data-catalog/lineage', icon: GitBranch },
      { name: 'Search', href: '/data-catalog/search', icon: ScanLine },
      { name: 'Quality', href: '/data-catalog/quality', icon: BarChart3 },
    ],
  },
  {
    name: 'Scan Logic',
    href: '/scan-logic',
    icon: Workflow,
    children: [
      { name: 'Orchestration', href: '/scan-logic', icon: Workflow },
      { name: 'Workflows', href: '/scan-logic/workflows', icon: GitBranch },
      { name: 'Performance', href: '/scan-logic/performance', icon: BarChart3 },
      { name: 'Scheduler', href: '/scan-logic/scheduler', icon: Activity },
    ],
  },
  {
    name: 'RBAC System',
    href: '/rbac',
    icon: Users,
    children: [
      { name: 'Users', href: '/rbac/users', icon: Users },
      { name: 'Roles', href: '/rbac/roles', icon: Shield },
      { name: 'Permissions', href: '/rbac/permissions', icon: Shield },
      { name: 'Groups', href: '/rbac/groups', icon: Users },
      { name: 'Access Requests', href: '/rbac/access-requests', icon: FileText },
    ],
  },
  {
    name: 'Racine Manager',
    href: '/racine-manager',
    icon: Zap,
    badge: 'New',
    children: [
      { name: 'Orchestration', href: '/racine-manager', icon: Zap },
      { name: 'Workspaces', href: '/racine-manager/workspaces', icon: Layers },
      { name: 'Workflows', href: '/racine-manager/workflows', icon: Workflow },
      { name: 'Pipelines', href: '/racine-manager/pipelines', icon: GitBranch },
      { name: 'AI Assistant', href: '/racine-manager/ai-assistant', icon: Zap },
      { name: 'Collaboration', href: '/racine-manager/collaboration', icon: Users },
    ],
  },
];

const bottomNavigation: NavItem[] = [
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isExpanded = (name: string) => expandedItems.includes(name);

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item.name);
    const active = isActive(item.href);

    return (
      <div key={item.name}>
        <div
          className={cn(
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
            level === 0 ? 'mx-2' : 'mx-4 ml-6',
            active
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className="flex items-center w-full"
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {item.badge}
                </span>
              )}
              {expanded ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </button>
          ) : (
            <Link href={item.href} className="flex items-center w-full">
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )}
        </div>

        {hasChildren && expanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border overflow-y-auto lg:block hidden">
      {/* Logo and branding */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">PurSight</h1>
            <p className="text-xs text-muted-foreground">Data Governance</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map(item => renderNavItem(item))}
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-border p-2 space-y-1">
        {bottomNavigation.map(item => renderNavItem(item))}
      </div>

      {/* User info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.first_name?.[0] || user?.email?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.organization?.name || 'Organization'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}