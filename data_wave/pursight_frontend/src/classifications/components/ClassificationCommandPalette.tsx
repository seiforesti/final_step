import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Plus, Upload, Download, Play, Calendar, Settings,
  Brain, Zap, Workflow, Building, Package, CheckCircle,
  Network, GitBranch, TrendingUp, Target, AlertTriangle,
  Boxes, MessageSquare, Eye, Tag, Cpu, Activity, Lightbulb
} from 'lucide-react';

interface QuickAction {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  shortcut: string;
  category: 'action' | 'navigation' | 'component';
}

interface ClassificationVersion {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  components: {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
  }[];
}

interface ClassificationCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickAction: (actionId: string) => void;
  onVersionChange: (versionId: string) => void;
  onComponentSelect: (componentId: string) => void;
  quickActions: QuickAction[];
  versions: ClassificationVersion[];
  recentCommands?: string[];
}

const ClassificationCommandPalette: React.FC<ClassificationCommandPaletteProps> = ({
  isOpen,
  onClose,
  onQuickAction,
  onVersionChange,
  onComponentSelect,
  quickActions,
  versions,
  recentCommands = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleActionSelect = (actionId: string) => {
    onQuickAction(actionId);
    onClose();
  };

  const handleVersionSelect = (versionId: string) => {
    onVersionChange(versionId);
    onClose();
  };

  const handleComponentSelect = (componentId: string) => {
    onComponentSelect(componentId);
    onClose();
  };

  // Get all components from all versions for search
  const allComponents = versions.flatMap(v => 
    v.components.map(c => ({ ...c, versionName: v.name, versionId: v.id }))
  );

  // Filter items based on search query
  const filteredActions = quickActions.filter(action =>
    action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVersions = versions.filter(version =>
    version.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    version.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredComponents = allComponents.filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.versionName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search commands, components, and actions..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <CommandList className="max-h-[400px] overflow-y-auto">
            <CommandEmpty>No results found.</CommandEmpty>
            
            {/* Recent Commands */}
            {recentCommands.length > 0 && searchQuery === '' && (
              <CommandGroup heading="Recent">
                {recentCommands.slice(0, 3).map((command, index) => (
                  <CommandItem key={index} className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>{command}</span>
                    <Badge variant="outline" className="ml-auto">Recent</Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Quick Actions */}
            {filteredActions.length > 0 && (
              <CommandGroup heading="Quick Actions">
                {filteredActions.map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => handleActionSelect(action.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.name}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {action.shortcut}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Navigation */}
            {filteredVersions.length > 0 && (
              <CommandGroup heading="Navigation">
                {filteredVersions.map((version) => (
                  <CommandItem
                    key={version.id}
                    onSelect={() => handleVersionSelect(version.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <version.icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>Go to {version.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {version.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Components */}
            {filteredComponents.length > 0 && (
              <CommandGroup heading="Components">
                {filteredComponents.map((component) => (
                  <CommandItem
                    key={component.id}
                    onSelect={() => handleComponentSelect(component.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <component.icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>Open {component.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {component.versionName}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Help */}
            {searchQuery === '' && (
              <CommandGroup heading="Help">
                <CommandItem className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>View Documentation</span>
                  <Badge variant="outline" className="ml-auto">F1</Badge>
                </CommandItem>
                <CommandItem className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Support</span>
                </CommandItem>
                <CommandItem className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Open Settings</span>
                  <Badge variant="outline" className="ml-auto">Ctrl+,</Badge>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default ClassificationCommandPalette;
