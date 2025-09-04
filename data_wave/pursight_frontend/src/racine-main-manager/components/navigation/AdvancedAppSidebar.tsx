"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Database, Shield, FileText, BookOpen, Scan, Users,
  BarChart3, Workflow, Zap, Bot, MessageSquare, Settings, Clock, Search,
  Pin, Unlink as Unpin, ChevronDown, Heart, ArrowRight
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";

// Simple SPA Metadata - only essential info
const SPA_METADATA = {
  "data-sources": {
    name: "Data Sources",
    icon: Database,
    color: "bg-blue-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=data_sources",
  },
  "scan-rule-sets": {
    name: "Scan Rule Sets",
    icon: Shield,
    color: "bg-purple-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=scan_rule_sets",
  },
  classifications: {
    name: "Classifications",
    icon: FileText,
    color: "bg-green-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=classifications",
  },
  "compliance-rule": {
    name: "Compliance Rules",
    icon: BookOpen,
    color: "bg-orange-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=compliance_rules",
  },
  "advanced-catalog": {
    name: "Advanced Catalog",
    icon: Scan,
    color: "bg-teal-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=advanced_catalog",
  },
  "scan-logic": {
    name: "Scan Logic",
    icon: Clock,
    color: "bg-indigo-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=scan_logic",
  },
  "rbac-system": {
    name: "RBAC System",
    icon: Users,
    color: "bg-red-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=rbac_system",
  },
};

// Simple Racine Metadata - only essential info
const RACINE_METADATA = {
  dashboard: {
    name: "Global Dashboard",
    icon: BarChart3,
    color: "bg-cyan-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=dashboard",
  },
  workspace: {
    name: "Workspace Manager",
    icon: Workflow,
    color: "bg-emerald-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=workspace",
  },
  workflows: {
    name: "Job Workflows",
    icon: Workflow,
    color: "bg-violet-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=workflows",
  },
  pipelines: {
    name: "Pipeline Manager",
    icon: Zap,
    color: "bg-yellow-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=pipelines",
  },
  ai: {
    name: "AI Assistant",
    icon: Bot,
    color: "bg-pink-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=ai_assistant",
  },
  activity: {
    name: "Activity Tracker",
    icon: Clock,
    color: "bg-slate-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=activity",
  },
  analytics: {
    name: "Intelligent Dashboard",
    icon: BarChart3,
    color: "bg-lime-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=analytics",
  },
  collaboration: {
    name: "Collaboration Hub",
    icon: MessageSquare,
    color: "bg-amber-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=collaboration",
  },
  settings: {
    name: "User Settings",
    icon: Settings,
    color: "bg-gray-500",
    route: "/v15_enhanced_1/components/racine-main-manager?view=settings",
  },
};

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const AdvancedAppSidebar: React.FC<SidebarProps> = ({
  className,
  isCollapsed = false,
  onCollapsedChange,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
      spas: true,
      racine: true,
  });

  // Simple navigation handler
  const handleNavigation = useCallback((route: string) => {
    try {
      router.push(route);
      } catch (error) {
      console.error("Navigation error:", error);
    }
  }, [router]);

  // Toggle section
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
            ...prev, 
      [section]: !prev[section as keyof typeof prev]
    }));
  }, []);

  // Filter items based on search
  const filteredSPAs = Object.entries(SPA_METADATA).filter(([key, metadata]) => {
    if (!searchQuery) return true;
    return metadata.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredRacine = Object.entries(RACINE_METADATA).filter(([key, metadata]) => {
    if (!searchQuery) return true;
    return metadata.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

             return (
             <div
               className={cn(
        "fixed left-0 top-16 bottom-0 z-40 bg-background border-r border-border",
        "transition-all duration-200",
        isCollapsed ? "w-16" : "w-64",
            className
          )}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm">Navigation</h2>
                  <Badge variant="outline" className="text-xs">
                {Object.keys(SPA_METADATA).length + Object.keys(RACINE_METADATA).length}
                  </Badge>
                </div>
              )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
            onClick={() => onCollapsedChange?.(!isCollapsed)}
                    >
                      {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                    </Button>
            </div>

            {/* Search */}
            {!isCollapsed && (
          <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Navigation Content */}
            <ScrollArea className="flex-1">
              <div className="p-1 space-y-4">
            {/* SPAs Section */}
                  <div>
              <div className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleSection("spas")}
                  >
                    <ChevronDown className={cn("w-3 h-3 transition-transform", expandedSections.spas && "rotate-180")} />
                            </Button>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Data Governance SPAs ({filteredSPAs.length})
                  </h3>
                </div>
              </div>

              <Collapsible open={expandedSections.spas}>
                      <CollapsibleContent className="space-y-1">
                  {filteredSPAs.map(([key, metadata]) => (
                    <div
                      key={key}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                        "hover:bg-muted/50 focus:bg-muted/50",
                        isCollapsed && "justify-center px-2"
                      )}
                      onClick={() => handleNavigation(metadata.route)}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", metadata.color)}>
                        <metadata.icon className="w-4 h-4 text-white" />
                      </div>
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{metadata.name}</h4>
                        </div>
                      )}
                    </div>
                  ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

            {/* Racine Features Section */}
                <div>
              <div className="px-3 py-2">
                <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                    onClick={() => toggleSection("racine")}
                      >
                    <ChevronDown className={cn("w-3 h-3 transition-transform", expandedSections.racine && "rotate-180")} />
                      </Button>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Racine Features ({filteredRacine.length})
                  </h3>
                </div>
              </div>

              <Collapsible open={expandedSections.racine}>
                    <CollapsibleContent className="space-y-1">
                  {filteredRacine.map(([key, metadata]) => (
                    <div
                      key={key}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                        "hover:bg-muted/50 focus:bg-muted/50",
                        isCollapsed && "justify-center px-2"
                      )}
                      onClick={() => handleNavigation(metadata.route)}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", metadata.color)}>
                        <metadata.icon className="w-4 h-4 text-white" />
                </div>
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{metadata.name}</h4>
                        </div>
                      )}
                </div>
                  ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
              </div>
            </ScrollArea>

            {/* Footer */}
        <div className="p-3 border-t border-border">
              {!isCollapsed && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{Object.keys(SPA_METADATA).length} SPAs</span>
                <span>{Object.keys(RACINE_METADATA).length} Features</span>
                  </div>
                </div>
              )}
            </div>
          </div>
    </div>
  );
};

export default AdvancedAppSidebar;