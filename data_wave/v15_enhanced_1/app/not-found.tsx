/**
 * 🔍 CUSTOM 404 NOT FOUND PAGE
 * =============================
 * 
 * Advanced 404 page for the Racine Main Manager SPA
 * Provides intelligent navigation suggestions and quick access
 * to available SPAs and resources in the data governance platform.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Database,
  Shield,
  Activity,
  BarChart3,
  Workflow,
  GitBranch,
  Bot,
  MessageSquare,
  Settings,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

// ============================================================================
// AVAILABLE ROUTES AND SPAs
// ============================================================================

interface RouteOption {
  path: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'spa' | 'racine' | 'system';
  permissions?: string[];
}

const availableRoutes: RouteOption[] = [
  // Racine Main Manager Routes
  {
    path: '/',
    title: 'Home Dashboard',
    description: 'Main dashboard with cross-SPA KPIs and system overview',
    icon: Home,
    category: 'racine'
  },
  {
    path: '/dashboard',
    title: 'Global Dashboard',
    description: 'Real-time analytics and monitoring across all data governance groups',
    icon: BarChart3,
    category: 'racine'
  },
  {
    path: '/workspace',
    title: 'Workspace Manager',
    description: 'Multi-workspace orchestration with SPA integration',
    icon: Workflow,
    category: 'racine'
  },
  {
    path: '/workflows',
    title: 'Job Workflows',
    description: 'Databricks-style workflow builder and orchestration',
    icon: Workflow,
    category: 'racine'
  },
  {
    path: '/pipelines',
    title: 'Pipeline Manager',
    description: 'Advanced pipeline design and execution management',
    icon: GitBranch,
    category: 'racine'
  },
  {
    path: '/ai-assistant',
    title: 'AI Assistant',
    description: 'Context-aware AI interface with SPA intelligence',
    icon: Bot,
    category: 'racine'
  },
  {
    path: '/activity',
    title: 'Activity Tracker',
    description: 'Historic activities and audit trails across all SPAs',
    icon: Activity,
    category: 'racine'
  },
  {
    path: '/collaboration',
    title: 'Collaboration Hub',
    description: 'Team collaboration center with real-time features',
    icon: MessageSquare,
    category: 'racine'
  },
  {
    path: '/settings',
    title: 'User Settings',
    description: 'Profile and preferences management',
    icon: Settings,
    category: 'racine'
  },

  // Data Governance SPAs
  {
    path: '/data-sources',
    title: 'Data Sources',
    description: 'Manage and monitor all data source connections',
    icon: Database,
    category: 'spa',
    permissions: ['data_sources.read']
  },
  {
    path: '/scan-rule-sets',
    title: 'Scan Rule Sets',
    description: 'Configure advanced scanning rules and policies',
    icon: Shield,
    category: 'spa',
    permissions: ['scan_rules.read']
  },
  {
    path: '/classifications',
    title: 'Classifications',
    description: 'Data classification engine and schema management',
    icon: Activity,
    category: 'spa',
    permissions: ['classifications.read']
  },
  {
    path: '/compliance-rules',
    title: 'Compliance Rules',
    description: 'Compliance policies and regulatory frameworks',
    icon: Shield,
    category: 'spa',
    permissions: ['compliance.read']
  },
  {
    path: '/advanced-catalog',
    title: 'Advanced Catalog',
    description: 'Enterprise data catalog with metadata management',
    icon: Database,
    category: 'spa',
    permissions: ['catalog.read']
  },
  {
    path: '/scan-logic',
    title: 'Advanced Scan Logic',
    description: 'Scanning algorithms and processing logic',
    icon: Activity,
    category: 'spa',
    permissions: ['scan_logic.read']
  },
  {
    path: '/rbac-system',
    title: 'RBAC System',
    description: 'Role-based access control and security management',
    icon: Shield,
    category: 'spa',
    permissions: ['rbac.admin']
  }
];

// ============================================================================
// MAIN 404 COMPONENT
// ============================================================================

export default function NotFound() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const filteredRoutes = availableRoutes.filter(route =>
    route.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'racine': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'spa': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'system': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto pt-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-muted/50 mb-6">
            <MapPin className="w-12 h-12 text-muted-foreground" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg text-muted-foreground mb-2">
            The requested page could not be found in the data governance platform.
          </p>
          
          {currentPath && (
            <p className="text-sm text-muted-foreground font-mono bg-muted/30 rounded-lg px-4 py-2 inline-block">
              Requested: {currentPath}
            </p>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button 
            onClick={() => router.back()}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => handleNavigation('/')}
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Home Dashboard
          </Button>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Available Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search for SPAs, dashboards, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Routes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredRoutes.map((route, index) => {
            const IconComponent = route.icon;
            return (
              <motion.div
                key={route.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                  onClick={() => handleNavigation(route.path)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <Badge 
                        variant="outline"
                        className={getCategoryColor(route.category)}
                      >
                        {route.category.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-2">
                      {route.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {route.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">
                        {route.path}
                      </span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* No Results */}
        {filteredRoutes.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">
              No pages found matching "{searchTerm}"
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              Clear Search
            </Button>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16 pb-8"
        >
          <p className="text-sm text-muted-foreground">
            Need help? Contact your system administrator or check the documentation.
          </p>
        </motion.div>
      </div>
    </div>
  );
}